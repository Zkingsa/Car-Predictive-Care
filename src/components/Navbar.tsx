import React, { useState, useEffect, useRef } from "react";
import {
  Gauge,
  Sparkles,
  Ticket,
  ShoppingBag,
  ChevronDown,
  Check,
  MapPin,
  Menu,
  X,
  User as UserIcon,
  Car,
  Compass,
  LogIn,
  Sun,
  Moon,
  ShieldCheck,
  Radio,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { Vehicle, UserLocation, Workshop, User } from "../types";

interface NavbarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  vehicles: Vehicle[];
  selectedVehicleId: string;
  setSelectedVehicleId: (id: string) => void;
  cartCount: number;
  openCart: () => void;
  userLocation: UserLocation;
  nearestWorkshop: Workshop;
  onOpenLocatorModal: () => void;
  currentUser: User | null;
  onOpenAuthModal: () => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setTab,
  vehicles,
  selectedVehicleId,
  setSelectedVehicleId,
  cartCount,
  openCart,
  userLocation,
  nearestWorkshop,
  onOpenLocatorModal,
  currentUser,
  onOpenAuthModal,
  theme,
  onToggleTheme,
}) => {
  const [vehicleMenuOpen, setVehicleMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const vehicleDropdownRef = useRef<HTMLDivElement>(null);

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];

  const TABS = [
    { id: "dashboard", label: "Dashboard", icon: Gauge, desc: "Live health & diagnostics" },
    { id: "assistant", label: "AI Assistant", icon: Sparkles, desc: "Voice & conversational triage" },
    { id: "tickets", label: "Tickets", icon: Ticket, desc: "Prioritized service queue" },
    { id: "shop", label: "OEM Shop", icon: ShoppingBag, desc: "Direct replacement parts" },
  ];

  // Close vehicle dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        vehicleDropdownRef.current &&
        !vehicleDropdownRef.current.contains(event.target as Node)
      ) {
        setVehicleMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTabClick = (tabId: string) => {
    setTab(tabId);
    setDrawerOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-[#23272F]/80 bg-[#08090B]/90 backdrop-blur-md transition-colors duration-200">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* ========================================================================= */}
          {/* 1. Left: Brand Anchor                                                     */}
          {/* ========================================================================= */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTab("dashboard")}
              className="group flex items-center gap-2.5 text-left focus:outline-none"
            >
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#1A1D24] to-[#0E1013] border border-[#2D333D] shadow-sm group-hover:border-[#00D2C4]/50 transition-colors">
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5 text-[#00D2C4] fill-none stroke-current stroke-[2]"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
                <span className="absolute -bottom-0.5 -right-0.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D2C4] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00E5D4]"></span>
                </span>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-display text-base font-bold tracking-tight text-white group-hover:text-zinc-100 transition-colors">
                    Predictive<span className="text-[#00D2C4]">Care</span>
                  </span>
                  <span className="flex items-center gap-1 rounded-md border border-amber-400/30 bg-amber-400/10 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-amber-300">
                    <Radio size={9} /> DEMO
                  </span>
                </div>
              </div>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* 2. Center: Sleek Segmented Primary Navigation (Desktop)                   */}
          {/* ========================================================================= */}
          <nav className="hidden lg:flex items-center rounded-xl bg-[#111317]/80 p-1 border border-[#23272F]/70 shadow-inner">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = currentTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => handleTabClick(t.id)}
                  className={`relative flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all ${
                    active
                      ? "bg-[#1E232B] text-white shadow-sm font-bold"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-[#161920]/60"
                  }`}
                >
                  <Icon
                    size={14}
                    className={active ? "text-[#00D2C4]" : "text-zinc-400"}
                  />
                  <span>{t.label}</span>
                  {active && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-[#00D2C4]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* ========================================================================= */}
          {/* 3. Right: Clean Utility Suite + Burger Menu Button                        */}
          {/* ========================================================================= */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Quick Vehicle Selector (Desktop xl+) */}
            <div className="relative hidden xl:block" ref={vehicleDropdownRef}>
              <button
                onClick={() => setVehicleMenuOpen(!vehicleMenuOpen)}
                className={`flex items-center gap-2 rounded-xl border px-2.5 py-1.5 text-xs transition-all ${
                  vehicleMenuOpen
                    ? "border-[#00D2C4] bg-[#161920] text-white shadow-sm"
                    : "border-[#262A32] bg-[#121418] text-zinc-300 hover:border-zinc-500 hover:text-white"
                }`}
              >
                <Car size={13} className="text-[#00D2C4]" />
                <span className="font-medium max-w-[100px] truncate">{selectedVehicle.name}</span>
                <ChevronDown
                  size={13}
                  className={`text-zinc-400 transition-transform duration-200 ${
                    vehicleMenuOpen ? "rotate-180 text-[#00D2C4]" : ""
                  }`}
                />
              </button>

              {vehicleMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl border border-[#2B313D] bg-[#111317] p-1.5 shadow-2xl z-50 animate-in fade-in-50 zoom-in-95 duration-150">
                  <div className="px-2.5 py-1.5 text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
                    Switch Active Fleet Vehicle
                  </div>
                  <div className="space-y-0.5">
                    {vehicles.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => {
                          setSelectedVehicleId(v.id);
                          setVehicleMenuOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                          v.id === selectedVehicleId
                            ? "bg-[#00D2C4]/15 text-[#00D2C4] font-semibold"
                            : "text-zinc-300 hover:bg-[#181B21] hover:text-white"
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="font-medium text-white">{v.name}</div>
                          <div className="text-[10px] text-zinc-400 font-mono">
                            Health {v.health}% · {v.type.toUpperCase()}
                          </div>
                        </div>
                        {v.id === selectedVehicleId && (
                          <Check size={14} className="text-[#00D2C4]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick GPS Locator Button (Desktop) */}
            <button
              onClick={onOpenLocatorModal}
              title={`Nearest Service: ${nearestWorkshop.name} (${nearestWorkshop.distanceKm} km)`}
              className="hidden sm:flex items-center gap-1.5 rounded-xl border border-[#262A32] bg-[#121418] px-2.5 py-1.5 text-xs text-zinc-300 hover:border-[#00D2C4]/50 hover:text-white transition-colors"
            >
              <MapPin size={13} className="text-[#00D2C4]" />
              <span className="font-mono text-[11px] text-zinc-300">
                {nearestWorkshop.distanceKm} km
              </span>
            </button>

            {/* Day / Night Theme Toggle */}
            <button
              onClick={onToggleTheme}
              aria-label={theme === "dark" ? "Switch to Day Mode" : "Switch to Night Mode"}
              title={theme === "dark" ? "Switch to Day Mode (Light Theme)" : "Switch to Night Mode (Dark HUD)"}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#262A32] bg-[#121418] text-zinc-300 hover:border-[#00D2C4]/50 hover:text-white transition-colors"
            >
              {theme === "dark" ? (
                <Sun size={15} className="text-amber-400 hover:rotate-45 transition-transform duration-300" />
              ) : (
                <Moon size={15} className="text-indigo-600 hover:-rotate-12 transition-transform duration-300" />
              )}
            </button>

            {/* Cart Icon Button */}
            <button
              onClick={openCart}
              aria-label="Shopping Cart"
              title="View Parts Cart"
              className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[#262A32] bg-[#121418] text-zinc-300 hover:border-[#00D2C4] hover:text-[#00D2C4] transition-colors"
            >
              <ShoppingBag size={15} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#00D2C4] px-1 text-[9px] font-bold text-black ring-2 ring-[#08090B]">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Account / Sign-In Button */}
            <button
              onClick={onOpenAuthModal}
              className="hidden sm:flex items-center gap-2 rounded-xl border border-[#262A32] bg-[#121418] px-2.5 sm:px-3 py-1.5 text-xs text-zinc-200 hover:border-[#00D2C4]/50 transition-colors"
            >
              {currentUser ? (
                <>
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#00D2C4]/20 text-[#00D2C4] font-bold text-[10px]">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="font-medium text-white max-w-[80px] truncate">
                    {currentUser.name.split(" ")[0]}
                  </span>
                </>
              ) : (
                <>
                  <LogIn size={13} className="text-[#00D2C4]" />
                  <span>Sign In</span>
                </>
              )}
            </button>

            {/* Master Burger Menu Button (Visible on all screen sizes) */}
            <button
              onClick={() => setDrawerOpen(!drawerOpen)}
              aria-label="Toggle Burger Menu"
              title="Open Navigation Drawer"
              className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all ${
                drawerOpen
                  ? "border-[#00D2C4] bg-[#00D2C4]/15 text-[#00D2C4]"
                  : "border-[#262A32] bg-[#121418] text-zinc-200 hover:border-[#00D2C4] hover:text-[#00D2C4]"
              }`}
            >
              {drawerOpen ? <X size={17} /> : <Menu size={17} />}
            </button>

          </div>

        </div>
      </header>

      {/* ========================================================================= */}
      {/* 4. Sleek Master Slide-Over Drawer (Burger Menu)                           */}
      {/* ========================================================================= */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          />

          {/* Drawer Panel */}
          <div className="relative z-10 w-full max-w-sm h-full bg-[#0C0E12] border-l border-[#23272F] shadow-2xl p-5 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            
            {/* Drawer Header */}
            <div className="space-y-4">
              
              <div className="flex items-center justify-between pb-3 border-b border-[#1C2028]">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00D2C4]/15 border border-[#00D2C4]/30 text-[#00D2C4]">
                    <Menu size={16} />
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-bold text-white">
                      Fleet Menu
                    </h3>
                    <p className="text-[10px] text-zinc-400">
                      Predictive Care Hub
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setDrawerOpen(false)}
                  className="rounded-lg p-1.5 text-zinc-400 hover:bg-[#181B21] hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* User / Profile Section */}
              <div className="rounded-xl border border-[#23272F] bg-[#14171E] p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#00D2C4]/20 text-[#00D2C4] font-bold text-xs">
                      {currentUser ? currentUser.name.charAt(0).toUpperCase() : <UserIcon size={16} />}
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-white">
                        {currentUser ? currentUser.name : "Guest User"}
                      </div>
                      <div className="text-[10px] text-zinc-400">
                        {currentUser ? currentUser.role : "Sign in to sync your vehicles"}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onOpenAuthModal();
                    setDrawerOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-[#1E232B] hover:bg-[#252B36] py-1.5 text-[11px] font-semibold text-white border border-[#2E3542] transition-colors"
                >
                  {currentUser ? "Manage Profile & Logout" : "Sign In or Register"}
                </button>
              </div>

              {/* Primary Navigation Modules */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase px-1">
                  Navigation
                </div>
                <div className="space-y-1">
                  {TABS.map((t) => {
                    const Icon = t.icon;
                    const active = currentTab === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => handleTabClick(t.id)}
                        className={`w-full flex items-center justify-between rounded-xl p-2.5 text-xs font-semibold transition-all ${
                          active
                            ? "bg-[#00D2C4]/15 text-[#00D2C4] border border-[#00D2C4]/40"
                            : "bg-[#14171E] text-zinc-300 hover:bg-[#1A1E26] hover:text-white border border-[#20252F]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon size={16} className={active ? "text-[#00D2C4]" : "text-zinc-400"} />
                          <div className="text-left">
                            <div className="text-white font-medium">{t.label}</div>
                            <div className="text-[10px] text-zinc-400">{t.desc}</div>
                          </div>
                        </div>
                        <ChevronRight size={14} className="text-zinc-500" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Connected Vehicle Selector */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase px-1 flex items-center justify-between">
                  <span>Connected Fleet Vehicle</span>
                  <span className="text-[#00D2C4] font-mono text-[10px]">{vehicles.length} available</span>
                </div>
                <div className="space-y-1">
                  {vehicles.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => {
                        setSelectedVehicleId(v.id);
                        setDrawerOpen(false);
                      }}
                      className={`w-full flex items-center justify-between rounded-xl p-2.5 text-left text-xs transition-colors ${
                        v.id === selectedVehicleId
                          ? "bg-[#00D2C4]/15 border border-[#00D2C4]/40 text-[#00D2C4]"
                          : "bg-[#14171E] border border-[#20252F] text-zinc-300 hover:bg-[#1A1E26]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Car size={15} className={v.id === selectedVehicleId ? "text-[#00D2C4]" : "text-zinc-400"} />
                        <div>
                          <div className="font-medium text-white">{v.name}</div>
                          <div className="text-[10px] text-zinc-500 font-mono">
                            Health {v.health}% · {v.type.toUpperCase()}
                          </div>
                        </div>
                      </div>
                      {v.id === selectedVehicleId && <Check size={14} className="text-[#00D2C4]" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* GPS & Nearest Workshop Finder */}
              <div className="pt-1">
                <button
                  onClick={() => {
                    onOpenLocatorModal();
                    setDrawerOpen(false);
                  }}
                  className="w-full flex items-center justify-between rounded-xl bg-[#14171E] border border-[#20252F] p-2.5 text-xs text-zinc-200 hover:border-[#00D2C4]/40 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Compass size={16} className="text-[#00D2C4]" />
                    <div className="text-left">
                      <div className="text-[10px] text-zinc-400">GPS &amp; Workshop Locator</div>
                      <div className="font-medium text-white">{nearestWorkshop.name} ({nearestWorkshop.distanceKm} km)</div>
                    </div>
                  </div>
                  <span className="rounded bg-[#00D2C4]/20 px-2 py-0.5 text-[10px] font-bold text-[#00D2C4]">
                    Locate
                  </span>
                </button>
              </div>

              {/* Day / Night Mode Switcher */}
              <div className="pt-1">
                <button
                  onClick={onToggleTheme}
                  className="w-full flex items-center justify-between rounded-xl bg-[#14171E] border border-[#20252F] p-2.5 text-xs text-zinc-200 hover:border-[#00D2C4]/40 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    {theme === "dark" ? (
                      <Sun size={16} className="text-amber-400" />
                    ) : (
                      <Moon size={16} className="text-indigo-600" />
                    )}
                    <div className="text-left">
                      <div className="text-[10px] text-zinc-400">Appearance Mode</div>
                      <div className="font-medium text-white">
                        {theme === "dark" ? "Dark HUD Mode" : "Day Light Mode"}
                      </div>
                    </div>
                  </div>
                  <span className="rounded bg-[#00D2C4]/20 px-2 py-0.5 text-[10px] font-bold text-[#00D2C4]">
                    Toggle
                  </span>
                </button>
              </div>

            </div>

            {/* Drawer Footer */}
            <div className="pt-4 border-t border-[#1C2028] text-[10px] font-mono text-zinc-500 flex items-center justify-between">
              <span>PredictiveCare Core v3.4</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                CAN-Bus Synced
              </span>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
