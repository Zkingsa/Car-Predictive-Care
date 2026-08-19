import React, { useState } from "react";
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  ShieldCheck,
  Zap,
  CheckCircle2,
  LogOut,
  ArrowRight,
  Car,
  KeyRound,
} from "lucide-react";
import { User } from "../types";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onLogin: (user: User) => void;
  onLogout: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout,
}) => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [vehicleBrand, setVehicleBrand] = useState("Universal / Multi-Brand");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    const user: User = {
      id: "usr-" + Date.now(),
      name: name.trim() || email.split("@")[0],
      email: email.trim(),
      memberSince: "August 2026",
      role: "Vehicle Master",
      avatarColor: "#00D2C4",
    };

    onLogin(user);
    setSuccessMsg(mode === "login" ? "Signed in successfully!" : "Account created successfully!");
    setTimeout(() => {
      setSuccessMsg("");
      onClose();
    }, 1000);
  };

  const handleDemoLogin = () => {
    const demoUser: User = {
      id: "usr-demo",
      name: "Alex Sterling",
      email: "alex.sterling@connectedcar.io",
      memberSince: "January 2026",
      role: "Fleet Owner",
      avatarColor: "#00D2C4",
    };
    onLogin(demoUser);
    setSuccessMsg("Logged in with Demo Profile!");
    setTimeout(() => {
      setSuccessMsg("");
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-[#2B313D] bg-[#111317] p-5 sm:p-6 shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#23272F] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00D2C4]/15 border border-[#00D2C4]/30 text-[#00D2C4]">
              {currentUser ? <UserIcon size={20} /> : <Lock size={20} />}
            </div>
            <div>
              <h3 className="font-display text-base sm:text-lg font-bold text-white">
                {currentUser ? "Owner Profile" : mode === "login" ? "Account Sign In" : "Register Connected Hub"}
              </h3>
              <p className="text-xs text-zinc-400">
                {currentUser ? "Connected Fleet Master Account" : "Access live telematics & synced service history"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-[#1E232B] hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Success Banner */}
        {successMsg && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 text-xs text-emerald-400">
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* If Already Logged In */}
        {currentUser ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-[#262C38] bg-[#161921] p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#00D2C4]/20 border border-[#00D2C4] text-[#00D2C4] font-bold text-lg font-display">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-display text-sm font-bold text-white flex items-center gap-2">
                    <span>{currentUser.name}</span>
                    <span className="rounded bg-[#00D2C4]/15 px-1.5 py-0.5 text-[9px] font-bold text-[#00D2C4] border border-[#00D2C4]/30 uppercase">
                      {currentUser.role}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-400 font-mono mt-0.5">{currentUser.email}</div>
                  <div className="text-[10px] text-zinc-500 mt-1">Member since {currentUser.memberSince}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#232833] text-xs">
                <div className="rounded-lg bg-[#111317] p-2 border border-[#20252F]">
                  <div className="text-[10px] text-zinc-500">Connected Vehicles</div>
                  <div className="font-mono text-sm font-bold text-white mt-0.5">5 Active</div>
                </div>
                <div className="rounded-lg bg-[#111317] p-2 border border-[#20252F]">
                  <div className="text-[10px] text-zinc-500">Service Coverage</div>
                  <div className="font-mono text-sm font-bold text-emerald-400 mt-0.5">Premium 24/7</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/40 bg-rose-950/20 py-2.5 text-xs font-bold text-rose-400 hover:bg-rose-950/40 transition-colors"
            >
              <LogOut size={14} />
              <span>Sign Out of Connected Account</span>
            </button>
          </div>
        ) : (
          /* Form for Login / Register */
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-[#161921] p-1 border border-[#23272F]">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`rounded-lg py-1.5 text-xs font-semibold transition-all ${
                  mode === "login"
                    ? "bg-[#222834] text-white shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode("register")}
                className={`rounded-lg py-1.5 text-xs font-semibold transition-all ${
                  mode === "register"
                    ? "bg-[#222834] text-white shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Inputs */}
            {mode === "register" && (
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                  Full Name / Fleet Manager
                </label>
                <div className="relative">
                  <UserIcon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Sterling"
                    className="w-full rounded-xl border border-[#2A303D] bg-[#161920] pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#00D2C4] focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@connectedcar.io"
                  className="w-full rounded-xl border border-[#2A303D] bg-[#161920] pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#00D2C4] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                Password
              </label>
              <div className="relative">
                <KeyRound size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-[#2A303D] bg-[#161920] pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#00D2C4] focus:outline-none"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#00D2C4] py-2.5 text-xs font-bold text-black hover:bg-[#00E5D4] transition-colors shadow-md"
              >
                <span>{mode === "login" ? "Sign In to Hub" : "Create Account & Connect Fleet"}</span>
                <ArrowRight size={14} />
              </button>

              {/* Fast 1-Click Demo Login */}
              <button
                type="button"
                onClick={handleDemoLogin}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#2F3644] bg-[#161921] py-2 text-xs font-semibold text-zinc-300 hover:border-[#00D2C4]/40 hover:text-white transition-colors"
              >
                <Zap size={13} className="text-[#00D2C4]" />
                <span>1-Click Demo Owner Sign In</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
