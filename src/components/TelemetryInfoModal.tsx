import React from "react";
import { Activity, Radio, Cpu, ShieldCheck, X, Zap, Gauge, CheckCircle2 } from "lucide-react";
import { Vehicle } from "../types";

interface TelemetryInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle;
}

export const TelemetryInfoModal: React.FC<TelemetryInfoModalProps> = ({
  isOpen,
  onClose,
  vehicle,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-[#2B313D] bg-[#111317] p-6 shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#23272F] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <Radio size={18} className="animate-pulse" />
            </div>
            <div>
              <h3 className="font-display text-base sm:text-lg font-bold text-white">
                Live Telemetry Synchronized
              </h3>
              <p className="text-xs text-zinc-400">
                Continuous CAN-Bus Sensor &amp; Cloud Telematics Feed
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-[#1C2028] hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Core Explanation */}
        <div className="space-y-3 text-xs leading-relaxed text-zinc-300">
          <p>
            <strong className="text-white">“Live Telemetry Synchronized”</strong> signifies that your vehicle's internal onboard diagnostics computer (CAN-Bus network) is actively transmitting real-time sensor metrics to the Predictive Care engine.
          </p>

          {/* Key Capabilities Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            
            <div className="rounded-xl border border-[#23272F] bg-[#161920] p-3 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-white">
                <Gauge size={14} className="text-[#00D2C4]" />
                <span>Sub-Second Sensor Polling</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Monitors tire pressure per corner, brake pad thickness (mm), rotor wear, and thermal curves.
              </p>
            </div>

            <div className="rounded-xl border border-[#23272F] bg-[#161920] p-3 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-white">
                <Zap size={14} className="text-amber-400" />
                <span>Early Fault Warning</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Identifies micro-deviations weeks before a mechanical failure or check-engine light triggers.
              </p>
            </div>

            <div className="rounded-xl border border-[#23272F] bg-[#161920] p-3 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-white">
                <Cpu size={14} className="text-indigo-400" />
                <span>Automated AI Triage</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Passes live Diagnostic Trouble Codes (DTCs) straight to the AI Assistant and Certified Workshops.
              </p>
            </div>

            <div className="rounded-xl border border-[#23272F] bg-[#161920] p-3 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-white">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>Zero Downtime Supply</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Automatically matches detected wear parts to verified OEM stock for instant dispatch.
              </p>
            </div>

          </div>

          {/* Current Live Vehicle Stats Snapshot */}
          <div className="rounded-xl border border-[#00D2C4]/30 bg-[#00D2C4]/5 p-3 text-[11px] space-y-1.5">
            <div className="flex items-center justify-between font-medium">
              <span className="text-zinc-300">Active Link to: <strong className="text-white">{vehicle.name}</strong></span>
              <span className="font-mono text-emerald-400 flex items-center gap-1">
                <CheckCircle2 size={12} /> 500 kbps CAN-Bus
              </span>
            </div>
            <div className="flex items-center justify-between text-zinc-400 font-mono text-[10px]">
              <span>VIN: {vehicle.vin}</span>
              <span>Health Index: {vehicle.health}%</span>
              <span>Sync: {vehicle.lastConnected}</span>
            </div>
          </div>

        </div>

        {/* Dismiss Button */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-[#00D2C4] py-2.5 text-xs font-bold text-black hover:bg-[#00E5D4] transition-colors"
          >
            Got It
          </button>
        </div>

      </div>
    </div>
  );
};
