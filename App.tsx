import React, { useState, useEffect, useRef } from "react";
import { 
  Phone, 
  Shield, 
  Check, 
  AlertCircle, 
  User, 
  Save, 
  RefreshCw, 
  Lock, 
  Unlock,
  Plus, 
  Trash2,
  ExternalLink,
  Megaphone,
  Mail,
  MessageCircle,
  Instagram,
  Copy,
  Eye,
  LogOut,
  ChevronRight,
  ChevronDown,
  Search,
  Database,
  Server,
  Zap,
  Sliders,
  Cpu,
  Layers,
  Wifi,
  Activity,
  ShieldAlert,
  Play,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { TagProfile, Contact } from "./types";
import { QRCodeSVG } from "qrcode.react";

// Firebase integration
import { 
  doc, 
  onSnapshot, 
  getDoc, 
  collection, 
  getDocs, 
  setDoc,
  query,
  where
} from "firebase/firestore";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { db, auth, isFirebaseConfigured } from "./firebase";

// Robust age calculation from DOB dd/mm/yyyy
export function calculateAge(dobString?: string): string {
  if (!dobString) return "N/A";
  const parts = dobString.split('/');
  if (parts.length !== 3) return "N/A";
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  if (isNaN(day) || isNaN(month) || isNaN(year)) return "N/A";

  const dob = new Date(year, month - 1, day);
  const today = new Date();
  if (dob.toString() === "Invalid Date") return "N/A";

  let years = today.getFullYear() - dob.getFullYear();
  let months = today.getMonth() - dob.getMonth();
  let days = today.getDate() - dob.getDate();

  if (days < 0) {
    months--;
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  if (years < 0) return "N/A";

  if (years === 0) {
    if (months === 0) {
      return "Under a month";
    }
    return `${months} ${months === 1 ? 'Month' : 'Months'}`;
  } else {
    if (months === 0) {
      return `${years} ${years === 1 ? 'Year' : 'Years'}`;
    }
    return `${years} ${years === 1 ? 'Year' : 'Years'} ${months} ${months === 1 ? 'Month' : 'Months'}`;
  }
}

interface SkeletonScreenProps {
  isAdmin?: boolean;
}

function SkeletonScreen({ isAdmin = false }: SkeletonScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="w-full"
    >
      <div className="flex flex-col gap-12">
        {/* Dynamic Header Banner Skeleton */}
        <div className="text-center max-w-2xl mx-auto space-y-4 animate-pulse">
          <div className="h-4 w-28 bg-slate-800/80 rounded-full mx-auto" />
          <div className="h-9 sm:h-10 w-72 sm:w-96 bg-slate-800 rounded-xl mx-auto" />
          <div className="space-y-2 max-w-md mx-auto">
            <div className="h-3 w-full bg-slate-900/70 rounded" />
            <div className="h-3 w-5/6 bg-slate-900/70 rounded mx-auto" />
          </div>
        </div>

        {/* Core Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: INTERACTIVE TAG PREVIEW & SUMMARY (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6 animate-pulse">
            
            {/* Visual 3D acrylic NFC Tag Container Skeleton */}
            <div className="bg-slate-900/20 border border-slate-800/50 rounded-2xl p-6 relative overflow-hidden flex flex-col items-center justify-center min-h-[360px] shadow-sm">
              <div className="absolute top-2 left-3 flex items-center gap-1.5 text-[10px] text-slate-700 uppercase tracking-widest font-mono">
                <RefreshCw className="w-3 h-3 animate-spin text-slate-800" />
                <span>Simulating Layout...</span>
              </div>

              {/* Central RFID/NFC Tag Structure Loading representation */}
              <div className="relative w-52 h-52 flex items-center justify-center">
                {/* Physical Tag Ring Backdrop Glow simulation */}
                <div className="absolute inset-2 rounded-full bg-slate-900/30 border border-slate-800/40 blur-sm" />

                {/* Outer Resin Acrylic Dial */}
                <div className="w-44 h-44 rounded-full border-4 border-slate-800/50 p-1.5 flex items-center justify-center bg-slate-950/20">
                  {/* Central Core */}
                  <div className="w-full h-full rounded-full border-2 border-slate-800/30 bg-slate-950/60 flex flex-col items-center justify-center p-3 text-center relative overflow-hidden">
                    <div className="absolute w-12 h-12 rounded-full border border-dashed border-slate-800/30 flex items-center justify-center">
                      <div className="w-4 h-4 rounded-md bg-slate-900" />
                    </div>

                    <div className="h-2.5 w-14 bg-slate-800/60 rounded mt-3" />
                    <div className="h-4 w-24 bg-slate-800 rounded mt-4" />
                    <div className="h-2 w-16 bg-slate-900 rounded mt-3" />

                    <div className="absolute bottom-2 flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                      <div className="h-1.5 w-12 bg-slate-850 rounded" />
                    </div>
                  </div>
                </div>

                {/* Silicone strap / Loop illustration */}
                <div className="absolute top-[-30px] w-8 h-20 bg-slate-900/60 rounded-2xl border-2 border-slate-850 shadow-md -z-10 flex flex-col items-center justify-start py-2">
                  <div className="w-3 h-3 rounded-full bg-slate-950 border border-slate-800" />
                </div>
              </div>

              {/* Tag parameters skeleton */}
              <div className="w-full mt-6 border-t border-slate-850/60 pt-4 flex items-center justify-between">
                <div className="space-y-1.5">
                  <div className="h-2 w-16 bg-slate-900 rounded" />
                  <div className="h-3.5 w-10 bg-slate-800 rounded" />
                </div>
                <div className="space-y-1.5 text-right flex flex-col items-end">
                  <div className="h-2 w-16 bg-slate-900 rounded" />
                  <div className="h-3.5 w-12 bg-slate-800 rounded" />
                </div>
              </div>
            </div>

            {/* Quick Profile Summary Box Skeleton */}
            <div className="bg-slate-900/20 border border-slate-800/50 rounded-2xl p-6 shadow-sm text-left space-y-4">
              <div className="h-4 w-32 bg-slate-800 rounded" />
              <div className="space-y-3 pt-1">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-850/60">
                  <div className="h-3 w-20 bg-slate-900 rounded" />
                  <div className="h-4 w-24 bg-slate-800 rounded" />
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-850/60">
                  <div className="h-3 w-24 bg-slate-900 rounded" />
                  <div className="h-3 w-16 bg-slate-850 rounded font-mono" />
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <div className="h-3 w-16 bg-slate-900 rounded" />
                  <div className="h-3 w-24 bg-slate-850 rounded" />
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT: EMERGENCY CONTACTS & WORKSPACE / ADVERTISING (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-8 text-left animate-pulse">
            
            {isAdmin ? (
              /* ADMIN CUSTOMIZER WORKSPACE SKELETON */
              <div className="bg-slate-900/20 border border-slate-800/50 rounded-2xl p-6 shadow-xl space-y-6">
                {/* Switcher & Creator workspace */}
                <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-2 w-full sm:w-auto">
                    <div className="h-2.5 w-32 bg-slate-900 rounded" />
                    <div className="h-4 w-44 bg-slate-800 rounded" />
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto self-stretch sm:self-auto">
                    <div className="h-8 w-28 bg-slate-850 rounded-lg flex-1 sm:flex-initial" />
                    <div className="h-8 w-24 bg-slate-850 rounded-lg" />
                  </div>
                </div>

                {/* Shareable Link Helper */}
                <div className="p-4 bg-slate-950/20 border border-slate-850/60 rounded-xl space-y-2.5">
                  <div className="flex justify-between items-center">
                    <div className="h-3 w-36 bg-slate-850 rounded" />
                    <div className="h-2 w-16 bg-slate-900 rounded" />
                  </div>
                  <div className="h-8 w-full bg-slate-950 rounded-lg" />
                </div>

                {/* Form fields section */}
                <div className="space-y-4 border-t border-slate-850/60 pt-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="h-2.5 w-16 bg-slate-900 rounded" />
                      <div className="h-10 w-full bg-slate-950/50 rounded-xl border border-slate-850/40" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-2.5 w-20 bg-slate-900 rounded" />
                      <div className="h-10 w-full bg-slate-950/50 rounded-xl border border-slate-850/40" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <div className="h-2.5 w-24 bg-slate-900 rounded" />
                      <div className="h-10 w-full bg-slate-950/50 rounded-xl border border-slate-850/40" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-2.5 w-16 bg-slate-900 rounded" />
                      <div className="h-10 w-full bg-slate-950/50 rounded-xl border border-slate-850/40" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-2.5 w-16 bg-slate-900 rounded" />
                      <div className="h-10 w-full bg-slate-950/50 rounded-xl border border-slate-850/40" />
                    </div>
                  </div>
                </div>

                {/* Contacts Customizer */}
                <div className="space-y-4 border-t border-slate-850/60 pt-5">
                  <div className="flex justify-between items-center">
                    <div className="h-3.5 w-28 bg-slate-800 rounded" />
                    <div className="h-6 w-24 bg-slate-850 rounded" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row items-center gap-2 bg-slate-950/30 p-3 rounded-xl border border-slate-850/40">
                      <div className="h-8 w-full sm:w-1/4 bg-slate-900 rounded-lg" />
                      <div className="h-8 w-full sm:w-2/5 bg-slate-900 rounded-lg" />
                      <div className="h-8 w-full sm:w-1/3 bg-slate-900 rounded-lg" />
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-2 bg-slate-950/30 p-3 rounded-xl border border-slate-850/40">
                      <div className="h-8 w-full sm:w-1/4 bg-slate-900 rounded-lg" />
                      <div className="h-8 w-full sm:w-2/5 bg-slate-900 rounded-lg" />
                      <div className="h-8 w-full sm:w-1/3 bg-slate-900 rounded-lg" />
                    </div>
                  </div>
                </div>

                {/* Save Bar */}
                <div className="border-t border-slate-850/60 pt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="h-3 w-32 bg-slate-900 rounded" />
                  <div className="h-10 w-44 bg-slate-800 rounded-xl" />
                </div>
              </div>
            ) : (
              /* OBSERVER PORTAL HUB SKELETON */
              <div className="space-y-8">
                
                {/* Emergency Deck card */}
                <div className="bg-slate-900/20 border border-slate-800/50 rounded-2xl p-6 shadow-xl space-y-5">
                  <div className="flex justify-between items-center border-b border-slate-850/60 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-slate-800" />
                      <div className="h-3.5 w-36 bg-slate-800 rounded" />
                    </div>
                    <div className="h-2.5 w-24 bg-slate-900 rounded" />
                  </div>

                  {/* Pledge Box */}
                  <div className="bg-slate-950/40 p-4 rounded-xl space-y-2 border border-slate-850/40">
                    <div className="h-2.5 w-28 bg-slate-850 rounded" />
                    <div className="space-y-1.5">
                      <div className="h-2 w-full bg-slate-900" />
                      <div className="h-2 w-5/6 bg-slate-900" />
                    </div>
                  </div>

                  {/* Verified Contacts Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-850/40 flex items-center justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="h-3.5 w-12 bg-slate-900 rounded" />
                        <div className="h-4 w-28 bg-slate-800 rounded" />
                        <div className="h-2 w-20 bg-slate-900 rounded" />
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-slate-900" />
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-850/40 flex items-center justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="h-3.5 w-12 bg-slate-900 rounded" />
                        <div className="h-4 w-24 bg-slate-800 rounded" />
                        <div className="h-2 w-20 bg-slate-900 rounded" />
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-slate-900" />
                    </div>
                  </div>
                </div>

                {/* Marketing & Ordering Card */}
                <div className="bg-gradient-to-br from-slate-900/40 to-slate-950/40 border border-slate-800/50 rounded-2xl p-8 space-y-6 relative overflow-hidden">
                  <div className="h-3 w-28 bg-slate-850 rounded" />
                  
                  <div className="space-y-2">
                    <div className="h-6 w-3/4 bg-slate-800 rounded" />
                    <div className="h-4 w-1/2 bg-slate-900 rounded" />
                  </div>

                  {/* Channels */}
                  <div className="border-l-2 border-slate-800/80 pl-6 space-y-4 py-2">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="h-3 w-28 bg-slate-900" />
                      <div className="h-5 w-36 bg-slate-850 rounded-lg" />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="h-3 w-32 bg-slate-900" />
                      <div className="h-5 w-32 bg-slate-850 rounded-lg" />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="h-3 w-28 bg-slate-900" />
                      <div className="h-5 w-24 bg-slate-850 rounded-lg" />
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="border-t border-slate-850/60 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="h-3.5 w-52 bg-slate-900" />
                    <div className="h-10 w-full sm:w-44 bg-slate-800 rounded-xl" />
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function App() {
  // Mode state: 'observer' (default for viewers) or 'admin' (unlocked via PIN or Auth)
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>("");
  const [pinError, setPinError] = useState<string>("");

  // Firebase Auth states
  const [authTab, setAuthTab] = useState<"pin" | "cloud">("pin");
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [emailInput, setEmailInput] = useState<string>("");
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>("");
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  // Dynamic Profile states
  const [currentProfileId, setCurrentProfileId] = useState<string>(() => {
    // Determine profile ID from URL path or parameter (e.g., /profile-1 or ?profile=profile-1)
    const path = window.location.pathname.replace(/^\/+|\/+$/g, "");
    const searchParams = new URLSearchParams(window.location.search);
    const queryId = searchParams.get("profile") || searchParams.get("id");
    if (queryId) return queryId;
    if (path && !path.includes(".") && !path.startsWith("api")) {
      return path;
    }
    return "kurtzy-huzz"; // Fallback default
  });

  // Tag profile state
  const [profile, setProfile] = useState<TagProfile>({
    id: "kurtzy-huzz",
    childName: "Ayesha Fatima",
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
  });

  const [allProfiles, setAllProfiles] = useState<Record<string, TagProfile>>({});
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newProfileId, setNewProfileId] = useState<string>("");
  const [newProfileName, setNewProfileName] = useState<string>("");

  // Compliance & Data Policy Center state
  const [showComplianceModal, setShowComplianceModal] = useState<boolean>(false);
  const [complianceTab, setComplianceTab] = useState<"terms" | "privacy" | "gdpr">("terms");
  const [cookieAccepted, setCookieAccepted] = useState<boolean>(() => {
    return localStorage.getItem("kurtzy_cookie_consent") === "true";
  });

  // UI state
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Searchable dropdown state for switching profiles
  const [profileSearchQuery, setProfileSearchQuery] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // =============================================================
  // SYSTEM HEALTH & INFRASTRUCTURE GATEWAY STATE & HANDLERS
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

  interface SystemMetrics {
    nodes: LbNode[];
    algorithm: "ROUND_ROBIN" | "LEAST_CONNECTIONS" | "RANDOM";
    rateLimiter: {
      enabled: boolean;
      maxRequests: number;
      windowMs: number;
      activeClients: number;
      blockedCount: number;
      blockedIPsList: string[];
    };
    recentRequests: RequestLog[];
  }

  const fetchJsonSafely = async (url: string, options?: RequestInit) => {
    try {
      const res = await fetch(url, options);
      if (!res.ok) return null;
      const contentType = res.headers.get("content-type");
      if (contentType && !contentType.includes("application/json")) {
        return null;
      }
      return await res.json();
    } catch (e) {
      return null;
    }
  };

  const [useServerBackend, setUseServerBackend] = useState<boolean>(true);
  const [localNodes, setLocalNodes] = useState<LbNode[]>([
    { id: "node-alpha", name: "Node-Alpha (Primary US)", status: "ONLINE", weight: 1, activeConnections: 0, totalRequests: 0, cpuUsage: 12, memoryUsage: 45, responseTimeMs: 25 },
    { id: "node-beta", name: "Node-Beta (Secondary EU)", status: "ONLINE", weight: 1, activeConnections: 0, totalUsage: 0, cpuUsage: 8, memoryUsage: 38, responseTimeMs: 45 } as any,
    { id: "node-gamma", name: "Node-Gamma (Edge APAC)", status: "ONLINE", weight: 2, activeConnections: 0, totalRequests: 0, cpuUsage: 15, memoryUsage: 52, responseTimeMs: 15 }
  ]);
  const [localAlgorithm, setLocalAlgorithm] = useState<"ROUND_ROBIN" | "LEAST_CONNECTIONS" | "RANDOM">("ROUND_ROBIN");
  const [localRateLimiterEnabled, setLocalRateLimiterEnabled] = useState<boolean>(true);
  const [localMaxRequests, setLocalMaxRequests] = useState<number>(30);
  const [localRecentRequests, setLocalRecentRequests] = useState<RequestLog[]>([]);

  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [trafficSimCount, setTrafficSimCount] = useState<number>(10);
  const [isSimulatingTraffic, setIsSimulatingTraffic] = useState<boolean>(false);
  const [customMaxRequests, setCustomMaxRequests] = useState<number>(30);

  // Poll metrics from backend operations server
  useEffect(() => {
    let active = true;
    const fetchMetrics = async () => {
      try {
        const data = await fetchJsonSafely("/api/system/metrics");
        if (data && active) {
          setSystemMetrics(data);
          if (data.rateLimiter) {
            setCustomMaxRequests(data.rateLimiter.maxRequests);
          }
        } else if (active) {
          setUseServerBackend(false);
        }
      } catch (err) {
        if (active) {
          setUseServerBackend(false);
        }
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 2000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  // Periodic decay/update for local simulation
  useEffect(() => {
    if (useServerBackend) return;

    const interval = setInterval(() => {
      setLocalNodes(prev => prev.map(node => {
        if (node.status === "OFFLINE") {
          return { ...node, cpuUsage: 0, memoryUsage: 0, responseTimeMs: 0, activeConnections: 0 };
        }
        const baseCpu = node.id === "node-alpha" ? 10 : node.id === "node-beta" ? 6 : 12;
        const baseMemory = node.id === "node-alpha" ? 42 : node.id === "node-beta" ? 35 : 48;
        const baseResponseTime = node.id === "node-alpha" ? 20 : node.id === "node-beta" ? 40 : 12;

        const deltaCpu = (Math.random() * 6 - 3);
        const targetCpu = Math.min(95, Math.max(2, baseCpu + (node.activeConnections * 15) + deltaCpu));
        const newCpu = Math.round(node.cpuUsage * 0.7 + targetCpu * 0.3);

        const targetMemory = Math.min(90, Math.max(5, baseMemory + (node.totalRequests % 10) * 0.5 + (Math.random() * 2 - 1)));
        const newMemory = Math.round(node.memoryUsage * 0.9 + targetMemory * 0.1);

        const targetLatency = Math.round(baseResponseTime + (newCpu * 0.5) + (Math.random() * 4 - 2));
        const newResponseTime = Math.max(5, Math.round(node.responseTimeMs * 0.8 + targetLatency * 0.2));

        return {
          ...node,
          cpuUsage: newCpu,
          memoryUsage: newMemory,
          responseTimeMs: newResponseTime
        };
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [useServerBackend]);

  // Synchronize systemMetrics state under local simulation mode
  useEffect(() => {
    if (!useServerBackend) {
      setSystemMetrics({
        nodes: localNodes,
        algorithm: localAlgorithm,
        rateLimiter: {
          enabled: localRateLimiterEnabled,
          maxRequests: localMaxRequests,
          windowMs: 60000,
          activeClients: 1,
          blockedCount: 0,
          blockedIPsList: []
        },
        recentRequests: localRecentRequests
      });
    }
  }, [useServerBackend, localNodes, localAlgorithm, localRateLimiterEnabled, localMaxRequests, localRecentRequests]);

  const handleUpdateSystemConfig = async (newAlgo?: string, rlEnabled?: boolean, limit?: number, nodeStatuses?: Record<string, string>) => {
    if (!useServerBackend) {
      if (newAlgo && ["ROUND_ROBIN", "LEAST_CONNECTIONS", "RANDOM"].includes(newAlgo)) {
        setLocalAlgorithm(newAlgo as any);
      }
      if (typeof rlEnabled === "boolean") {
        setLocalRateLimiterEnabled(rlEnabled);
      }
      if (typeof limit === "number" && limit > 0) {
        setLocalMaxRequests(limit);
        setCustomMaxRequests(limit);
      }
      if (nodeStatuses) {
        setLocalNodes(prev => prev.map(node => {
          if (nodeStatuses[node.id]) {
            return { ...node, status: nodeStatuses[node.id] as any };
          }
          return node;
        }));
      }
      return;
    }

    try {
      const payload: any = {};
      if (newAlgo) payload.algorithm = newAlgo;
      if (typeof rlEnabled === "boolean") payload.rateLimitEnabled = rlEnabled;
      if (typeof limit === "number") payload.maxRequests = limit;
      if (nodeStatuses) payload.nodeStatuses = nodeStatuses;

      const res = await fetch("/api/system/configure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const metricsRes = await fetch("/api/system/metrics");
        if (metricsRes.ok) {
          const contentType = metricsRes.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            setSystemMetrics(await metricsRes.json());
          }
        }
      }
    } catch (err) {
      console.error("Error saving infra operations parameters:", err);
    }
  };

  const handleSimulateTraffic = async (isBurst: boolean = false) => {
    setIsSimulatingTraffic(true);
    if (!useServerBackend) {
      setTimeout(() => {
        const count = trafficSimCount;
        const paths = ["/api/profiles", "/api/profiles/kurtzy-huzz", "/api/profiles/test-id"];
        const methods = ["GET", "GET", "GET", "POST"];
        const ipPool = ["192.168.1.105", "10.0.0.42", "172.16.254.12", "8.8.8.8", "127.0.0.1"];

        setLocalNodes(prevNodes => {
          const onlineNodes = prevNodes.filter(n => n.status !== "OFFLINE");
          if (onlineNodes.length === 0) return prevNodes;

          const newNodes = [...prevNodes];
          const newRequests: RequestLog[] = [];

          for (let i = 0; i < count; i++) {
            const ip = ipPool[Math.floor(Math.random() * ipPool.length)];
            const method = methods[Math.floor(Math.random() * methods.length)];
            const path = paths[Math.floor(Math.random() * paths.length)];

            let selectedNode: LbNode | null = null;
            if (localAlgorithm === "RANDOM") {
              selectedNode = onlineNodes[Math.floor(Math.random() * onlineNodes.length)];
            } else if (localAlgorithm === "LEAST_CONNECTIONS") {
              selectedNode = onlineNodes.reduce((min, n) => n.activeConnections < min.activeConnections ? n : min, onlineNodes[0]);
            } else {
              selectedNode = onlineNodes[i % onlineNodes.length];
            }

            if (!selectedNode) continue;

            const nodeIdx = newNodes.findIndex(n => n.id === selectedNode!.id);
            if (nodeIdx !== -1) {
              newNodes[nodeIdx] = {
                ...newNodes[nodeIdx],
                totalRequests: newNodes[nodeIdx].totalRequests + 1,
                cpuUsage: isBurst ? Math.min(98, newNodes[nodeIdx].cpuUsage + 12) : Math.min(95, newNodes[nodeIdx].cpuUsage + 2),
                responseTimeMs: isBurst ? Math.min(220, newNodes[nodeIdx].responseTimeMs + 25) : newNodes[nodeIdx].responseTimeMs
              };
            }

            newRequests.push({
              timestamp: new Date().toLocaleTimeString(),
              ip,
              method,
              url: path,
              node: selectedNode.name,
              status: 200,
              rateLimitStatus: "ALLOWED"
            });
          }

          setLocalRecentRequests(prev => {
            const merged = [...newRequests, ...prev];
            return merged.slice(0, 20);
          });

          return newNodes;
        });

        setIsSimulatingTraffic(false);
      }, 300);
      return;
    }

    try {
      const res = await fetch("/api/system/simulate-traffic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: trafficSimCount, isBurst })
      });
      if (res.ok) {
        const metricsRes = await fetch("/api/system/metrics");
        if (metricsRes.ok) {
          const contentType = metricsRes.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            setSystemMetrics(await metricsRes.json());
          }
        }
      }
    } catch (err) {
      console.error("Error running load injection simulation:", err);
    } finally {
      setTimeout(() => setIsSimulatingTraffic(false), 600);
    }
  };

  const handleResetSystemLimits = async () => {
    if (!useServerBackend) {
      setLocalNodes(prev => prev.map(n => ({ ...n, totalRequests: 0, activeConnections: 0 })));
      setLocalRecentRequests([]);
      return;
    }

    try {
      const res = await fetch("/api/system/reset-limits", { method: "POST" });
      if (res.ok) {
        const metricsRes = await fetch("/api/system/metrics");
        if (metricsRes.ok) {
          const contentType = metricsRes.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            setSystemMetrics(await metricsRes.json());
          }
        }
      }
    } catch (err) {
      console.error("Error resetting network log registers:", err);
    }
  };

  // Close profile dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Rotate state for the 3D Tag Preview
  const [tiltX, setTiltX] = useState<number>(12);
  const [tiltY, setTiltY] = useState<number>(-18);

  const isLoaded = useRef<boolean>(false);

  // Dynamic URL Synchronization and Popstate / Hashchange listener
  useEffect(() => {
    const handleUrlChange = () => {
      const path = window.location.pathname.replace(/^\/+|\/+$/g, "");
      const searchParams = new URLSearchParams(window.location.search);
      const queryId = searchParams.get("profile") || searchParams.get("id");
      if (queryId) {
        setCurrentProfileId(queryId);
      } else if (path && !path.includes(".") && !path.startsWith("api")) {
        setCurrentProfileId(path);
      } else {
        // Fallback default
        setCurrentProfileId("kurtzy-huzz");
      }
    };

    window.addEventListener("popstate", handleUrlChange);
    window.addEventListener("hashchange", handleUrlChange);
    return () => {
      window.removeEventListener("popstate", handleUrlChange);
      window.removeEventListener("hashchange", handleUrlChange);
    };
  }, []);

  // Helper to switch active profiles and update URL seamlessly
  const handleSwitchProfile = (id: string) => {
    setCurrentProfileId(id);
    const url = new URL(window.location.href);
    url.searchParams.set("profile", id);
    window.history.pushState({}, "", url.toString());
  };

  // Auth Observer
  useEffect(() => {
    if (isFirebaseConfigured) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setFirebaseUser(user);
        if (user) {
          setIsAdmin(true); // Grant admin panel view once authenticated with email
        }
      });
      return () => unsubscribe();
    }
  }, []);

  // Fetch profiles list (for switching dropdown) on load & when auth changes
  useEffect(() => {
    fetchProfilesList();
  }, [firebaseUser]);

  // Real-time listener for current active profile
  useEffect(() => {
    setIsLoading(true);
    isLoaded.current = false;
    let unsubscribe: () => void = () => {};

    if (isFirebaseConfigured) {
      // Connect to real-time Firestore stream
      const docRef = doc(db, "profiles", currentProfileId);
      unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as TagProfile;
          if (data.childName === "Huzaifa Meowiee") {
            data.childName = "Huzaifa Firoz";
          }
          setProfile({
            id: currentProfileId,
            ...data,
            adEmail: data.adEmail || "order@kurtzytags.com",
            adWhatsapp: data.adWhatsapp || "+1 (555) 019-2834",
            adInstagram: data.adInstagram || "@kurtzytags"
          });
          setIsLoading(false);
        } else {
          // If profile doc doesn't exist in Firestore, fall back to API or local defaults
          fetchProfileFallback(currentProfileId);
        }
        setTimeout(() => { isLoaded.current = true; }, 150);
      }, (err) => {
        console.error("Firestore onSnapshot error:", err);
        fetchProfileFallback(currentProfileId);
      });
    } else {
      // Fallback to Express API call if Firebase is not connected
      fetchProfileFallback(currentProfileId);
    }

    return () => unsubscribe();
  }, [currentProfileId]);

  const fetchProfileFallback = async (id: string) => {
    try {
      const data = await fetchJsonSafely(`/api/profiles/${id}?t=${Date.now()}`);
      if (data) {
        if (data.childName === "Huzaifa Meowiee") {
          data.childName = "Huzaifa Firoz";
        }
        const updatedProfile = {
          ...data,
          adEmail: data.adEmail || "order@kurtzytags.com",
          adWhatsapp: data.adWhatsapp || "+1 (555) 019-2834",
          adInstagram: data.adInstagram || "@kurtzytags"
        };
        setProfile(updatedProfile);

        // Also cache locally
        const cached = localStorage.getItem("kurtzy_local_profiles");
        const currentCached = cached ? JSON.parse(cached) : {};
        currentCached[id] = updatedProfile;
        localStorage.setItem("kurtzy_local_profiles", JSON.stringify(currentCached));
      } else {
        // Fallback to localStorage cache
        const cached = localStorage.getItem("kurtzy_local_profiles");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed[id]) {
            setProfile(parsed[id]);
            setIsLoading(false);
            return;
          }
        }
        // If nothing in cache, keep default but set id
        setProfile(prev => ({ ...prev, id }));
      }
    } catch (err) {
      console.error("Error loading profile fallback:", err);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        isLoaded.current = true;
      }, 150);
    }
  };

  const fetchProfilesList = async () => {
    try {
      const data = await fetchJsonSafely("/api/profiles");
      if (data) {
        const processedData = { ...data };
        for (const key in processedData) {
          if (processedData[key] && processedData[key].childName === "Huzaifa Meowiee") {
            processedData[key] = {
              ...processedData[key],
              childName: "Huzaifa Firoz"
            };
          }
        }
        setAllProfiles(processedData);
        localStorage.setItem("kurtzy_local_profiles", JSON.stringify(processedData));
      } else {
        // Fallback to localStorage
        const cached = localStorage.getItem("kurtzy_local_profiles");
        if (cached) {
          setAllProfiles(JSON.parse(cached));
        } else {
          const defaultList = { [profile.id]: profile };
          setAllProfiles(defaultList);
          localStorage.setItem("kurtzy_local_profiles", JSON.stringify(defaultList));
        }
      }
    } catch (err) {
      console.error("Error fetching profiles directory:", err);
    }
  };

  // Debounced auto-save whenever profile changes
  useEffect(() => {
    if (!isLoaded.current) return;

    const delayDebounceFn = setTimeout(async () => {
      await saveProfileData(profile);
    }, 800); // 800ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [profile]);

  const saveProfileData = async (dataToSave: TagProfile) => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      // Keep owner info if user is authenticated
      const finalProfile = {
        ...dataToSave,
        userId: firebaseUser ? firebaseUser.uid : (profile.userId || "")
      };

      // Always save to localStorage immediately for redundant client safety
      const cached = localStorage.getItem("kurtzy_local_profiles");
      const currentCached = cached ? JSON.parse(cached) : {};
      currentCached[finalProfile.id] = finalProfile;
      localStorage.setItem("kurtzy_local_profiles", JSON.stringify(currentCached));
      setAllProfiles(currentCached);

      // Attempt to save to backend API
      await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalProfile)
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error("Save profile error (saved locally):", err);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateNewProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileId || !newProfileName) return;

    // Sanitize ID
    const sanitizedId = newProfileId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
    if (!sanitizedId) return;

    const newProfile: TagProfile = {
      id: sanitizedId,
      childName: newProfileName,
      contacts: [
        { role: "Parent", name: "", phone: "" }
      ],
      tagColor: "transparent",
      bloodGroup: "O-Positive",
      age: "6 Years",
      dob: "15/08/2020",
      engravingText: `${newProfileName} — Tap For Safety`,
      adEmail: profile.adEmail || "order@kurtzytags.com",
      adWhatsapp: profile.adWhatsapp || "+1 (555) 019-2834",
      adInstagram: profile.adInstagram || "@kurtzytags",
      userId: firebaseUser ? firebaseUser.uid : ""
    };

    setIsSaving(true);
    try {
      // Save locally first
      const cached = localStorage.getItem("kurtzy_local_profiles");
      const currentCached = cached ? JSON.parse(cached) : {};
      currentCached[sanitizedId] = newProfile;
      localStorage.setItem("kurtzy_local_profiles", JSON.stringify(currentCached));
      setAllProfiles(currentCached);

      // Try backend API post
      await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProfile)
      });
    } catch (err) {
      console.error("Error creating new profile (saved locally):", err);
    } finally {
      setIsSaving(false);
      handleSwitchProfile(sanitizedId);
      setShowCreateModal(false);
      setNewProfileId("");
      setNewProfileName("");
    }
  };

  const handleDeleteProfile = async () => {
    if (!window.confirm(`Are you sure you want to delete the profile "${profile.id}"? This action cannot be undone.`)) {
      return;
    }

    setIsSaving(true);
    try {
      // Delete locally first
      const updatedProfiles = { ...allProfiles };
      delete updatedProfiles[profile.id];
      setAllProfiles(updatedProfiles);
      localStorage.setItem("kurtzy_local_profiles", JSON.stringify(updatedProfiles));

      // Attempt API delete
      await fetch(`/api/profiles/${profile.id}`, {
        method: "DELETE"
      });
    } catch (err) {
      console.error("Error deleting profile from server (deleted locally):", err);
    } finally {
      setIsSaving(false);
      alert(`Profile "${profile.id}" deleted successfully.`);

      const remainingKeys = Object.keys(allProfiles).filter(k => k !== profile.id);
      const fallbackId = remainingKeys.length > 0 ? remainingKeys[0] : "kurtzy-huzz";
      handleSwitchProfile(fallbackId);
    }
  };

  // QR Code download handlers
  const downloadQRCodeSvg = () => {
    const svgElement = document.getElementById("profile-qrcode");
    if (!svgElement) return;

    const svgString = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);
    
    const downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = `kurtzy-tag-${profile.id}-qr.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);
  };

  const downloadQRCodePng = () => {
    const svgElement = document.getElementById("profile-qrcode");
    if (!svgElement) return;

    const svgString = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);
    
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const context = canvas.getContext("2d");
      if (context) {
        // High-quality rendering background fill
        context.fillStyle = "#FFFFFF";
        context.fillRect(0, 0, 512, 512);
        
        // Draw image centered with high fidelity margin
        context.drawImage(image, 32, 32, 448, 448);
        
        try {
          const pngUrl = canvas.toDataURL("image/png");
          const downloadLink = document.createElement("a");
          downloadLink.href = pngUrl;
          downloadLink.download = `kurtzy-tag-${profile.id}-qr.png`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        } catch (e) {
          console.error("Failed to generate PNG from canvas:", e);
          alert("Conversion failed. Please download the SVG vector format.");
        }
      }
      URL.revokeObjectURL(svgUrl);
    };
    image.src = svgUrl;
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput) return;
    setPinError("");
    try {
      const data = await fetchJsonSafely("/api/admin/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: pinInput })
      });
      if (data && data.success) {
        setIsAdmin(true);
        setShowPinModal(false);
        setPinInput("");
        setPinError("");
      } else if (!data) {
        // Fallback check on static hosting
        if (pinInput === "0815") {
          setIsAdmin(true);
          setShowPinModal(false);
          setPinInput("");
          setPinError("");
        } else {
          setPinError("Incorrect PIN. Please try again.");
        }
      } else {
        setPinError(data.message || "Incorrect PIN. Please try again.");
      }
    } catch (err) {
      if (pinInput === "0815") {
        setIsAdmin(true);
        setShowPinModal(false);
        setPinInput("");
        setPinError("");
      } else {
        setPinError("Failed to reach security server. Please try again.");
      }
      console.error("PIN verification error:", err);
    }
  };

  // Handle Firebase cloud auth submit
  const handleCloudAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !passwordInput) return;

    setAuthError("");
    setAuthLoading(true);

    try {
      if (isSignUp) {
        // Create standard account
        await createUserWithEmailAndPassword(auth, emailInput, passwordInput);
      } else {
        // Sign in standard account
        await signInWithEmailAndPassword(auth, emailInput, passwordInput);
      }
      setShowPinModal(false);
      setIsAdmin(true);
      setEmailInput("");
      setPasswordInput("");
    } catch (err: any) {
      console.error("Auth action error:", err);
      setAuthError(err.message || "An authentication error occurred.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogoutAdmin = async () => {
    if (firebaseUser) {
      try {
        await signOut(auth);
      } catch (err) {
        console.error("Sign out error:", err);
      }
    }
    setIsAdmin(false);
  };

  // Contact helper functions
  const handleUpdateContact = (index: number, field: keyof Contact, value: string) => {
    const updatedContacts = [...profile.contacts];
    updatedContacts[index] = { ...updatedContacts[index], [field]: value };
    setProfile(prev => ({ ...prev, contacts: updatedContacts }));
  };

  const handleAddContact = () => {
    if (profile.contacts.length >= 4) return;
    setProfile(prev => ({
      ...prev,
      contacts: [...prev.contacts, { role: "Guardian", name: "", phone: "" }]
    }));
  };

  const handleRemoveContact = (index: number) => {
    if (profile.contacts.length <= 1) return;
    const updatedContacts = profile.contacts.filter((_, idx) => idx !== index);
    setProfile(prev => ({ ...prev, contacts: updatedContacts }));
  };

  // Color theme mapper for the 3D Tag Preview
  const getColorClasses = (color: string) => {
    switch (color) {
      case "blue":
        return {
          glow: "from-blue-500/20 to-indigo-500/10 border-blue-500/35",
          ring: "bg-gradient-to-tr from-blue-600 to-indigo-500 border-blue-400",
          core: "bg-blue-950/90 border-blue-500/40 text-blue-300",
          button: "bg-blue-600 hover:bg-blue-500"
        };
      case "emerald":
        return {
          glow: "from-emerald-500/20 to-teal-500/10 border-emerald-500/35",
          ring: "bg-gradient-to-tr from-emerald-600 to-teal-500 border-emerald-400",
          core: "bg-emerald-950/90 border-emerald-500/40 text-emerald-300",
          button: "bg-emerald-600 hover:bg-emerald-500"
        };
      case "rose":
        return {
          glow: "from-rose-500/20 to-pink-500/10 border-rose-500/35",
          ring: "bg-gradient-to-tr from-rose-600 to-pink-500 border-rose-400",
          core: "bg-rose-950/90 border-rose-500/40 text-rose-300",
          button: "bg-rose-600 hover:bg-rose-500"
        };
      case "purple":
        return {
          glow: "from-purple-500/20 to-fuchsia-500/10 border-purple-500/35",
          ring: "bg-gradient-to-tr from-purple-600 to-fuchsia-500 border-purple-400",
          core: "bg-purple-950/90 border-purple-500/40 text-purple-300",
          button: "bg-purple-600 hover:bg-purple-500"
        };
      case "amber":
        return {
          glow: "from-amber-500/20 to-orange-500/10 border-amber-500/35",
          ring: "bg-gradient-to-tr from-amber-600 to-orange-500 border-amber-400",
          core: "bg-amber-950/90 border-amber-500/40 text-amber-300",
          button: "bg-amber-600 hover:bg-amber-500"
        };
      default: // Clear/transparent glass style
        return {
          glow: "from-slate-500/10 to-slate-800/5 border-slate-700/50",
          ring: "bg-gradient-to-tr from-slate-800 to-slate-900 border-slate-600",
          core: "bg-slate-950/90 border-slate-800/60 text-slate-300",
          button: "bg-slate-700 hover:bg-slate-600"
        };
    }
  };

  const activeColors = getColorClasses(profile.tagColor);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-x-hidden selection:bg-blue-600/30 selection:text-blue-200">
      {/* Decorative ambient gradients */}
      <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />

      {/* Top Professional Navbar */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md shadow-blue-500/20 border border-blue-500/30">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-extrabold tracking-tight text-white text-base">KURTZY</span>
              <span className="text-[10px] block font-mono text-slate-400 tracking-wider">SMART SAFETY TAGS</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Display current mode for clarity */}
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-900 border border-slate-800 text-slate-400 flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isAdmin ? "bg-amber-400 animate-pulse" : "bg-blue-400"}`} />
              {isAdmin ? "Customization Workspace" : "Observer Portal"}
            </span>

            {/* Locked/Unlocked toggle */}
            {isAdmin ? (
              <button
                onClick={handleLogoutAdmin}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold rounded-lg border border-amber-500/25 transition-all shadow-sm"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>{firebaseUser ? "Logout" : "Lock Workspace"}</span>
              </button>
            ) : (
              <button
                onClick={() => setShowPinModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-all shadow-md shadow-blue-600/10"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Admin Customize</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 flex flex-col gap-12 animate-fade-in">
        {isLoading ? (
          <SkeletonScreen isAdmin={isAdmin} />
        ) : (
          <>
            {/* Dynamic Header Banner depends on Mode */}
            <div className="text-center max-w-2xl mx-auto space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            {isAdmin ? (
              <>Configure Your <span className="bg-gradient-to-r from-amber-400 to-orange-300 bg-clip-text text-transparent">Safety Registry</span></>
            ) : (
              <>Kurtzy Smart Safety <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">Registry Portal</span></>
            )}
          </h1>
          <p className="text-sm text-slate-400">
            {isAdmin 
              ? "Modify emergency family details, select physical tag design colors, customize branding and publish instant live changes for your visitors."
              : "This is a real-time smart nfc tags live observer dashboard. Tap the emergency actions below to connect directly with the family guardians."
            }
          </p>
        </div>

        {/* Firebase Config warning badge for Admin if credentials are missing */}
        {isAdmin && !isFirebaseConfigured && (
          <div className="max-w-4xl mx-auto w-full bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 text-left flex items-start gap-3">
            <Database className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-xs font-bold font-mono text-amber-400 uppercase tracking-wider block">Firebase Local Fallback Active</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Your backend is running in local file-store fallback. To unlock persistent real-time cloud storage and email-based user registration, define the VITE_FIREBASE environment credentials in your workspace secrets.
              </p>
            </div>
          </div>
        )}

        {/* Core Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: INTERACTIVE TAG PREVIEW & SUMMARY (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Visual 3D acrylic NFC Tag Container */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden flex flex-col items-center justify-center shadow-lg group min-h-[360px]">
              <div className="absolute top-2 left-3 flex items-center gap-1.5 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                <RefreshCw className="w-3 h-3 animate-spin-slow text-slate-600" />
                <span>Interactive 3D Preview</span>
              </div>

              {/* Dynamic 3D Tag Element */}
              <div 
                className="relative cursor-grab active:cursor-grabbing select-none w-52 h-52 flex items-center justify-center transition-all duration-300"
                style={{
                  transform: `perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
                }}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left - rect.width / 2;
                  const y = e.clientY - rect.top - rect.height / 2;
                  setTiltX(-y / 4);
                  setTiltY(x / 4);
                }}
                onMouseLeave={() => {
                  setTiltX(12);
                  setTiltY(-18);
                }}
              >
                {/* Physical Tag Ring Backdrop Glow */}
                <div className={`absolute inset-2 rounded-full bg-gradient-to-tr blur-xl opacity-60 transition-all duration-500 ${activeColors.glow}`} />

                {/* Outer Resin Acrylic Dial */}
                <div className={`w-44 h-44 rounded-full border-4 p-1.5 flex items-center justify-center shadow-2xl transition-all duration-500 ${activeColors.ring}`}>
                  
                  {/* Central RFID / NFC Chip Structure with legible micro lines */}
                  <div className={`w-full h-full rounded-full border-2 flex flex-col items-center justify-center p-3 text-center relative overflow-hidden transition-all duration-500 ${activeColors.core}`}>
                    
                    {/* Microchip circle */}
                    <div className="absolute w-12 h-12 rounded-full border border-dashed border-white/10 flex items-center justify-center opacity-30">
                      <div className="w-4 h-4 rounded-md bg-white/20" />
                    </div>

                    {/* Engraved text */}
                    <span className="font-mono text-[9px] tracking-widest text-slate-400 uppercase font-bold mt-2 z-10">
                      KURTZY
                    </span>

                    {/* Personalized text simulation */}
                    <div className="text-[10px] font-bold tracking-tight text-white mt-4 max-w-[110px] line-clamp-2 leading-snug uppercase z-10 px-1 py-0.5 rounded bg-slate-950/40">
                      {profile.engravingText || "Lily M. — One Tap Away"}
                    </div>

                    <span className="text-[8px] text-slate-500 font-mono tracking-wider uppercase mt-3 z-10">
                      ID: {profile.id}
                    </span>

                    {/* Interactive Tap Hint */}
                    <div className="absolute bottom-2 flex items-center gap-1 opacity-70">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-[8px] font-mono font-semibold text-slate-400">NFC CHIP ACTIVE</span>
                    </div>

                  </div>
                </div>

                {/* Silicone strap / Loop illustration */}
                <div className="absolute top-[-30px] w-8 h-20 bg-slate-800 rounded-2xl border-2 border-slate-700 shadow-md -z-10 flex flex-col items-center justify-start py-2">
                  <div className="w-3 h-3 rounded-full bg-slate-950 border border-slate-600" />
                </div>
              </div>

              {/* Tag parameters under visual mockup */}
              <div className="w-full mt-6 border-t border-slate-800/60 pt-4 flex items-center justify-between text-xs font-mono text-slate-400">
                <div>
                  <span className="block text-[10px] uppercase text-slate-500">Blood Group</span>
                  <span className="font-semibold text-slate-200">{profile.bloodGroup || "B-Positive"}</span>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] uppercase text-slate-500">Age of Child</span>
                  <span className="font-semibold text-slate-200">
                    {profile.dob ? calculateAge(profile.dob) : (profile.age || "6 Years")}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Profile Summary Box */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-md text-left">
              <h3 className="font-bold text-slate-200 text-sm mb-3 tracking-wide flex items-center gap-1.5">
                <User className="w-4 h-4 text-blue-400" />
                <span>Safety Registry Metadata</span>
              </h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Registered Child</span>
                  <span className="font-bold text-white text-sm">{profile.childName}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Secure Profile ID</span>
                  <span className="font-mono text-slate-300">{profile.id}</span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-slate-400">Active Contacts</span>
                  <span className="font-bold text-blue-400">{profile.contacts.length} Family Members</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: EMERGENCY CONTACTS & WORKSPACE / ADVERTISING (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-8 text-left">
            
            {/* IF IN ADMIN WORKSPACE: DISPLAY CUSTOMIZER CONTROLS */}
            <AnimatePresence mode="wait">
              {isAdmin ? (
                <motion.div
                  key="admin-panel"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-6"
                >
                  
                  {/* MULTI-PROFILE SEAMLESS SWITCHER & CREATOR WORKSPACE */}
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex flex-col items-start w-full sm:w-auto">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Active Customer Registry</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-extrabold text-white text-base truncate max-w-[200px]">{profile.id}</span>
                        <span className="text-xs text-blue-400 font-medium">({profile.childName})</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto self-stretch sm:self-auto">
                      <div className="flex-1 sm:flex-initial flex flex-col items-start relative" ref={dropdownRef}>
                        <span className="text-[9px] font-mono text-slate-500 uppercase font-bold mb-1">Switch Customer</span>
                        
                        {/* Custom Dropdown Trigger */}
                        <button
                          type="button"
                          onClick={() => {
                            setIsDropdownOpen(!isDropdownOpen);
                            setProfileSearchQuery(""); // Clear search on toggle
                          }}
                          className="w-full sm:w-56 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 font-medium focus:outline-none focus:border-blue-500 flex items-center justify-between gap-2 hover:bg-slate-850 transition-colors"
                        >
                          <span className="truncate pr-1">
                            {profile.id} ({profile.childName})
                          </span>
                          <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-250 shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Searchable Dropdown Panel */}
                        <AnimatePresence>
                          {isDropdownOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -4 }}
                              className="absolute left-0 sm:right-0 sm:left-auto top-full mt-1.5 w-72 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl z-30 p-2 space-y-2"
                            >
                              {/* Search Box */}
                              <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
                                <input
                                  type="text"
                                  value={profileSearchQuery}
                                  onChange={(e) => setProfileSearchQuery(e.target.value)}
                                  placeholder="Search name or ID..."
                                  className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800/80 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                  autoFocus
                                />
                              </div>

                              {/* Filtered Profiles List */}
                              <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                                {(() => {
                                  // Gather profiles
                                  const profilesList: Record<string, TagProfile> = Object.keys(allProfiles).length > 0 ? allProfiles : { [profile.id]: profile };
                                  
                                  const filtered = Object.entries(profilesList).filter(([id, prof]) => {
                                    const q = profileSearchQuery.toLowerCase().trim();
                                    return id.toLowerCase().includes(q) || (prof.childName || "").toLowerCase().includes(q);
                                  });

                                  if (filtered.length === 0) {
                                    return (
                                      <div className="text-center py-4 text-xs text-slate-500">
                                        No profiles found
                                      </div>
                                    );
                                  }

                                  return filtered.map(([id, prof]) => (
                                    <button
                                      key={id}
                                      type="button"
                                      onClick={() => {
                                        handleSwitchProfile(id);
                                        setIsDropdownOpen(false);
                                        setProfileSearchQuery("");
                                      }}
                                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex flex-col transition-colors border ${
                                        id === profile.id
                                          ? "bg-blue-600/10 text-blue-300 border-blue-500/20"
                                          : "hover:bg-slate-800 text-slate-300 hover:text-white border-transparent"
                                      }`}
                                    >
                                      <span className="font-semibold text-slate-200 truncate">{prof.childName || "Unnamed"}</span>
                                      <span className="text-[10px] text-slate-500 font-mono truncate">ID: {id}</span>
                                    </button>
                                  ));
                                })()}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 mt-4 bg-blue-600/15 border border-blue-500/20 text-blue-300 hover:bg-blue-600 hover:text-white text-xs font-bold rounded-lg transition-all shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Create Profile</span>
                      </button>
                    </div>
                  </div>

                  {/* CUSTOMER SHAREABLE LINK HELPER */}
                  <div className="p-4 bg-blue-500/5 border border-blue-500/15 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-blue-400 font-bold font-mono text-[10px] uppercase tracking-wider">
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>CUSTOMER NFC TARGET LINK & QR CODE</span>
                      </div>
                      <span className="text-[9px] font-mono text-slate-500 font-bold uppercase">QUERY ROUTE READY</span>
                    </div>
                    
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Write this unique customer URL to the physical NFC children's wearable, or use the generated vector QR code for high-quality laser engraving and printing.
                    </p>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800">
                        <span className="text-[9px] font-mono text-slate-500 font-bold shrink-0">PRODUCTION (VERCEL)</span>
                        <span className="font-mono text-xs text-slate-300 flex-1 truncate select-all px-1">
                          https://kurtzy-smart-tags.vercel.app/?profile={profile.id}
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`https://kurtzy-smart-tags.vercel.app/?profile=${profile.id}`);
                            setIsCopied(true);
                            setTimeout(() => setIsCopied(false), 2000);
                          }}
                          className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white text-[11px] font-bold rounded transition-colors shrink-0"
                        >
                          {isCopied ? "Copied!" : "Copy URL"}
                        </button>
                      </div>

                      <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800/60">
                        <span className="text-[9px] font-mono text-slate-500 font-bold shrink-0">DEVELOPMENT (LIVE)</span>
                        <span className="font-mono text-xs text-slate-300 flex-1 truncate select-all px-1">
                          {window.location.origin}/?profile={profile.id}
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/?profile=${profile.id}`);
                            alert("Copied development live URL to clipboard.");
                          }}
                          className="px-3 py-1 bg-slate-800/50 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-bold rounded transition-colors shrink-0"
                        >
                          Copy Local
                        </button>
                      </div>
                    </div>

                    {/* DYNAMIC QR CODE FOR PHYSICAL ENGRAVING */}
                    <div className="flex flex-col sm:flex-row gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800/80 mt-2">
                      <div className="flex-1 space-y-2">
                        <div className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                          Dynamic Wearable QR Code
                        </div>
                        <h4 className="text-xs font-semibold text-slate-200">Wearable Printing & Engraving</h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          This QR code points directly to {profile.childName || "child"}'s emergency rescue profile. Download the scalable high-resolution file to print on badges, sew into shirts, or engrave on physical smart keychains.
                        </p>
                        <div className="flex flex-wrap gap-2 pt-1">
                          <button
                            onClick={downloadQRCodePng}
                            className="px-2.5 py-1.5 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/10 hover:border-blue-500 text-[10px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1"
                          >
                            <span>Download PNG</span>
                          </button>
                          <button
                            onClick={downloadQRCodeSvg}
                            className="px-2.5 py-1.5 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/10 hover:border-emerald-500 text-[10px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1"
                          >
                            <span>Download SVG (Vector)</span>
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col items-center justify-center bg-white p-2.5 rounded-xl border border-slate-800 self-center sm:self-stretch min-w-[120px] shadow-inner">
                        <QRCodeSVG
                          id="profile-qrcode"
                          value={`https://kurtzy-smart-tags.vercel.app/?profile=${profile.id}`}
                          size={110}
                          level="H"
                          includeMargin={false}
                          className="rounded-lg"
                        />
                        <span className="text-[9px] font-mono text-slate-400 font-bold mt-1.5 uppercase select-none">
                          Scan to Test
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border-b border-slate-800 pb-4">
                    <h3 className="font-bold text-slate-100 text-base mb-1">Customize Smart Registry Settings</h3>
                    <p className="text-xs text-slate-400">
                      Configure details that visitors will see immediately on their screens when they access or tap your tags.
                    </p>
                  </div>

                  {/* Core fields */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1.5">Child's Name</label>
                        <input 
                          type="text" 
                          value={profile.childName} 
                          onChange={(e) => setProfile(prev => ({ ...prev, childName: e.target.value }))}
                          placeholder="e.g. Lily Miller"
                          className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-blue-500/80 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1.5">Engraving Text</label>
                        <input 
                          type="text" 
                          value={profile.engravingText} 
                          onChange={(e) => setProfile(prev => ({ ...prev, engravingText: e.target.value }))}
                          placeholder="e.g. Lily M. — One Tap Away"
                          className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-blue-500/80 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Tag styling */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1.5">Tag Color Accent</label>
                        <select 
                          value={profile.tagColor} 
                          onChange={(e) => setProfile(prev => ({ ...prev, tagColor: e.target.value }))}
                          className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                        >
                          <option value="transparent">Transparent Glass</option>
                          <option value="blue">Electric Blue</option>
                          <option value="emerald">Vibrant Emerald</option>
                          <option value="rose">Soft Crimson Rose</option>
                          <option value="purple">Royal Deep Purple</option>
                          <option value="amber">Warm Amber Gold</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1.5">Blood Group</label>
                        <input 
                          type="text" 
                          value={profile.bloodGroup || ""} 
                          onChange={(e) => setProfile(prev => ({ ...prev, bloodGroup: e.target.value }))}
                          placeholder="e.g. B-Positive"
                          className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-blue-500/80 transition-colors"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-[11px] font-mono text-slate-400 uppercase">Date of Birth</label>
                          <span className="text-[10px] font-mono text-blue-400 font-semibold uppercase">
                            Age: {profile.dob ? calculateAge(profile.dob) : "N/A"}
                          </span>
                        </div>
                        <input 
                          type="text" 
                          value={profile.dob || ""} 
                          onChange={(e) => {
                            let val = e.target.value;
                            // Strip any non-digit/non-slash characters
                            val = val.replace(/[^\d/]/g, "");
                            // Strip slashes to format correctly
                            const cleanVal = val.replace(/\//g, "");
                            let formatted = "";
                            if (cleanVal.length > 0) {
                              formatted += cleanVal.substring(0, 2);
                              if (cleanVal.length > 2) {
                                formatted += "/" + cleanVal.substring(2, 4);
                              }
                              if (cleanVal.length > 4) {
                                formatted += "/" + cleanVal.substring(4, 8);
                              }
                            }
                            setProfile(prev => ({ ...prev, dob: formatted }));
                          }}
                          placeholder="dd/mm/yyyy"
                          maxLength={10}
                          className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-blue-500/80 transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Family Contact Customization */}
                  <div className="space-y-4 border-t border-slate-800 pt-5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">Emergency Contacts List</h4>
                      <button
                        onClick={handleAddContact}
                        disabled={profile.contacts.length >= 4}
                        className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-blue-400 hover:text-blue-300 disabled:opacity-40 transition-colors bg-blue-500/5 rounded border border-blue-500/10"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Guardian</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {profile.contacts.map((contact, index) => (
                        <div key={index} className="flex flex-col sm:flex-row items-center gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 animate-fade-in">
                          <input 
                            type="text"
                            value={contact.role}
                            onChange={(e) => handleUpdateContact(index, "role", e.target.value)}
                            placeholder="Role (e.g. Mom, Dad)"
                            className="w-full sm:w-1/4 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 font-medium"
                          />
                          <input 
                            type="text"
                            value={contact.name}
                            onChange={(e) => handleUpdateContact(index, "name", e.target.value)}
                            placeholder="Full Name"
                            className="w-full sm:w-2/5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200"
                          />
                          <input 
                            type="text"
                            value={contact.phone}
                            onChange={(e) => handleUpdateContact(index, "phone", e.target.value)}
                            placeholder="Phone Number"
                            className="w-full sm:w-1/3 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 font-mono"
                          />
                          <button
                            onClick={() => handleRemoveContact(index)}
                            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Remove contact"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Customize Advertisement / Call-to-Action lines */}
                  <div className="space-y-4 border-t border-slate-800 pt-5">
                    <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">Configure Advertisement Contact Portals</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Email Section</label>
                        <input 
                          type="email" 
                          value={profile.adEmail || ""} 
                          onChange={(e) => setProfile(prev => ({ ...prev, adEmail: e.target.value }))}
                          placeholder="e.g. order@kurtzytags.com"
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">WhatsApp Section</label>
                        <input 
                          type="text" 
                          value={profile.adWhatsapp || ""} 
                          onChange={(e) => setProfile(prev => ({ ...prev, adWhatsapp: e.target.value }))}
                          placeholder="e.g. +1 (555) 019-2834"
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Instagram Section</label>
                        <input 
                          type="text" 
                          value={profile.adInstagram || ""} 
                          onChange={(e) => setProfile(prev => ({ ...prev, adInstagram: e.target.value }))}
                          placeholder="e.g. @kurtzytags"
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar for Admin panel */}
                  <div className="border-t border-slate-800 pt-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
                    <div className="flex flex-col items-start gap-1 text-left">
                      <button
                        onClick={handleLogoutAdmin}
                        className="text-xs text-slate-400 hover:text-slate-200 font-semibold transition-colors"
                      >
                        Exit customization mode
                      </button>
                      <span className="text-[10px] text-emerald-400/80 font-mono">
                        ● Real-time Firestore Sync Active
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {isSaving && (
                        <span className="text-xs text-blue-400 font-mono flex items-center gap-1.5 animate-pulse">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Syncing...</span>
                        </span>
                      )}
                      {saveSuccess && (
                        <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 animate-pulse">
                          <Check className="w-3.5 h-3.5" />
                          <span>Saved & Synced!</span>
                        </span>
                      )}

                      <button
                        onClick={handleDeleteProfile}
                        disabled={isSaving}
                        className="flex items-center gap-1.5 px-5 py-2.5 bg-red-500/10 hover:bg-red-600 hover:text-white border border-red-500/20 disabled:opacity-50 text-red-400 font-bold text-xs rounded-xl transition-all animate-fade-in"
                        title="Delete this profile permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Profile</span>
                      </button>

                      <button
                        onClick={() => saveProfileData(profile)}
                        disabled={isSaving}
                        className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/10 transition-all"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{isSaving ? "Syncing..." : "Save & Publish Changes"}</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* OTHERWISE: DISPLAY THE CLEAN OBSERVER/VISITOR HUB */
                <motion.div
                  key="observer-panel"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-8"
                >
                  
                  {/* Clean safety registry emergency box */}
                  <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-5">
                    
                    {/* Urgency Alert Label */}
                    <div className="flex items-center justify-between border-b border-slate-800/60 pb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                        <h3 className="font-extrabold text-white text-base tracking-wide uppercase font-mono">
                          EMERGENCY FAMILY DECK
                        </h3>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 tracking-wider">
                        STATUS: ACTIVE REGISTRY
                      </span>
                    </div>

                    <div className="bg-blue-500/5 border border-blue-500/15 p-4 rounded-xl text-left">
                      <span className="text-[10px] font-bold font-mono text-blue-400 uppercase tracking-widest block mb-1">
                        SECURE NURTURE PLEDGE
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        If you have scanned this tag, please remain calm. Below are the verified phone contacts for {profile.childName || "the child"}'s immediate family guardians. Tap any contact below to place a direct voice call.
                      </p>
                    </div>

                    {/* Verified Emergency Contacts Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profile.contacts.map((contact, idx) => (
                        <div 
                          key={idx} 
                          className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-blue-500/30 transition-all group flex items-center justify-between"
                        >
                          <div className="space-y-1">
                            <span className="px-2 py-0.5 rounded text-[9px] uppercase font-mono font-bold tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/15">
                              {contact.role || "Guardian"}
                            </span>
                            <h4 className="text-sm font-bold text-slate-100 group-hover:text-blue-300 transition-colors">
                              {contact.name || "Family Member"}
                            </h4>
                            <p className="text-xs text-slate-400 font-mono font-semibold">
                              {contact.phone || "No phone listed"}
                            </p>
                          </div>

                          {contact.phone && (
                            <a 
                              href={`tel:${contact.phone}`}
                              className="p-3 bg-blue-500/10 hover:bg-blue-500/25 rounded-xl text-blue-400 border border-blue-500/15 transition-all flex items-center justify-center shadow-sm"
                              title={`Call ${contact.name}`}
                            >
                              <Phone className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* DEDICATED MARKETING ADVERTISEMENT & ORDERING PORTAL */}
                  <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-md border border-slate-800/80 rounded-2xl p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between">
                    {/* Visual background element */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <Megaphone className="w-5 h-5 text-blue-400" />
                        <span className="text-[11px] font-mono tracking-widest text-slate-400 uppercase font-bold">GET YOUR SMART TAG</span>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                          To get yours, order directly through our active contact channels:
                        </h2>
                        <p className="text-xs text-slate-400 max-w-xl">
                          Ensure safety and real-time peace of mind with our one-tap NFC communication tags. Simple, elegant, and secure.
                        </p>
                      </div>

                      {/* EXPLICITLY REQUESTED AD PORTALS IN SEPARATE LINES */}
                      <div className="border-l-2 border-blue-500/40 pl-6 space-y-4 font-sans py-2">
                        
                        {/* EMAIL AD LINE */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                          <span className="text-sm font-semibold text-slate-300">To get yours email us at</span>
                          <a 
                            href={`mailto:${profile.adEmail || "order@kurtzytags.com"}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 border border-blue-500/20 text-xs font-mono font-bold transition-all w-fit"
                          >
                            <Mail className="w-3.5 h-3.5 text-blue-400" />
                            <span>{profile.adEmail || "order@kurtzytags.com"}</span>
                          </a>
                        </div>

                        {/* WHATSAPP AD LINE */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                          <span className="text-sm font-semibold text-slate-300">or message us on whatsapp</span>
                          <a 
                            href={`https://wa.me/${(profile.adWhatsapp || "").replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/20 text-xs font-mono font-bold transition-all w-fit"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{profile.adWhatsapp || "+1 (555) 019-2834"}</span>
                          </a>
                        </div>

                        {/* INSTAGRAM AD LINE */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                          <span className="text-sm font-semibold text-slate-300">or dm us on instagram</span>
                          <a 
                            href={`https://instagram.com/${(profile.adInstagram || "").replace("@", "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-pink-500/10 text-pink-300 hover:bg-pink-500/20 border border-pink-500/20 text-xs font-mono font-bold transition-all w-fit"
                          >
                            <Instagram className="w-3.5 h-3.5 text-pink-400" />
                            <span>{profile.adInstagram || "@kurtzytags"}</span>
                          </a>
                        </div>

                      </div>
                    </div>

                    {/* Interactive copy button at the bottom of the poster */}
                    <div className="border-t border-slate-800/80 pt-6 mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <span className="text-[11px] text-slate-400 text-left font-medium">
                        Click any of the channels above to place an order directly.
                      </span>

                      <button
                        onClick={() => {
                          const promoText = `To get yours, email us at: ${profile.adEmail || "order@kurtzytags.com"}\nor message us on WhatsApp: ${profile.adWhatsapp || "+1 (555) 019-2834"}\nor DM us on Instagram: ${profile.adInstagram || "@kurtzytags"}`;
                          navigator.clipboard.writeText(promoText);
                          setIsCopied(true);
                          setTimeout(() => setIsCopied(false), 3000);
                        }}
                        className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 border ${
                          isCopied 
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" 
                            : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/15 hover:shadow-blue-500/25 border-blue-500"
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Copied to Clipboard!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>Copy Advertisement Text</span>
                          </>
                        )}
                      </button>
                    </div>

                  </div>

                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>

        {/* ============================================================= */}
        {/* FULL-WIDTH CLOUD OPERATIONS GATEWAY: LOAD BALANCER & RATE LIMITER */}
        {/* ============================================================= */}
        {isAdmin && (
          <div className="w-full mt-4 bg-slate-900/20 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-8 text-left animate-fade-in relative overflow-hidden">
          {/* Decorative side accent lines */}
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-indigo-600" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Title Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/60 pb-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[10px] font-mono font-bold text-blue-400 tracking-wider uppercase">Active Gateway Monitor</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-mono text-slate-500">SYSTEM STABLE</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
                <Server className="w-5 h-5 text-blue-400 shrink-0" />
                <span>NFC Network Operations Center</span>
              </h2>
              <p className="text-xs text-slate-400 max-w-xl">
                Live system metrics mapping active traffic load distribution across our edge routers and monitoring rapid-fire client rate limits.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={handleResetSystemLimits}
                className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-slate-200 text-xs font-semibold rounded-xl border border-slate-800 transition-all flex items-center gap-1.5"
                title="Clear node metrics and rate limiter stats"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Operations</span>
              </button>
            </div>
          </div>

          {/* Core 3-Column Operations Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* COLUMN 1: LOAD BALANCER CONTROL RIG */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-400" />
                  <h3 className="font-extrabold text-white text-sm uppercase tracking-wider font-mono">
                    Load Balancer
                  </h3>
                </div>
                <span className="text-[10px] bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-bold font-mono">
                  ACTIVE ROUTER
                </span>
              </div>

              {/* LB Algorithm Selector */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-3">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-semibold mb-1">
                    Distribution Policy
                  </span>
                  <p className="text-[11px] text-slate-500 leading-normal mb-3">
                    Choose the policy that the server utilizes to route emergency telemetry scan requests.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 border border-slate-800/80 rounded-lg">
                  {(["ROUND_ROBIN", "LEAST_CONNECTIONS", "RANDOM"] as const).map((algo) => (
                    <button
                      key={algo}
                      onClick={() => handleUpdateSystemConfig(algo)}
                      className={`px-1.5 py-2 rounded-md text-[10px] font-mono font-bold transition-all text-center uppercase tracking-tighter ${
                        (systemMetrics?.algorithm || "ROUND_ROBIN") === algo
                          ? "bg-blue-600 text-white shadow"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                      }`}
                    >
                      {algo === "ROUND_ROBIN" ? "Round Robin" : algo === "LEAST_CONNECTIONS" ? "Least Conn" : "Random"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Virtual Nodes Cluster Monitor */}
              <div className="space-y-3">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-semibold">
                  Node Instances Pool
                </span>

                <div className="space-y-3">
                  {(systemMetrics?.nodes || [
                    { id: "node-alpha", name: "Node-Alpha (Primary US)", status: "ONLINE", weight: 1, activeConnections: 0, totalRequests: 0, cpuUsage: 12, memoryUsage: 45, responseTimeMs: 25 },
                    { id: "node-beta", name: "Node-Beta (Secondary EU)", status: "ONLINE", weight: 1, activeConnections: 0, totalRequests: 0, cpuUsage: 8, memoryUsage: 38, responseTimeMs: 45 },
                    { id: "node-gamma", name: "Node-Gamma (Edge APAC)", status: "ONLINE", weight: 2, activeConnections: 0, totalRequests: 0, cpuUsage: 15, memoryUsage: 52, responseTimeMs: 15 }
                  ]).map((node) => {
                    const isOffline = node.status === "OFFLINE";
                    const isDegraded = node.status === "DEGRADED";
                    return (
                      <div 
                        key={node.id} 
                        className={`p-3.5 bg-slate-950/40 rounded-xl border transition-all duration-300 relative overflow-hidden ${
                          isOffline 
                            ? "border-red-500/20 bg-red-950/5 opacity-60" 
                            : isDegraded 
                            ? "border-amber-500/20 bg-amber-950/5" 
                            : "border-slate-800/80 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <span className="text-xs font-bold text-slate-200 block">{node.name}</span>
                            <span className="text-[9px] text-slate-500 font-mono">Weight: {node.weight}x</span>
                          </div>

                          {/* Interactive Node Status Switcher */}
                          <button
                            onClick={() => {
                              const nextStatusMap: Record<string, "ONLINE" | "DEGRADED" | "OFFLINE"> = {
                                ONLINE: "DEGRADED",
                                DEGRADED: "OFFLINE",
                                OFFLINE: "ONLINE"
                              };
                              const nextStatus = nextStatusMap[node.status] || "ONLINE";
                              handleUpdateSystemConfig(undefined, undefined, undefined, { [node.id]: nextStatus });
                            }}
                            className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-extrabold flex items-center gap-1 uppercase transition-all ${
                              isOffline 
                                ? "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20" 
                                : isDegraded 
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20" 
                                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                            }`}
                            title="Click to cycle status: Online -> Degraded -> Offline"
                          >
                            <span className={`w-1 h-1 rounded-full ${
                              isOffline ? "bg-red-400" : isDegraded ? "bg-amber-400" : "bg-emerald-400 animate-pulse"
                            }`} />
                            <span>{node.status}</span>
                          </button>
                        </div>

                        {/* Node Load bars */}
                        {!isOffline ? (
                          <div className="space-y-2 mt-3">
                            {/* CPU Load meter */}
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                                <span className="flex items-center gap-1"><Cpu className="w-2.5 h-2.5" /> CPU Load</span>
                                <span>{node.cpuUsage}%</span>
                              </div>
                              <div className="w-full bg-slate-900 rounded-full h-1 overflow-hidden">
                                <div 
                                  className={`h-full transition-all duration-500 rounded-full ${
                                    node.cpuUsage > 80 
                                      ? "bg-red-500" 
                                      : node.cpuUsage > 50 
                                      ? "bg-amber-500" 
                                      : "bg-blue-500"
                                  }`}
                                  style={{ width: `${node.cpuUsage}%` }}
                                />
                              </div>
                            </div>

                            {/* Active telemetry logs counters */}
                            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-900/60 mt-1">
                              <div className="text-left">
                                <span className="text-[8px] text-slate-500 font-mono block uppercase">Active Conn</span>
                                <span className="text-xs font-mono font-bold text-slate-200">{node.activeConnections}</span>
                              </div>
                              <div className="text-left">
                                <span className="text-[8px] text-slate-500 font-mono block uppercase">Total Req</span>
                                <span className="text-xs font-mono font-bold text-slate-200">{node.totalRequests}</span>
                              </div>
                              <div className="text-left">
                                <span className="text-[8px] text-slate-500 font-mono block uppercase">Latency</span>
                                <span className="text-xs font-mono font-bold text-blue-400">{node.responseTimeMs}ms</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="py-2.5 text-center">
                            <span className="text-[10px] text-red-400/70 font-mono font-bold flex items-center justify-center gap-1">
                              <ShieldAlert className="w-3.5 h-3.5" />
                              <span>Node offline. Auto-routing active.</span>
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* COLUMN 2: CLIENT IP RATE LIMITER */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-extrabold text-white text-sm uppercase tracking-wider font-mono">
                    IP Rate Limiter
                  </h3>
                </div>
                
                {/* Enable/Disable Switch Status badge */}
                <button
                  onClick={() => handleUpdateSystemConfig(undefined, !systemMetrics?.rateLimiter.enabled)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold transition-all border ${
                    systemMetrics?.rateLimiter.enabled 
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                      : "bg-slate-950 text-slate-500 border-slate-800"
                  }`}
                >
                  {systemMetrics?.rateLimiter.enabled ? "ENABLED" : "DISABLED"}
                </button>
              </div>

              {/* Config settings panel */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-4">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-semibold mb-1">
                    Security Threshold Rules
                  </span>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Clients exceeding maximum api calls per minute are locked out for 15 seconds. Prevents DDoS scraping of NFC safety telemetry records.
                  </p>
                </div>

                <div className="space-y-2.5 pt-2 border-t border-slate-900">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Max Telemetry Scans / Min:</span>
                    <span className="font-bold text-emerald-400">{customMaxRequests} req/m</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <input 
                      type="range" 
                      min={5} 
                      max={100} 
                      step={5}
                      value={customMaxRequests}
                      onChange={(e) => setCustomMaxRequests(parseInt(e.target.value))}
                      onMouseUp={() => handleUpdateSystemConfig(undefined, undefined, customMaxRequests)}
                      onTouchEnd={() => handleUpdateSystemConfig(undefined, undefined, customMaxRequests)}
                      className="w-full accent-emerald-500 bg-slate-950 border border-slate-800 rounded-lg h-2.5"
                    />
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                    <span>5 (Strict)</span>
                    <span>100 (Relaxed)</span>
                  </div>
                </div>
              </div>

              {/* Flagged and Blocked client list */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                    Lockout Register
                  </span>
                  <span className="text-[9px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded-full border border-slate-900 font-bold">
                    Blocked IPs: {systemMetrics?.rateLimiter.blockedCount || 0}
                  </span>
                </div>

                <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 min-h-[145px] flex flex-col justify-between">
                  {systemMetrics?.rateLimiter.blockedIPsList && systemMetrics.rateLimiter.blockedIPsList.length > 0 ? (
                    <div className="space-y-2 max-h-36 overflow-y-auto custom-scrollbar pr-1">
                      {systemMetrics.rateLimiter.blockedIPsList.map((ip, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-red-950/20 border border-red-500/20 text-[10px] font-mono text-red-300">
                          <span className="flex items-center gap-1.5 font-bold">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>{ip}</span>
                          </span>
                          <span className="px-1.5 py-0.2 bg-red-500/10 rounded uppercase text-[8px] tracking-wider animate-pulse">LOCKOUT ACTIVE</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-3">
                      <Wifi className="w-7 h-7 text-slate-700 mb-2 animate-pulse" />
                      <span className="text-[11px] font-mono text-slate-500">
                        Zero Client Lockouts Active
                      </span>
                      <span className="text-[9px] text-slate-600 font-sans mt-0.5">
                        NFC scan pipeline is clear and uninhibited.
                      </span>
                    </div>
                  )}

                  {systemMetrics?.rateLimiter.blockedCount ? systemMetrics.rateLimiter.blockedCount > 0 && (
                    <button
                      onClick={handleResetSystemLimits}
                      className="w-full mt-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-[10px] rounded-lg border border-red-500/20 transition-all font-mono uppercase"
                    >
                      Clear Block Register
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

            {/* COLUMN 3: REAL-TIME TRAFFIC SIMULATOR */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-400" />
                  <h3 className="font-extrabold text-white text-sm uppercase tracking-wider font-mono">
                    Load Injector
                  </h3>
                </div>
                <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>TELEMETRY SIM</span>
                </span>
              </div>

              {/* Simulator Controls */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-semibold">
                    Traffic Burst Configuration
                  </span>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Simulate batch API scan requests to test how the load balancer distributes concurrent threads, and trigger the rate limiter.
                  </p>
                </div>

                <div className="space-y-3.5 pt-3 border-t border-slate-900">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-400">Simulate Requests:</span>
                    <select 
                      value={trafficSimCount}
                      onChange={(e) => setTrafficSimCount(parseInt(e.target.value))}
                      className="bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono font-bold text-slate-200 px-2 py-1 focus:outline-none focus:border-blue-500"
                    >
                      <option value={5}>5 Telemetry Calls</option>
                      <option value={10}>10 Telemetry Calls</option>
                      <option value={20}>20 Telemetry Calls</option>
                      <option value={35}>35 Telemetry Calls (DDoS Test)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleSimulateTraffic(false)}
                      disabled={isSimulatingTraffic}
                      className="py-2.5 px-3 bg-blue-600/15 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/20 disabled:opacity-50 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 shrink-0" />
                      <span>Standard Surge</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSimulateTraffic(true)}
                      disabled={isSimulatingTraffic}
                      className="py-2.5 px-3 bg-amber-600/15 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/20 disabled:opacity-50 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                      title="Fires rapid-fire requests to trigger the rate limiter"
                    >
                      <Zap className="w-3.5 h-3.5 shrink-0" />
                      <span>DDoS Surge</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Live scrolling operations log */}
              <div className="space-y-3">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-semibold">
                  Live Router Telemetry Stream
                </span>

                <div className="bg-slate-950/90 rounded-xl border border-slate-800 p-3 h-[180px] font-mono text-[9px] relative overflow-hidden flex flex-col">
                  <div className="absolute top-2 right-3 flex items-center gap-1 text-[8px] font-bold text-slate-500 tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>LIVE FLOW</span>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar pr-1 mt-3">
                    {systemMetrics?.recentRequests && systemMetrics.recentRequests.length > 0 ? (
                      systemMetrics.recentRequests.map((req, idx) => (
                        <div key={idx} className="flex flex-col border-b border-slate-900/60 pb-1 last:border-0">
                          <div className="flex items-center justify-between">
                            <span className="text-[8px] text-slate-500">{req.timestamp}</span>
                            <span className={`px-1 rounded-[3px] text-[8px] font-bold tracking-tight ${
                              req.status === 429 
                                ? "bg-red-500/20 text-red-400" 
                                : req.status >= 400 
                                ? "bg-amber-500/20 text-amber-400" 
                                : "bg-emerald-500/10 text-emerald-400"
                            }`}>
                              {req.status} {req.status === 429 ? "RATELIMIT" : "OK"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-slate-300 mt-0.5">
                            <span className="truncate max-w-[150px]"><span className="text-slate-500 font-bold">{req.method}</span> {req.url}</span>
                            <span className="text-blue-400 shrink-0 font-bold">{req.node}</span>
                          </div>
                          <div className="text-[7.5px] text-slate-600 flex justify-between">
                            <span>IP: {req.ip}</span>
                            <span>Route: {req.rateLimitStatus}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-600 text-center py-4">
                        <span className="font-bold">Operations Stream Empty</span>
                        <span>Awaiting client requests ...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
        )}
          </>
        )}
      </main>

      {/* Footer Branding & Disclaimer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 px-6 text-center text-xs text-slate-500 mt-12 space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Shield className="w-4 h-4 text-slate-600" />
          <span className="font-mono text-[11px] tracking-wider uppercase font-bold text-slate-400">KURTZY NFC SAFETY NETWORK</span>
        </div>
        <p className="max-w-md mx-auto leading-relaxed text-[11px]">
          The ultimate smart wearable safety tags. Handcrafted physical tags linked to secure contact dashboards. Locked for safety, accessible for support.
        </p>

        {/* COMPLIANCE & LEGAL LINKS */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[10px] text-slate-400 font-mono">
          <button 
            onClick={() => { setShowComplianceModal(true); setComplianceTab("terms"); }}
            className="hover:text-blue-400 transition-colors underline cursor-pointer"
          >
            Terms of Use
          </button>
          <span className="text-slate-700">•</span>
          <button 
            onClick={() => { setShowComplianceModal(true); setComplianceTab("privacy"); }}
            className="hover:text-blue-400 transition-colors underline cursor-pointer"
          >
            Privacy Policy (COPPA / GDPR)
          </button>
          <span className="text-slate-700">•</span>
          <button 
            onClick={() => { setShowComplianceModal(true); setComplianceTab("gdpr"); }}
            className="hover:text-blue-400 transition-colors underline cursor-pointer"
          >
            Data Subject Rights (GDPR / CCPA)
          </button>
        </div>

        <p className="text-[10px] text-slate-600">
          © 2026 Kurtzy. All rights reserved. Registered Data Compliance System.
        </p>
      </footer>

      {/* CREATE PROFILE MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-left"
            >
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Plus className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-white text-base">Create New Profile</h3>
              </div>

              <p className="text-xs text-slate-400">
                Setup a brand new independent wearable tag profile. Isolated data allows multiple customers to safely coexist.
              </p>

              <form onSubmit={handleCreateNewProfile} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase font-bold mb-1">Unique Profile ID</label>
                  <input 
                    type="text"
                    value={newProfileId}
                    onChange={(e) => setNewProfileId(e.target.value)}
                    placeholder="e.g. profile-1 or john-doe"
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs font-mono"
                  />
                  <p className="text-[9px] text-slate-500 mt-1">Alphanumeric lowercase, no spaces or special characters.</p>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase font-bold mb-1">Child's Name</label>
                  <input 
                    type="text"
                    value={newProfileName}
                    onChange={(e) => setNewProfileName(e.target.value)}
                    placeholder="e.g. John Doe"
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowCreateModal(false); setNewProfileId(""); setNewProfileName(""); }}
                    className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all shadow-md"
                  >
                    Create Profile
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DUAL LOGIN & SECURITY MODAL (PASSCODE & CLOUD FIREBASE AUTH) */}
      <AnimatePresence>
        {showPinModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 text-left"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-400" />
                  <h3 className="font-bold text-white text-base">Unify Safety Settings</h3>
                </div>
                <button 
                  onClick={() => { setShowPinModal(false); setAuthError(""); }}
                  className="text-xs text-slate-500 hover:text-slate-300"
                >
                  ✕
                </button>
              </div>

              {/* Secure Sub Tabs Selector */}
              <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800">
                <button
                  type="button"
                  onClick={() => { setAuthTab("pin"); setAuthError(""); }}
                  className={`flex-1 py-1.5 text-center text-xs font-semibold rounded-md transition-all ${
                    authTab === "pin" ? "bg-slate-800 text-white shadow" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Passcode PIN
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthTab("cloud"); setAuthError(""); }}
                  className={`flex-1 py-1.5 text-center text-xs font-semibold rounded-md transition-all ${
                    authTab === "cloud" ? "bg-slate-800 text-white shadow" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Firebase Account
                </button>
              </div>

              {authTab === "pin" ? (
                /* Standard Passcode Unlock tab */
                <form onSubmit={handlePinSubmit} className="space-y-4 pt-1">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Enter your simple 4-digit master PIN code to configure default tag parameters and preview the layout customizer.
                  </p>
                  <div>
                    <input 
                      type="password"
                      value={pinInput}
                      onChange={(e) => { setPinInput(e.target.value); setPinError(""); }}
                      placeholder="Enter PIN Code"
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-blue-500 text-center font-mono tracking-widest text-lg"
                      autoFocus
                    />
                    {pinError && (
                      <p className="text-xs text-red-400 mt-1.5 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{pinError}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => { setShowPinModal(false); setPinInput(""); setPinError(""); }}
                      className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all shadow-md"
                    >
                      Unlock PIN
                    </button>
                  </div>
                </form>
              ) : (
                /* Firebase Account Auth tab */
                <form onSubmit={handleCloudAuthSubmit} className="space-y-4 pt-1">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {!isFirebaseConfigured 
                      ? "Cloud account utilizes Firebase Firestore. Please configure your Firebase environment variables to activate cloud authorization."
                      : "Login or register your child safety administrator account to secure data and isolate profile permissions."
                    }
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-mono text-slate-500 uppercase font-bold mb-1">Email Address</label>
                      <input 
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="admin@kurtzytags.com"
                        required
                        disabled={!isFirebaseConfigured || authLoading}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-blue-500 disabled:opacity-40"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-slate-500 uppercase font-bold mb-1">Password</label>
                      <input 
                        type="password"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="••••••••"
                        required
                        disabled={!isFirebaseConfigured || authLoading}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-blue-500 disabled:opacity-40"
                      />
                    </div>

                    {authError && (
                      <p className="text-xs text-red-400 font-semibold flex items-start gap-1 p-2 bg-red-500/5 rounded-lg border border-red-500/10">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span className="leading-snug">{authError}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      disabled={!isFirebaseConfigured || authLoading}
                      onClick={() => setIsSignUp(prev => !prev)}
                      className="text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors disabled:opacity-40 text-left"
                    >
                      {isSignUp ? "Already have an account? Sign In" : "Need a secure account? Register Now"}
                    </button>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => { setShowPinModal(false); setAuthError(""); }}
                        className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!isFirebaseConfigured || authLoading}
                        className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5"
                      >
                        {authLoading && <RefreshCw className="w-3 h-3 animate-spin" />}
                        <span>{isSignUp ? "Register" : "Sign In"}</span>
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* GDPR / COPPA COOKIE & DATA COMPLIANCE BANNER */}
      <AnimatePresence>
        {!cookieAccepted && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl p-4 shadow-2xl z-40 space-y-3 text-left"
          >
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400 mt-0.5">
                <Shield className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-100">COPPA & GDPR Privacy Compliance</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  We use secure sandboxed caching to protect child emergency metadata. By using Kurtzy wearable tag profiles, you accept our COPPA-compliant Privacy Policy and terms.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => { setShowComplianceModal(true); setComplianceTab("privacy"); }}
                className="text-[10px] font-semibold text-blue-400 hover:text-blue-300 font-mono transition-colors"
              >
                Review Policy
              </button>
              <button
                type="button"
                onClick={() => {
                  localStorage.setItem("kurtzy_cookie_consent", "true");
                  setCookieAccepted(true);
                }}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] rounded-lg transition-all"
              >
                Accept & Consent
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* COMPLIANCE & LEGAL MODAL */}
      <AnimatePresence>
        {showComplianceModal && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl text-left"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-blue-400" />
                  <div>
                    <h3 className="font-extrabold text-white text-base">Legal & Privacy Center</h3>
                    <p className="text-[10px] text-slate-500 font-mono">REGULATORY COMPLIANCE SYSTEM • VERSION 2026.1</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowComplianceModal(false)}
                  className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-slate-800 bg-slate-950/60 p-1">
                {(["terms", "privacy", "gdpr"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setComplianceTab(tab)}
                    className={`flex-1 py-2 text-center text-xs font-semibold rounded-lg font-mono transition-all ${
                      complianceTab === tab 
                        ? "bg-slate-900 text-blue-400 shadow-sm border border-slate-800/60" 
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {tab === "terms" && "Terms of Use"}
                    {tab === "privacy" && "Privacy Policy"}
                    {tab === "gdpr" && "Data Controls & Rights"}
                  </button>
                ))}
              </div>

              {/* Content Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-slate-300 text-xs leading-relaxed max-h-[50vh]">
                {complianceTab === "terms" && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-white text-sm">1. Emergency Tag Service Agreement</h4>
                    <p>
                      Kurtzy NFC Safety Tag systems offer smart-wearable supplementary support indicators. These services are intended solely to provide contact details to supportive observers in public areas. Kurtzy is not a replacement for parental guidance, professional child monitoring, or law enforcement supervision.
                    </p>
                    <h4 className="font-bold text-white text-sm">2. Authorized Use Guidelines</h4>
                    <p>
                      By configuring any profile, you affirm that you are the lawful biological parent, legal guardian, or authorized representative of the minor child depicted. Any fraudulent configurations, duplicate registrations of non-consenting parties, or misuse of active NFC chips to store malicious links is strictly prohibited and constitutes a material breach of terms.
                    </p>
                    <h4 className="font-bold text-white text-sm">3. Limitation of Liability</h4>
                    <p>
                      Our edge routers, databases, and network gateways operate with high durability protocols. However, system uptime depends on regional network operations, device compatibility, and public NFC signal accessibility. Under no circumstances shall Kurtzy, its load balancers, or its hosting partners be held liable for search delays, data sync failures during off-grid operations, or physical wear and tear on wearable safety tags.
                    </p>
                  </div>
                )}

                {complianceTab === "privacy" && (
                  <div className="space-y-4">
                    <div className="p-3 bg-blue-500/5 rounded-xl border border-blue-500/10 text-blue-300 text-[11px] space-y-1">
                      <p className="font-bold">🔒 Children's Online Privacy Protection Act (COPPA) Compliance</p>
                      <p>
                        We strictly enforce the children's online privacy rules. Kurtzy does not collect location coordinates, telemetry trackers, search queries, or behavioral metadata of minors. Emergency safety tag dashboards only display information voluntarily uploaded by legal guardians.
                      </p>
                    </div>
                    <h4 className="font-bold text-white text-sm">Data Minimization Principles</h4>
                    <p>
                      We enforce extreme data minimization. The registry portal holds only the vital attributes requested by you for medical or identification backup: name, birth date, blood type, and emergency contacts.
                    </p>
                    <h4 className="font-bold text-white text-sm">Transit & Load-Balanced Encryption</h4>
                    <p>
                      All network requests route through secure SSL/TLS. Our live edge load balancer distributes incoming scans and prevents brute-force scraping using modern IP lockout policies. Failed admin access attempts are locked after 5 sequential failures to prevent unauthorized tampering with child safety records.
                    </p>
                    <h4 className="font-bold text-white text-sm">Third-Party Disclosures</h4>
                    <p>
                      Kurtzy is fully independent. We maintain zero affiliate advertisements, third-party trackers, analytics, or broker integrations. Your data stays securely housed in your local application sandbox or your custom private Firebase Firestore.
                    </p>
                  </div>
                )}

                {complianceTab === "gdpr" && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-white text-sm">General Data Protection Regulation (GDPR) Right to Erasure</h4>
                    <p>
                      Under GDPR Art. 17 and CCPA specifications, you maintain complete ownership of your configured safety tags and can exercise your right to access, export, or completely delete your data at any moment.
                    </p>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-semibold">
                        GDPR Data Actions Console
                      </span>
                      <p className="text-[11px] text-slate-500">
                        Trigger an instantaneous purge of all locally stored cache and resets connection thresholds. This action is immediate and non-reversible.
                      </p>
                      
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
                              JSON.stringify({ profile, cookies: document.cookie }, null, 2)
                            )}`;
                            const downloadAnchor = document.createElement("a");
                            downloadAnchor.setAttribute("href", jsonString);
                            downloadAnchor.setAttribute("download", `kurtzy-compliance-export-${profile.id}.json`);
                            document.body.appendChild(downloadAnchor);
                            downloadAnchor.click();
                            downloadAnchor.remove();
                          }}
                          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-xs rounded-xl transition-all font-mono cursor-pointer"
                        >
                          📥 Export Safe Data Audit (JSON)
                        </button>

                        <button
                          type="button"
                          onClick={async () => {
                            if (confirm("Are you absolutely sure you want to purge all network logs, rate limit databases, and clear local storage permissions?")) {
                              localStorage.removeItem("kurtzy_cookie_consent");
                              localStorage.clear();
                              await handleResetSystemLimits();
                              setCookieAccepted(false);
                              setShowComplianceModal(false);
                              alert("Data subject request processed. Cache, storage keys, and rate-limiting databases successfully purged.");
                            }
                          }}
                          className="px-3.5 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-bold text-xs rounded-xl transition-all font-mono cursor-pointer"
                        >
                          ⚠️ Execute Instant Purge ("Right to be Forgotten")
                        </button>
                      </div>
                    </div>

                    <h4 className="font-bold text-white text-sm">Consent Verification</h4>
                    <p>
                      When you check the active consent controls in Kurtzy tag profile managers, you grant explicit consent for our load balancers to route emergency telemetry scan indicators to active guardians. You can withdraw this consent at any point by deleting your profile.
                    </p>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="p-5 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between">
                <span className="text-[9px] font-mono text-slate-500 uppercase">Registered with GDPR / CCPA Compliance Gateways</span>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem("kurtzy_cookie_consent", "true");
                    setCookieAccepted(true);
                    setShowComplianceModal(false);
                  }}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer"
                >
                  I Understand & Accept
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
