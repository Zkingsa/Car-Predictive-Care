import React, { useState } from "react";
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
  ShieldCheck,
  Car,
  Activity,
  Compass,
  LogIn,
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
}) => {
  const [vehicleMenuOpen, setVehicleMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];

  const TABS = [
    { id: "dashboard", label: "Dashboard", icon: Gauge },
    { id: "assistant", label: "AI Voice & Chat", icon: Sparkles, badge: "Voice" },
    { id: "tickets", label: "Support Tickets", icon: Ticket },
    { id: "shop", label: "OEM Shop", icon: ShoppingBag },
  ];

  const handleTabClick = (tabId: string) => {
    setTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#23272F] bg-[#08090B]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8 py-3">
        
        {/* Brand & Connected Emblem */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#1A1D24] to-[#0E1013] border border-[#2D333D] shadow-inner">
            <svg viewBox="0 0 24 24" className="h-5 w-5 sm:h-6 sm:w-6 text-[#00D2C4] fill-none stroke-current stroke-[1.8]" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D2C4] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00E5D4]"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-base sm:text-lg font-bold tracking-tight text-white">
                Predictive<span className="text-[#00D2C4]">Care</span>
              </span>
              <span className="hidden xl:inline-flex items-center gap-1 rounded bg-[#00D2C4]/10 px-1.5 py-0.5 text-[9px] font-semibold text-[#00D2C4] border border-[#00D2C4]/20 uppercase tracking-wider">
                Multi-Brand Fleet
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-[#8C93A0] tracking-wide hidden sm:block">
              DETECT · RESOLVE · SUPPLY
            </p>
          </div>
        </div>

        {/* Desktop Vehicle Quick Selector */}
        <div className="relative hidden xl:block">
          <button
            onClick={() => setVehicleMenuOpen(!vehicleMenuOpen)}
            className="flex items-center gap-2.5 rounded-lg border border-[#262A32] bg-[#121418] px-3 py-1.5 text-xs text-zinc-300 hover:border-[#00D2C4]/50 hover:bg-[#161920] transition-colors"
          >
            <span className="h-2 w-2 rounded-full bg-[#00D2C4]"></span>
            <div className="text-left">
              <div className="font-medium text-white">{selectedVehicle.name}</div>
              <div className="font-mono text-[10px] text-zinc-400">{selectedVehicle.vin.slice(0, 10)}...</div>
            </div>
            <ChevronDown size={14} className={`text-zinc-400 transition-transform ${vehicleMenuOpen ? "rotate-180" : ""}`} />
          </button>

          {vehicleMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-[#2A2F38] bg-[#111317] p-1.5 shadow-2xl z-50">
              <div className="px-2 py-1 text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">
                Active Fleet Vehicles
              </div>
              {vehicles.map((v) => (
                <button
                  key={v.id}
                  onClick={() => {
                    setSelectedVehicleId(v.id);
                    setVehicleMenuOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                    v.id === selectedVehicleId
                      ? "bg-[#00D2C4]/10 text-[#00D2C4] font-medium"
                      : "text-zinc-300 hover:bg-[#181B21] hover:text-white"
                  }`}
                >
                  <div>
                    <div className="font-medium">{v.name}</div>
                    <div className="text-[10px] text-zinc-500 font-mono">Health: {v.health}% · {v.type.toUpperCase()}</div>
                  </div>
                  {v.id === selectedVehicleId && <Check size={14} className="text-[#00D2C4]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* GPS Location Pill (Desktop) */}
        <div className="hidden 2xl:flex items-center">
          <button
            onClick={onOpenLocatorModal}
            className="flex items-center gap-2 rounded-lg border border-[#262A32] bg-[#121418] px-3 py-1.5 text-xs text-zinc-300 hover:border-[#00D2C4]/50 hover:bg-[#161920] transition-colors"
          >
            <MapPin size={13} className="text-[#00D2C4]" />
            <div className="text-left font-mono">
              <span className="text-white font-medium">{userLocation.label.split(",")[0]}</span>
              <span className="text-zinc-500 text-[10px]"> · Nearest: </span>
              <span className="text-[#00D2C4] text-[10px] font-bold">{nearestWorkshop.distanceKm} km</span>
            </div>
          </button>
        </div>

        {/* Desktop Navigation Tabs (Hidden on tablet/mobile where burger menu kicks in) */}
        <div className="hidden lg:flex items-center gap-1 sm:gap-2">
          <nav className="flex rounded-xl bg-[#111419] p-1 border border-[#23272F]">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = currentTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => handleTabClick(t.id)}
                  className={`relative flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition-all ${
                    active
                      ? "bg-[#1E232B] text-white shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-[#161920]"
                  }`}
                >
                  <Icon size={14} className={active ? "text-[#00D2C4]" : "text-zinc-400"} />
                  <span>{t.label}</span>
                  {t.badge && (
                    <span className="rounded bg-[#00D2C4]/20 px-1 py-0.2 text-[9px] font-bold text-[#00D2C4]">
                      {t.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Actions: Auth, Cart, and Burger Menu Button */}
        <div className="flex items-center gap-2">
          
          {/* User Account Pill / Login Button (Desktop) */}
          <button
            onClick={onOpenAuthModal}
            className="hidden md:flex items-center gap-2 rounded-xl border border-[#262A32] bg-[#121418] px-3 py-1.5 text-xs text-zinc-200 hover:border-[#00D2C4]/50 transition-colors"
          >
            {currentUser ? (
              <>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#00D2C4]/20 text-[#00D2C4] font-bold text-[10px]">
                  {currentUser.name.charAt(0).toUpperCase()}
                </span>
                <span className="font-medium text-white max-w-[100px] truncate">{currentUser.name}</span>
              </>
            ) : (
              <>
                <LogIn size={13} className="text-[#00D2C4]" />
                <span>Sign In / Register</span>
              </>
            )}
          </button>

          {/* Cart Trigger */}
          <button
            onClick={openCart}
            aria-label="View Cart"
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[#262A32] bg-[#121418] text-zinc-300 hover:border-[#00D2C4] hover:text-[#00D2C4] transition-colors"
          >
            <ShoppingBag size={16} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#00D2C4] px-1 text-[10px] font-bold text-black ring-2 ring-[#08090B]">
                {cartCount}
              </span>
            )}
          </button>

          {/* Hamburger Menu Toggle Button (Visible on screens < lg) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            className="lg:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-[#262A32] bg-[#121418] text-zinc-200 hover:border-[#00D2C4] hover:text-[#00D2C4] transition-colors"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

        </div>

      </div>

      {/* Hamburger Mobile & Tablet Dropdown / Slide-Over Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#23272F] bg-[#0C0E12] px-4 py-4 space-y-4 shadow-2xl animate-in slide-in-from-top-2 duration-200">
          
          {/* Navigation Links */}
          <div className="space-y-1">
            <div className="px-2 py-1 text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
              Navigation Modules
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {TABS.map((t) => {
                const Icon = t.icon;
                const active = currentTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => handleTabClick(t.id)}
                    className={`flex items-center gap-2 rounded-xl p-2.5 text-xs font-semibold transition-all ${
                      active
                        ? "bg-[#1E232B] text-white border border-[#00D2C4]/40"
                        : "bg-[#14171E] text-zinc-300 hover:bg-[#1A1E26] hover:text-white border border-[#20252F]"
                    }`}
                  >
                    <Icon size={16} className={active ? "text-[#00D2C4]" : "text-zinc-400"} />
                    <div className="text-left">
                      <div>{t.label}</div>
                      {t.badge && <span className="text-[9px] text-[#00D2C4]">{t.badge}</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile Vehicle Switcher */}
          <div className="space-y-1 pt-1 border-t border-[#1C2028]">
            <div className="px-2 py-1 text-[10px] font-bold tracking-wider text-zinc-500 uppercase flex items-center justify-between">
              <span>Connected Vehicle</span>
              <span className="text-[10px] text-[#00D2C4] font-mono">{vehicles.length} in fleet</span>
            </div>
            <div className="space-y-1">
              {vehicles.map((v) => (
                <button
                  key={v.id}
                  onClick={() => {
                    setSelectedVehicleId(v.id);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl p-2.5 text-left text-xs transition-colors ${
                    v.id === selectedVehicleId
                      ? "bg-[#00D2C4]/15 border border-[#00D2C4]/40 text-[#00D2C4]"
                      : "bg-[#14171E] border border-[#20252F] text-zinc-300 hover:bg-[#1A1E26]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Car size={15} className={v.id === selectedVehicleId ? "text-[#00D2C4]" : "text-zinc-400"} />
                    <div>
                      <div className="font-medium text-white">{v.name}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">Health: {v.health}% · {v.type.toUpperCase()}</div>
                    </div>
                  </div>
                  {v.id === selectedVehicleId && <Check size={14} className="text-[#00D2C4]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile GPS Location & Service Finder Button */}
          <div className="pt-1 border-t border-[#1C2028]">
            <button
              onClick={() => {
                onOpenLocatorModal();
                setMobileMenuOpen(false);
              }}
              className="flex w-full items-center justify-between rounded-xl bg-[#14171E] border border-[#20252F] p-2.5 text-xs text-zinc-200 hover:border-[#00D2C4]/40"
            >
              <div className="flex items-center gap-2">
                <Compass size={16} className="text-[#00D2C4]" />
                <div className="text-left">
                  <div className="text-[10px] text-zinc-400">GPS & Nearest Workshop</div>
                  <div className="font-medium text-white">{nearestWorkshop.name} ({nearestWorkshop.distanceKm} km)</div>
                </div>
              </div>
              <span className="rounded bg-[#00D2C4]/20 px-2 py-0.5 text-[10px] font-bold text-[#00D2C4]">
                Locate
              </span>
            </button>
          </div>

          {/* Mobile Account / Auth Button */}
          <div className="pt-1 border-t border-[#1C2028]">
            <button
              onClick={() => {
                onOpenAuthModal();
                setMobileMenuOpen(false);
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#00D2C4] py-2.5 text-xs font-bold text-black hover:bg-[#00E5D4] transition-colors"
            >
              {currentUser ? (
                <>
                  <UserIcon size={15} />
                  <span>Manage Account ({currentUser.name})</span>
                </>
              ) : (
                <>
                  <LogIn size={15} />
                  <span>Sign In or Register Connected Hub</span>
                </>
              )}
            </button>
          </div>

        </div>
      )}
    </header>
  );
};
