import React, { useState } from "react";
import {
  Building,
  MapPin,
  Navigation,
  Phone,
  Clock,
  ShieldCheck,
  Zap,
  X,
  Search,
  CheckCircle2,
  Radio,
  Compass,
} from "lucide-react";
import { Workshop, Vehicle, UserLocation } from "../types";
import { NearestWorkshopCard } from "./NearestWorkshopCard";

interface ServiceLocatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  workshops: Workshop[];
  userLocation: UserLocation;
  onUpdateLocation: (location: UserLocation) => void;
  onDetectGps: () => void;
  isDetectingGps: boolean;
  vehicle: Vehicle;
  onReserveBay: (workshop: Workshop) => void;
}

export const ServiceLocatorModal: React.FC<ServiceLocatorModalProps> = ({
  isOpen,
  onClose,
  workshops,
  userLocation,
  onUpdateLocation,
  onDetectGps,
  isDetectingGps,
  vehicle,
  onReserveBay,
}) => {
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");

  if (!isOpen) return null;

  const locationPresets: UserLocation[] = [
    { label: "Sandton, JHB (HQ)", lat: -26.1076, lng: 28.0567 },
    { label: "Rosebank, JHB", lat: -26.1458, lng: 28.0416 },
    { label: "Menlyn, Pretoria", lat: -25.7828, lng: 28.2758 },
    { label: "Century City, Cape Town", lat: -33.8928, lng: 18.5085 },
    { label: "Umhlanga Ridge, Durban", lat: -29.7285, lng: 31.0658 },
  ];

  const filteredWorkshops = workshops.filter((w) => {
    if (selectedCity !== "all" && w.city.toLowerCase() !== selectedCity.toLowerCase()) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        w.name.toLowerCase().includes(q) ||
        w.address.toLowerCase().includes(q) ||
        w.city.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl rounded-2xl border border-[#2B313D] bg-[#111317] p-5 sm:p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto scrollbar">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#23272F] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00D2C4]/15 border border-[#00D2C4]/30 text-[#00D2C4]">
              <Compass size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-lg font-bold text-white">
                  Certified Workshop &amp; Service Locator
                </h3>
                <span className="rounded bg-[#00D2C4]/15 px-2 py-0.5 text-[10px] font-bold text-[#00D2C4] border border-[#00D2C4]/20">
                  GPS Active
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Live distance, express bay status &amp; direct telemetry transmission for your {vehicle.name}
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

        {/* Location Detection & Presets Bar */}
        <div className="rounded-xl border border-[#23272F] bg-[#161920] p-3.5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-zinc-300">
              <MapPin size={15} className="text-[#00D2C4]" />
              <span>Current GPS Location:</span>
              <strong className="text-white font-mono">{userLocation.label}</strong>
            </div>

            <button
              onClick={onDetectGps}
              disabled={isDetectingGps}
              className="flex items-center gap-1.5 rounded-lg border border-[#00D2C4]/40 bg-[#00D2C4]/10 px-3 py-1.5 text-xs font-semibold text-[#00D2C4] hover:bg-[#00D2C4]/20 transition-all disabled:opacity-50"
            >
              <Radio size={12} className={isDetectingGps ? "animate-spin" : "animate-pulse"} />
              <span>{isDetectingGps ? "Acquiring GPS..." : "Detect Live Device GPS"}</span>
            </button>
          </div>

          {/* Quick Preset Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase shrink-0">
              Preset Locs:
            </span>
            {locationPresets.map((loc, i) => (
              <button
                key={i}
                onClick={() => onUpdateLocation(loc)}
                className={`rounded-lg px-2.5 py-1 text-xs whitespace-nowrap border transition-all ${
                  userLocation.label === loc.label
                    ? "border-[#00D2C4] bg-[#00D2C4]/20 text-[#00E5D4] font-semibold"
                    : "border-[#282F3B] bg-[#111317] text-zinc-400 hover:text-white"
                }`}
              >
                {loc.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search & City Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by facility name, address, or city..."
              className="w-full rounded-xl border border-[#2B313D] bg-[#161920] pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#00D2C4] focus:outline-none"
            />
          </div>

          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="rounded-xl border border-[#2B313D] bg-[#161920] px-3.5 py-2 text-xs text-zinc-300 focus:border-[#00D2C4] focus:outline-none"
          >
            <option value="all">All Service Hubs</option>
            <option value="johannesburg">Johannesburg</option>
            <option value="pretoria">Pretoria</option>
            <option value="cape town">Cape Town</option>
            <option value="durban">Durban</option>
          </select>
        </div>

        {/* Workshop Cards List */}
        <div className="space-y-4">
          {filteredWorkshops.map((workshop) => (
            <NearestWorkshopCard
              key={workshop.id}
              workshop={workshop}
              vehicle={vehicle}
              onReserveBay={(ws) => {
                onReserveBay(ws);
                onClose();
              }}
            />
          ))}
        </div>

      </div>
    </div>
  );
};
