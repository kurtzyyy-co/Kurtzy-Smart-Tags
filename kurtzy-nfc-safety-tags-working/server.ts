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
      // Migrate existing keys to ensure bloodGroup and age exist
      for (const key in loaded) {
        if (!loaded[key].bloodGroup) {
          loaded[key].bloodGroup = loaded[key].attachmentType || "B-Positive";
        }
        if (!loaded[key].age) {
          loaded[key].age = "6 Years";
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
        allProfiles[doc.id] = { id: doc.id, ...doc.data() };
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
        return res.json({ id, ...docSnap.data() });
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

