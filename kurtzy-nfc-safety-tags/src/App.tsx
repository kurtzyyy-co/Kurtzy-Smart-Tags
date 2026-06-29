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
  Database
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { TagProfile, Contact } from "./types";
import SkeletonScreen from "./components/SkeletonScreen";

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
    childName: "Emma Miller",
    contacts: [
      { role: "Mom", name: "Sarah Miller", phone: "+1 (555) 019-2834" },
      { role: "Dad", name: "Robert Miller", phone: "+1 (555) 019-2835" }
    ],
    tagColor: "transparent",
    bloodGroup: "B-Positive",
    age: "6 Years",
    engravingText: "Emma M. — One Tap Away",
    adEmail: "order@kurtzytags.com",
    adWhatsapp: "+1 (555) 019-2834",
    adInstagram: "@kurtzytags"
  });

  const [allProfiles, setAllProfiles] = useState<Record<string, TagProfile>>({});
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newProfileId, setNewProfileId] = useState<string>("");
  const [newProfileName, setNewProfileName] = useState<string>("");

  // UI state
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Rotate state for the 3D Tag Preview
  const [tiltX, setTiltX] = useState<number>(12);
  const [tiltY, setTiltY] = useState<number>(-18);

  const isLoaded = useRef<boolean>(false);

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
      const res = await fetch(`/api/profiles/${id}?t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setProfile({
          ...data,
          adEmail: data.adEmail || "order@kurtzytags.com",
          adWhatsapp: data.adWhatsapp || "+1 (555) 019-2834",
          adInstagram: data.adInstagram || "@kurtzytags"
        });
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
      const res = await fetch("/api/profiles");
      if (res.ok) {
        const data = await res.json();
        setAllProfiles(data);
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

      const res = await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalProfile)
      });
      if (res.ok) {
        setSaveSuccess(true);
        // Refresh local allProfiles list
        fetchProfilesList();
        setTimeout(() => setSaveSuccess(false), 2000);
      }
    } catch (err) {
      console.error("Save profile error:", err);
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
      age: "5 Years",
      engravingText: `${newProfileName} — Tap For Safety`,
      adEmail: profile.adEmail || "order@kurtzytags.com",
      adWhatsapp: profile.adWhatsapp || "+1 (555) 019-2834",
      adInstagram: profile.adInstagram || "@kurtzytags",
      userId: firebaseUser ? firebaseUser.uid : ""
    };

    setIsSaving(true);
    try {
      const res = await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProfile)
      });
      if (res.ok) {
        setAllProfiles(prev => ({ ...prev, [sanitizedId]: newProfile }));
        setCurrentProfileId(sanitizedId);
        setProfile(newProfile);
        setShowCreateModal(false);
        setNewProfileId("");
        setNewProfileName("");
      }
    } catch (err) {
      console.error("Error creating new profile:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Check PIN to enter Admin mode (PIN: 0815)
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === "0815") {
      setIsAdmin(true);
      setShowPinModal(false);
      setPinInput("");
      setPinError("");
    } else {
      setPinError("Incorrect PIN. Please try again.");
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
              <span className="text-[10px] block font-mono text-slate-400 tracking-wider">SMOOTH SAFETY TAGS</span>
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
                  <span className="font-semibold text-slate-200">{profile.age || "6 Years"}</span>
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
                      <div className="flex-1 sm:flex-initial flex flex-col items-start">
                        <span className="text-[9px] font-mono text-slate-500 uppercase font-bold mb-1">Switch Customer</span>
                        <select
                          value={profile.id}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val) {
                              setCurrentProfileId(val);
                            }
                          }}
                          className="w-full sm:w-44 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 font-medium focus:outline-none focus:border-blue-500"
                        >
                          {Object.keys(allProfiles).length > 0 ? (
                            Object.keys(allProfiles).map(id => (
                              <option key={id} value={id}>
                                {id} ({allProfiles[id].childName})
                              </option>
                            ))
                          ) : (
                            <option value={profile.id}>{profile.id} ({profile.childName})</option>
                          )}
                        </select>
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
                  <div className="p-4 bg-blue-500/5 border border-blue-500/15 rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-blue-400 font-bold font-mono text-[10px] uppercase tracking-wider">
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>CUSTOMER NFC TARGET LINK</span>
                      </div>
                      <span className="text-[9px] font-mono text-slate-500 font-bold">LIVE REDIRECT</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Write this unique customer URL to the physical NFC children's wearable or keytag. When scanned, bystanders can access this profile instantly.
                    </p>
                    <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800">
                      <span className="font-mono text-xs text-slate-300 flex-1 truncate select-all px-1">
                        {window.location.origin}/{profile.id}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/${profile.id}`);
                          setIsCopied(true);
                          setTimeout(() => setIsCopied(false), 2000);
                        }}
                        className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white text-[11px] font-bold rounded transition-colors"
                      >
                        {isCopied ? "Copied!" : "Copy URL"}
                      </button>
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
                        <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1.5">Age of Child</label>
                        <input 
                          type="text" 
                          value={profile.age || ""} 
                          onChange={(e) => setProfile(prev => ({ ...prev, age: e.target.value }))}
                          placeholder="e.g. 6 Years"
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
          </>
        )}
      </main>

      {/* Footer Branding & Disclaimer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 px-6 text-center text-xs text-slate-500 mt-12 space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Shield className="w-4 h-4 text-slate-600" />
          <span className="font-mono text-[11px] tracking-wider uppercase font-bold text-slate-400">KURTZY NFC SAFETY NETWORK</span>
        </div>
        <p className="max-w-md mx-auto leading-relaxed">
          The ultimate smart wearable safety tags. Handcrafted physical tags linked to secure contact dashboards. Locked for safety, accessible for support.
        </p>
        <p className="text-[10px] text-slate-600">
          © 2026 Kurtzy. All rights reserved.
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
                      placeholder="Enter PIN (Default: 0815)"
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
    </div>
  );
}
