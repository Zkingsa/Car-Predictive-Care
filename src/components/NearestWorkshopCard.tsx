import React, { useState } from "react";
import {
  Building,
  Navigation,
  Phone,
  Clock,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Ticket,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { Workshop, Vehicle } from "../types";

interface NearestWorkshopCardProps {
  workshop: Workshop;
  vehicle?: Vehicle;
  onReserveBay?: (workshop: Workshop) => void;
  compact?: boolean;
}

export const NearestWorkshopCard: React.FC<NearestWorkshopCardProps> = ({
  workshop,
  vehicle,
  onReserveBay,
  compact = false,
}) => {
  const [reserved, setReserved] = useState(false);

  const handleReserve = () => {
    setReserved(true);
    if (onReserveBay) {
      onReserveBay(workshop);
    }
  };

  const handleOpenMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      workshop.name + " " + workshop.address
    )}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className={`rounded-2xl border bg-[#12151B] p-4 sm:p-5 shadow-xl transition-all ${
        workshop.distanceKm < 10
          ? "border-[#00D2C4]/50 bg-gradient-to-br from-[#0E1C1B] via-[#12151B] to-[#161920]"
          : "border-[#23272F] hover:border-[#353D4B]"
      }`}
    >
      {/* Header with Distance & Availability */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded bg-[#00D2C4] px-2 py-0.5 text-[10px] font-bold text-black uppercase tracking-wider">
              <Building size={11} /> Closest Certified Center
            </span>
            <span className="rounded bg-[#1A1E26] px-2 py-0.5 text-[10px] font-mono text-zinc-400 border border-[#262C37]">
              {workshop.city}
            </span>
          </div>

          <h3 className="font-display text-sm sm:text-base font-bold text-white mt-1.5 leading-snug">
            {workshop.name}
          </h3>

          <p className="text-xs text-zinc-400 mt-0.5">{workshop.address}</p>
        </div>

        {/* Distance Badge */}
        <div className="rounded-xl border border-[#00D2C4]/30 bg-[#00D2C4]/10 px-3 py-2 text-right shrink-0">
          <div className="font-display text-base sm:text-lg font-bold text-[#00D2C4]">
            {workshop.distanceKm} km
          </div>
          <div className="text-[10px] font-mono text-zinc-300">
            ~{workshop.driveTimeMin} min drive
          </div>
        </div>
      </div>

      {/* Capabilities & Open Bays */}
      {!compact && (
        <div className="my-3 grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3 border-t border-[#1E232B] text-xs">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium">{workshop.availableBays} Express Diagnostic Bays Open</span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-300 font-mono text-[11px]">
            <Clock size={12} className="text-[#00D2C4]" />
            <span>Next Slot: {workshop.nextAvailableSlot}</span>
          </div>
        </div>
      )}

      {/* Specialties Tags */}
      {!compact && (
        <div className="flex flex-wrap gap-1.5 my-2.5">
          {workshop.specialties.map((spec, i) => (
            <span
              key={i}
              className="rounded-md bg-[#181C24] px-2 py-0.5 text-[10px] text-zinc-300 border border-[#242A36]"
            >
              {spec}
            </span>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-[#20252F]">
        <button
          onClick={handleOpenMaps}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#2D3442] bg-[#161921] py-2 px-3 text-xs font-semibold text-zinc-200 hover:border-[#00D2C4]/50 hover:text-white transition-colors"
        >
          <Navigation size={13} className="text-[#00D2C4]" />
          <span>GPS Navigation</span>
        </button>

        <a
          href={`tel:${workshop.phone.replace(/[^0-9+]/g, "")}`}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-[#2D3442] bg-[#161921] py-2 px-3 text-xs font-semibold text-zinc-200 hover:border-[#00D2C4]/50 hover:text-white transition-colors"
        >
          <Phone size={13} className="text-[#00D2C4]" />
          <span className="hidden sm:inline">Call Workshop</span>
          <span className="sm:hidden">Call</span>
        </a>

        {onReserveBay && (
          <button
            onClick={handleReserve}
            disabled={reserved}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs font-bold transition-all shadow-sm ${
              reserved
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                : "bg-[#00D2C4] text-black hover:bg-[#00E5D4]"
            }`}
          >
            {reserved ? (
              <>
                <CheckCircle2 size={13} />
                <span>Bay Reserved</span>
              </>
            ) : (
              <>
                <Zap size={13} />
                <span>Transmit &amp; Reserve</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
