import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// =============================================================
// SECURE INPUT SANITIZATION & OVERSIZED PAYLOAD REJECTION
// =============================================================

function sanitizeValue(val: any): any {
  if (typeof val === "string") {
    // Reject oversized strings: if any string is over 1500 characters (except base64 childPhoto), reject as unsafe
    if (val.length > 1500 && !val.startsWith("data:image")) {
      throw new Error("Input payload contains an oversized string parameter exceeding security thresholds (1500 chars).");
    }
    // Clean string from potential script injections
    return val
      .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, "")
      .replace(/<[^>]*>/g, "")
      .trim();
  }
  if (Array.isArray(val)) {
    return val.map(sanitizeValue);
  }
  if (typeof val === "object" && val !== null) {
    const sanitizedObj: any = {};
    for (const key in val) {
      sanitizedObj[key] = sanitizeValue(val[key]);
    }
    return sanitizedObj;
  }
  return val;
}

// Global middleware to sanitize and validate request parameters
app.use((req, res, next) => {
  if (req.path.startsWith("/api") && !req.path.startsWith("/api/system")) {
    if (req.method === "POST" || req.method === "PUT") {
      const contentLength = parseInt(req.headers["content-length"] || "0", 10);
      // For general profiles we allow up to 1.5MB for base64 photo payloads, otherwise reject
      if (contentLength > 1.5 * 1024 * 1024) {
        return res.status(400).json({
          error: "Payload Too Large",
          message: "Input rejection: Request payload size exceeds the maximum security threshold of 1.5MB."
        });
      }
    }

    try {
      if (req.body) req.body = sanitizeValue(req.body);
      if (req.query) req.query = sanitizeValue(req.query);
      if (req.params) req.params = sanitizeValue(req.params);
    } catch (err: any) {
      return res.status(400).json({
        error: "Bad Request",
        message: err.message || "Input validation failed. Oversized or malformed input detected."
      });
    }
  }
  next();
});

// =============================================================
// SECURE LOGIN RATE LIMITER (MAX 5 ATTEMPTS PER 15 MINUTES)
// =============================================================
const LOGIN_ATTEMPTS_LIMIT = 5;
const LOGIN_LOCKOUT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const loginRateLimiter = new Map<string, { attempts: number; lockoutUntil: number }>();

app.post("/api/admin/verify-pin", (req, res) => {
  const clientIp = (req.headers["x-forwarded-for"] as string || req.socket.remoteAddress || "127.0.0.1").split(",")[0].trim();
  const now = Date.now();

  let attemptRecord = loginRateLimiter.get(clientIp);
  if (attemptRecord && now < attemptRecord.lockoutUntil) {
    const waitMin = Math.ceil((attemptRecord.lockoutUntil - now) / 60000);
    return res.status(429).json({
      error: "Locked Out",
      message: `Security Lockout Active. Too many login attempts. Please retry in ${waitMin} minutes.`
    });
  }

  const { pin } = req.body;

  if (typeof pin !== "string" || !pin) {
    return res.status(400).json({
      error: "Bad Request",
      message: "Malformed input. PIN payload must be a string."
    });
  }

  // Validate standard security PIN on the server
  if (pin === "0815") {
    loginRateLimiter.delete(clientIp);
    return res.json({ success: true, token: "kurtzy_master_admin_session_granted" });
  } else {
    if (!attemptRecord || now > attemptRecord.lockoutUntil) {
      attemptRecord = { attempts: 0, lockoutUntil: 0 };
    }
    attemptRecord.attempts++;

    if (attemptRecord.attempts >= LOGIN_ATTEMPTS_LIMIT) {
      attemptRecord.lockoutUntil = now + LOGIN_LOCKOUT_WINDOW_MS;
      loginRateLimiter.set(clientIp, attemptRecord);
      return res.status(429).json({
        error: "Locked Out",
        message: "Security Lockout Activated. You have exceeded the limit of 5 login attempts. Please wait 15 minutes before retrying."
      });
    } else {
      loginRateLimiter.set(clientIp, attemptRecord);
      const remaining = LOGIN_ATTEMPTS_LIMIT - attemptRecord.attempts;
      return res.status(401).json({
        error: "Unauthorized",
        message: `Incorrect Security PIN. You have ${remaining} attempts remaining before a 15-minute lockout.`,
        remainingAttempts: remaining
      });
    }
  }
});

// =============================================================
// RATE LIMITER & LOAD BALANCER INFRASTRUCTURE
// =============================================================

interface LbNode {
  id: string;
  name: string;
  status: "ONLINE" | "OFFLINE" | "DEGRADED";
  weight: number;
  activeConnections: number;
  totalRequests: number;
  cpuUsage: number;
  memoryUsage: number;
  responseTimeMs: number;
}

interface RequestLog {
  timestamp: string;
  ip: string;
  method: string;
  url: string;
  node: string;
  status: number;
  rateLimitStatus: "ALLOWED" | "BLOCKED";
}

let lbNodes: LbNode[] = [
  { id: "node-alpha", name: "Node-Alpha (Primary US)", status: "ONLINE", weight: 1, activeConnections: 0, totalRequests: 0, cpuUsage: 12, memoryUsage: 45, responseTimeMs: 25 },
  { id: "node-beta", name: "Node-Beta (Secondary EU)", status: "ONLINE", weight: 1, activeConnections: 0, totalRequests: 0, cpuUsage: 8, memoryUsage: 38, responseTimeMs: 45 },
  { id: "node-gamma", name: "Node-Gamma (Edge APAC)", status: "ONLINE", weight: 2, activeConnections: 0, totalRequests: 0, cpuUsage: 15, memoryUsage: 52, responseTimeMs: 15 }
];

let lbAlgorithm: "ROUND_ROBIN" | "LEAST_CONNECTIONS" | "RANDOM" = "ROUND_ROBIN";
let roundRobinIndex = 0;

interface RateLimiterConfig {
  enabled: boolean;
  windowMs: number;
  maxRequests: number;
}

let rateLimiterConfig: RateLimiterConfig = {
  enabled: true,
  windowMs: 60000, // 1 minute
  maxRequests: 30 // allow 30 requests per minute by default for interactive demo
};

// Client ip tracker
const clientRequests = new Map<string, { count: number; resetTime: number }>();
const blockedIPs = new Map<string, { blockedAt: number; unblockAt: number }>();

let recentRequestsList: RequestLog[] = [];

function logRequest(ip: string, method: string, url: string, node: string, status: number, rateLimitStatus: "ALLOWED" | "BLOCKED") {
  const log: RequestLog = {
    timestamp: new Date().toLocaleTimeString(),
    ip,
    method,
    url,
    node,
    status,
    rateLimitStatus
  };
  recentRequestsList.unshift(log);
  if (recentRequestsList.length > 20) {
    recentRequestsList.pop();
  }
}

// Function to choose next node
function selectLoadBalancerNode(): LbNode | null {
  const onlineNodes = lbNodes.filter(n => n.status !== "OFFLINE");
  if (onlineNodes.length === 0) return null;

  if (lbAlgorithm === "RANDOM") {
    const randomIndex = Math.floor(Math.random() * onlineNodes.length);
    return onlineNodes[randomIndex];
  } else if (lbAlgorithm === "LEAST_CONNECTIONS") {
    let minNode = onlineNodes[0];
    for (let i = 1; i < onlineNodes.length; i++) {
      if (onlineNodes[i].activeConnections < minNode.activeConnections) {
        minNode = onlineNodes[i];
      }
    }
    return minNode;
  } else {
    // ROUND_ROBIN
    const node = onlineNodes[roundRobinIndex % onlineNodes.length];
    roundRobinIndex = (roundRobinIndex + 1) % onlineNodes.length;
    return node;
  }
}

// Decay node metrics periodically so they look dynamic
setInterval(() => {
  lbNodes.forEach(node => {
    if (node.status === "OFFLINE") {
      node.cpuUsage = 0;
      node.memoryUsage = 0;
      node.responseTimeMs = 0;
      node.activeConnections = 0;
      return;
    }

    const baseCpu = node.id === "node-alpha" ? 10 : node.id === "node-beta" ? 6 : 12;
    const baseMemory = node.id === "node-alpha" ? 42 : node.id === "node-beta" ? 35 : 48;
    const baseResponseTime = node.id === "node-alpha" ? 20 : node.id === "node-beta" ? 40 : 12;

    const targetCpu = Math.min(95, baseCpu + (node.activeConnections * 15) + (Math.random() * 6 - 3));
    node.cpuUsage = Math.round(node.cpuUsage * 0.7 + targetCpu * 0.3);

    const targetMemory = Math.min(90, baseMemory + (node.totalRequests % 10) * 0.5 + (Math.random() * 2 - 1));
    node.memoryUsage = Math.round(node.memoryUsage * 0.9 + targetMemory * 0.1);

    const targetLatency = Math.round(baseResponseTime + (node.cpuUsage * 0.5) + (Math.random() * 4 - 2));
    node.responseTimeMs = Math.max(5, Math.round(node.responseTimeMs * 0.8 + targetLatency * 0.2));
  });

  const now = Date.now();
  blockedIPs.forEach((val, ip) => {
    if (now > val.unblockAt) {
      blockedIPs.delete(ip);
    }
  });
}, 3000);

// Rate Limiter + Load Balancer Interceptor middleware
app.use((req, res, next) => {
  // Only intercept /api routes (exclude static assets and system metrics config routes)
  if (!req.path.startsWith("/api") || req.path.startsWith("/api/system")) {
    return next();
  }

  const clientIp = (req.headers["x-forwarded-for"] as string || req.socket.remoteAddress || "127.0.0.1").split(",")[0].trim();
  const now = Date.now();

  // 1. Check Rate Limiter
  if (rateLimiterConfig.enabled) {
    if (blockedIPs.has(clientIp)) {
      const blockInfo = blockedIPs.get(clientIp)!;
      if (now < blockInfo.unblockAt) {
        const retryAfterSeconds = Math.ceil((blockInfo.unblockAt - now) / 1000);
        res.setHeader("Retry-After", retryAfterSeconds);
        logRequest(clientIp, req.method, req.path, "BLOCKED", 429, "BLOCKED");
        return res.status(429).json({
          error: "Too Many Requests",
          message: "Your IP has been flagged for rapid fire. Cool down for a few seconds to prevent overload.",
          retryAfterSeconds
        });
      } else {
        blockedIPs.delete(clientIp);
      }
    }

    let clientRecord = clientRequests.get(clientIp);
    if (!clientRecord || now > clientRecord.resetTime) {
      clientRecord = { count: 0, resetTime: now + rateLimiterConfig.windowMs };
    }

    clientRecord.count++;
    clientRequests.set(clientIp, clientRecord);

    const remaining = Math.max(0, rateLimiterConfig.maxRequests - clientRecord.count);
    res.setHeader("X-RateLimit-Limit", rateLimiterConfig.maxRequests);
    res.setHeader("X-RateLimit-Remaining", remaining);
    res.setHeader("X-RateLimit-Reset", Math.ceil(clientRecord.resetTime / 1000));

    if (clientRecord.count > rateLimiterConfig.maxRequests) {
      blockedIPs.set(clientIp, { blockedAt: now, unblockAt: now + 15000 });
      logRequest(clientIp, req.method, req.path, "BLOCKED", 429, "BLOCKED");
      return res.status(429).json({
        error: "Too Many Requests",
        message: "Request limit exceeded. You have made too many API calls in a short period.",
        retryAfterSeconds: 15
      });
    }
  }

  // 2. Select Load Balancer Node
  const selectedNode = selectLoadBalancerNode();
  if (!selectedNode) {
    logRequest(clientIp, req.method, req.path, "NONE", 503, "ALLOWED");
    return res.status(503).json({ error: "Service Unavailable", message: "All virtual load balancer nodes are offline." });
  }

  selectedNode.activeConnections++;
  res.setHeader("X-Load-Balanced-Node", selectedNode.name);

  res.on("finish", () => {
    selectedNode.activeConnections = Math.max(0, selectedNode.activeConnections - 1);
    selectedNode.totalRequests++;
    logRequest(clientIp, req.method, req.path, selectedNode.name, res.statusCode, "ALLOWED");
  });

  next();
});

// -------------------------------------------------------------
// SYSTEM CONFIGURATION & INFRASTRUCTURE MONITOR APIS
// -------------------------------------------------------------

app.get("/api/system/metrics", (req, res) => {
  const activeClientsCount = Array.from(clientRequests.values()).filter(c => Date.now() < c.resetTime).length;
  res.json({
    nodes: lbNodes,
    algorithm: lbAlgorithm,
    rateLimiter: {
      enabled: rateLimiterConfig.enabled,
      maxRequests: rateLimiterConfig.maxRequests,
      windowMs: rateLimiterConfig.windowMs,
      activeClients: activeClientsCount,
      blockedCount: blockedIPs.size,
      blockedIPsList: Array.from(blockedIPs.keys())
    },
    recentRequests: recentRequestsList
  });
});

app.post("/api/system/configure", (req, res) => {
  const { algorithm, rateLimitEnabled, maxRequests, nodeStatuses } = req.body;

  if (algorithm && ["ROUND_ROBIN", "LEAST_CONNECTIONS", "RANDOM"].includes(algorithm)) {
    lbAlgorithm = algorithm;
  }

  if (typeof rateLimitEnabled === "boolean") {
    rateLimiterConfig.enabled = rateLimitEnabled;
  }

  if (typeof maxRequests === "number" && maxRequests > 0) {
    rateLimiterConfig.maxRequests = maxRequests;
  }

  if (nodeStatuses && typeof nodeStatuses === "object") {
    lbNodes.forEach(node => {
      if (nodeStatuses[node.id] && ["ONLINE", "OFFLINE", "DEGRADED"].includes(nodeStatuses[node.id])) {
        node.status = nodeStatuses[node.id];
      }
    });
  }

  res.json({
    success: true,
    message: "System settings updated successfully",
    config: {
      algorithm: lbAlgorithm,
      rateLimiter: rateLimiterConfig,
      nodes: lbNodes
    }
  });
});

app.post("/api/system/simulate-traffic", (req, res) => {
  const { count = 10, isBurst = false } = req.body;
  const simulatedCount = Math.min(50, Math.max(1, count));
  
  const paths = ["/api/profiles", "/api/profiles/kurtzy-huzz", "/api/profiles/test-id"];
  const methods = ["GET", "GET", "GET", "POST"];
  const ipPool = ["192.168.1.105", "10.0.0.42", "172.16.254.12", "8.8.8.8", "127.0.0.1"];

  for (let i = 0; i < simulatedCount; i++) {
    const ip = ipPool[Math.floor(Math.random() * ipPool.length)];
    const method = methods[Math.floor(Math.random() * methods.length)];
    const path = paths[Math.floor(Math.random() * paths.length)];
    const node = selectLoadBalancerNode();
    
    if (!node) continue;

    node.totalRequests++;
    
    if (isBurst) {
      node.cpuUsage = Math.min(98, node.cpuUsage + 12);
      node.responseTimeMs = Math.min(220, node.responseTimeMs + 25);
    } else {
      node.cpuUsage = Math.min(95, node.cpuUsage + 2);
    }

    logRequest(ip, method, path, node.name, 200, "ALLOWED");
  }

  res.json({ success: true, message: `Simulated ${simulatedCount} distributed requests across nodes.` });
});

app.post("/api/system/reset-limits", (req, res) => {
  clientRequests.clear();
  blockedIPs.clear();
  lbNodes.forEach(n => {
    n.totalRequests = 0;
    n.activeConnections = 0;
  });
  recentRequestsList = [];
  res.json({ success: true, message: "System logs and metrics reset completed." });
});

interface Contact {
  role: string;
  name: string;
  phone: string;
}

interface TagProfile {
  id: string;
  childName: string;
  childPhoto?: string;
  contacts: Contact[];
  tagColor: string;
  bloodGroup: string;
  age: string;
  dob?: string;
  engravingText: string;
  adEmail?: string;
  adWhatsapp?: string;
  adInstagram?: string;
  userId?: string;
}

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const isFirebaseConfigured = !!(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== "MY_FIREBASE_API_KEY" &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
);

let db: any = null;

if (isFirebaseConfigured) {
  try {
    const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(firebaseApp);
    console.log("Firebase initialized successfully on server backend!");
  } catch (err) {
    console.error("Failed to initialize Firebase on server backend:", err);
  }
} else {
  console.log("Firebase environment variables are missing on the server. Falling back to local JSON store.");
}

// Durable profile store (saves edits to profile-db.json so they survive server restarts and redeployments)
const DB_FILE = path.join(process.cwd(), "profile-db.json");

function loadProfiles(): Record<string, TagProfile> {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      const loaded = JSON.parse(data);
      // Migrate existing keys to ensure bloodGroup, age, and dob exist
      for (const key in loaded) {
        if (!loaded[key].bloodGroup) {
          loaded[key].bloodGroup = loaded[key].attachmentType || "B-Positive";
        }
        if (!loaded[key].age) {
          loaded[key].age = "6 Years";
        }
        if (!loaded[key].dob) {
          loaded[key].dob = "15/08/2020";
        }
        if (loaded[key].childName === "Huzaifa Meowiee") {
          loaded[key].childName = "Huzaifa Firoz";
        }
      }
      return loaded;
    }
  } catch (err) {
    console.error("Error loading profiles from disk, using default:", err);
  }

  // Fallback defaults featuring Ayesha Fatima
  return {
    "kurtzy-huzz": {
      id: "kurtzy-huzz",
      childName: "Ayesha Fatima",
      childPhoto: "",
      contacts: [
        { role: "Mom", name: "Sarah Miller", phone: "+1 (555) 019-2834" },
        { role: "Dad", name: "Robert Miller", phone: "+1 (555) 019-2835" }
      ],
      tagColor: "transparent",
      bloodGroup: "B-Positive",
      age: "6 Years",
      dob: "15/08/2020",
      engravingText: "Ayesha F. — One Tap Away",
      adEmail: "order@kurtzytags.com",
      adWhatsapp: "+1 (555) 019-2834",
      adInstagram: "@kurtzytags"
    }
  };
}

const profiles: Record<string, TagProfile> = loadProfiles();

function saveProfiles() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(profiles, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save profiles to disk:", err);
  }
}

// -------------------------------------------------------------
// PROFILE DATA APIS (RESTFUL & SAFE)
// -------------------------------------------------------------

// Get all profiles (for multi-profile management list)
app.get("/api/profiles", async (req, res) => {
  if (db) {
    try {
      const { getDocs, collection } = await import("firebase/firestore");
      const querySnapshot = await getDocs(collection(db, "profiles"));
      const allProfiles: Record<string, any> = {};
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data && data.childName === "Huzaifa Meowiee") {
          data.childName = "Huzaifa Firoz";
        }
        allProfiles[doc.id] = { id: doc.id, ...data };
      });
      // Merge with local profiles as defaults
      const merged = { ...profiles, ...allProfiles };
      return res.json(merged);
    } catch (err: any) {
      console.error("Error fetching all profiles from Firestore:", err);
      return res.json(profiles);
    }
  }
  res.json(profiles);
});

// Get tag profile
app.get("/api/profiles/:id", async (req, res) => {
  const { id } = req.params;

  if (db) {
    try {
      const docRef = doc(db, "profiles", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && data.childName === "Huzaifa Meowiee") {
          data.childName = "Huzaifa Firoz";
        }
        return res.json({ id, ...data });
      } else {
        // Fallback to local profile cache
        const localProfile = profiles[id];
        if (localProfile) {
          return res.json(localProfile);
        }
        return res.status(404).json({ error: "Profile not found" });
      }
    } catch (err: any) {
      console.error("Error fetching profile from Firestore:", err);
      const localProfile = profiles[id];
      if (localProfile) return res.json(localProfile);
      return res.status(500).json({ error: err.message });
    }
  }

  const profile = profiles[id];
  if (!profile) {
    return res.status(404).json({ error: "Profile not found" });
  }
  res.json(profile);
});

// Create or update tag profile
app.post("/api/profiles", async (req, res) => {
  const profile: TagProfile = req.body;
  if (!profile.id || !profile.childName || !profile.contacts?.length) {
    return res.status(400).json({ error: "Missing required profile fields" });
  }

  // Update local JSON cache
  profiles[profile.id] = profile;
  saveProfiles();

  if (db) {
    try {
      const docRef = doc(db, "profiles", profile.id);
      const { id, ...dataToSave } = profile;
      await setDoc(docRef, dataToSave, { merge: true });
      console.log(`Profile "${profile.id}" successfully updated in Firebase Firestore!`);
      return res.json(profile);
    } catch (err: any) {
      console.error("Error saving profile to Firestore:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  res.json(profile);
});

// Delete tag profile from both local store and Firebase Firestore
app.delete("/api/profiles/:id", async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: "Missing profile ID" });
  }

  // Delete from local memory and JSON file
  delete profiles[id];
  saveProfiles();

  if (db) {
    try {
      const { deleteDoc, doc: fsDoc } = await import("firebase/firestore");
      const docRef = fsDoc(db, "profiles", id);
      await deleteDoc(docRef);
      console.log(`Profile "${id}" successfully deleted from Firebase Firestore!`);
    } catch (err: any) {
      console.error(`Error deleting profile "${id}" from Firestore:`, err);
      return res.status(500).json({ error: err.message });
    }
  }

  res.json({ success: true, id });
});

// -------------------------------------------------------------
// VITE DEV SERVER OR PRODUCTION SERVING
// -------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // In dev mode, mount Vite as middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    // In prod mode, serve static assets from dist
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on http://localhost:${PORT}`);
  });
}

startServer();

