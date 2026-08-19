import React, { useState } from "react";
import {
  Gauge,
  Disc,
  CircleDot,
  Battery,
  AlertTriangle,
  CheckCircle2,
  Wrench,
  Sparkles,
  RefreshCw,
  ShoppingBag,
  Ticket,
  ChevronRight,
  ShieldCheck,
  Zap,
  Activity,
  Flame,
  Radio,
  MapPin,
  Building,
  Navigation,
  Phone,
  Mic,
  Compass,
} from "lucide-react";
import { Vehicle, Alert, Workshop, UserLocation } from "../types";
import { NearestWorkshopCard } from "./NearestWorkshopCard";

interface DashboardProps {
  vehicle: Vehicle;
  vehicles: Vehicle[];
  userLocation: UserLocation;
  nearestWorkshop: Workshop;
  onSelectVehicle: (id: string) => void;
  onLogTicket: (subject: string, details?: string, dtc?: string) => void;
  onOrderPart: (partId: string) => void;
  onAskAssistant: (prompt: string) => void;
  onRunScan: (vehicleId: string) => void;
  onOpenLocatorModal: () => void;
  onReserveBay: (workshop: Workshop) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  vehicle,
  vehicles,
  userLocation,
  nearestWorkshop,
  onSelectVehicle,
  onLogTicket,
  onOrderPart,
  onAskAssistant,
  onRunScan,
  onOpenLocatorModal,
  onReserveBay,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanNotice, setScanNotice] = useState<string | null>(null);

  const handleScan = () => {
    setIsScanning(true);
    setScanNotice("Auditing CAN-bus telematics, TPMS telemetry & friction sensors...");
    setTimeout(() => {
      onRunScan(vehicle.id);
      setIsScanning(false);
      setScanNotice("Diagnostic scan complete: Telemetry synchronized with Connected Vehicle Cloud.");
      setTimeout(() => setScanNotice(null), 4000);
    }, 1400);
  };

  // Subsystem health calculations
  const brakingScore = Math.max(10, 100 - Math.round(vehicle.brakeWear * 0.9));
  const tpmsScore = vehicle.tirePressure >= 32 ? 98 : Math.round((vehicle.tirePressure / 34) * 85);
  const powertrainScore = vehicle.type === "ev" ? (vehicle.battery ?? 80) : 94;

  const hasCriticalAlert = vehicle.alerts.some((a) => a.level === "danger");

  return (
    <div className="space-y-6">
      
      {/* Top Vehicle Selector & Diagnostic Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
        {/* Horizontal Vehicle Carousel */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar max-w-full">
          {vehicles.map((v) => {
            const isSelected = v.id === vehicle.id;
            const hasDanger = v.alerts.some((a) => a.level === "danger");
            const hasWarn = v.alerts.some((a) => a.level === "warn");
            
            return (
              <button
                key={v.id}
                onClick={() => onSelectVehicle(v.id)}
                className={`group relative flex shrink-0 items-center gap-2 sm:gap-2.5 rounded-xl border px-2.5 py-1.5 sm:px-3 sm:py-2 text-left transition-all ${
                  isSelected
                    ? "border-[#00D2C4] bg-[#00D2C4]/10 shadow-[0_0_12px_rgba(0,210,196,0.15)] ring-1 ring-[#00D2C4]/30"
                    : "border-[#23272F] bg-[#101216] hover:border-[#343B47] hover:bg-[#15181E]"
                }`}
              >
                <div className="relative shrink-0">
                  <div
                    className={`h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full ${
                      hasDanger
                        ? "bg-rose-500 animate-ping"
                        : hasWarn
                        ? "bg-amber-400"
                        : "bg-emerald-400"
                    }`}
                  />
                  <div
                    className={`absolute inset-0 h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full ${
                      hasDanger ? "bg-rose-500" : hasWarn ? "bg-amber-400" : "bg-emerald-400"
                    }`}
                  />
                </div>

                <div className="min-w-0">
                  <div className={`text-[11px] sm:text-xs font-bold tracking-tight whitespace-nowrap ${isSelected ? "text-white" : "text-zinc-300"}`}>
                    {v.name}
                  </div>
                  <div className="font-mono text-[9px] sm:text-[10px] text-zinc-500 whitespace-nowrap flex items-center gap-1">
                    <span>Health:</span>
                    <span className={v.health < 65 ? "text-rose-400 font-semibold" : v.health < 80 ? "text-amber-400 font-semibold" : "text-emerald-400 font-semibold"}>
                      {v.health}%
                    </span>
                    <span>·</span>
                    <span className="uppercase text-zinc-400">{v.type}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Live Scan Trigger (Responsive size) */}
        <button
          onClick={handleScan}
          disabled={isScanning}
          className="flex shrink-0 items-center justify-center gap-1.5 self-end sm:self-auto rounded-xl border border-[#00D2C4]/40 bg-[#00D2C4]/10 px-3 py-1.5 sm:px-3.5 sm:py-2 text-[11px] sm:text-xs font-semibold text-[#00D2C4] hover:bg-[#00D2C4]/20 transition-all disabled:opacity-50 shadow-sm whitespace-nowrap"
        >
          <RefreshCw size={12} className={isScanning ? "animate-spin" : ""} />
          <span className="hidden xs:inline sm:hidden md:inline">{isScanning ? "Scanning..." : "Run Diagnostic Scan"}</span>
          <span className="xs:hidden sm:inline md:hidden">{isScanning ? "Scanning..." : "Diagnostic Scan"}</span>
        </button>
      </div>

      {/* Live Scan Notification Toast */}
      {scanNotice && (
        <div className="flex items-center gap-2.5 rounded-xl border border-[#00D2C4]/30 bg-[#00D2C4]/10 px-4 py-2.5 text-xs text-[#00E5D4] transition-all">
          <Activity size={15} className="animate-pulse text-[#00D2C4]" />
          <span>{scanNotice}</span>
        </div>
      )}

      {/* Primary Row: Vehicle Health Profile & Live Telemetry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left 5 Cols: Vehicle Master Health Card */}
        <div className="lg:col-span-5 rounded-2xl border border-[#23272F] bg-[#111317] p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div>
            {/* Header / VIN */}
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-block rounded bg-[#1B1F27] px-2 py-0.5 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider border border-[#2B303C]">
                  Chassis {vehicle.modelCode} · {vehicle.year}
                </span>
                <h2 className="mt-1.5 font-display text-xl sm:text-2xl font-bold tracking-tight text-white">
                  {vehicle.name}
                </h2>
                <div className="mt-1 flex items-center gap-1.5 font-mono text-xs text-zinc-400">
                  <span className="text-zinc-500">VIN:</span>
                  <span className="text-zinc-200 select-all">{vehicle.vin}</span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-1.5 rounded-full bg-[#181C23] px-2.5 py-1 border border-[#282F3B] text-[11px] text-[#00D2C4]">
                <Radio size={11} className="animate-pulse" />
                <span className="font-mono text-[10px]">Telemetry Live</span>
              </div>
            </div>

            {/* Health Score Main Graphic */}
            <div className="my-6 flex items-center justify-between rounded-xl border border-[#23272F] bg-[#161920] p-4">
              <div className="flex items-center gap-4">
                <HealthScoreRing value={vehicle.health} size={84} />
                <div>
                  <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Predictive Health Index
                  </div>
                  <div className="text-sm font-medium text-white mt-0.5">
                    {vehicle.health >= 85
                      ? "Nominal Vehicle Condition"
                      : vehicle.health >= 65
                      ? "Service Recommended Soon"
                      : "Critical Attention Required"}
                  </div>
                  <div className="mt-1 text-[11px] text-zinc-400">
                    Calculated from 14 onboard sensor matrices
                  </div>
                </div>
              </div>
            </div>

            {/* Subsystem Health Breakdown Bars */}
            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Subsystem Integrity
              </div>

              <SubsystemBar
                label="Braking & Friction Lining"
                score={brakingScore}
                detail={`${vehicle.brakeWear}% wear`}
                icon={Disc}
              />
              <SubsystemBar
                label="TPMS Tire Pressure"
                score={tpmsScore}
                detail={`${vehicle.tirePressure} PSI avg`}
                icon={CircleDot}
              />
              <SubsystemBar
                label={vehicle.type === "ev" ? "High-Voltage Battery" : "Powertrain & Thermal"}
                score={powertrainScore}
                detail={vehicle.type === "ev" ? `${vehicle.battery}% SoC` : `${vehicle.engineTemp}°C`}
                icon={vehicle.type === "ev" ? Battery : Flame}
              />
            </div>
          </div>

          {/* Quick AI Diagnostic Trigger */}
          <div className="mt-6 pt-4 border-t border-[#23272F]">
            <button
              onClick={() => onAskAssistant(`Provide a complete health review for my ${vehicle.name}`)}
              className="flex w-full items-center justify-between rounded-xl border border-[#00D2C4]/30 bg-[#00D2C4]/10 p-3 text-left text-xs font-semibold text-[#00E5D4] hover:bg-[#00D2C4]/20 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Sparkles size={15} className="text-[#00D2C4]" />
                <span>Ask Connected AI to explain vehicle health report</span>
              </div>
              <ChevronRight size={14} className="text-[#00D2C4]" />
            </button>
          </div>
        </div>

        {/* Right 7 Cols: Telemetry Metrics & TPMS Matrix */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* 4 Telemetry Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MetricCard
              icon={Disc}
              label="Brake Lining"
              value={`${vehicle.brakeWear}%`}
              subtext={vehicle.brakeWear > 75 ? "Rotor wear risk" : "Pads nominal"}
              status={vehicle.brakeWear > 75 ? "danger" : vehicle.brakeWear > 50 ? "warn" : "good"}
            />
            <MetricCard
              icon={CircleDot}
              label="TPMS Pressure"
              value={`${vehicle.tirePressure} PSI`}
              subtext={vehicle.tirePressure < 30 ? "Pressure low" : "Optimal 34 PSI"}
              status={vehicle.tirePressure < 30 ? "danger" : vehicle.tirePressure < 32 ? "warn" : "good"}
            />
            {vehicle.battery !== null ? (
              <MetricCard
                icon={Battery}
                label="HV Battery"
                value={`${vehicle.battery}%`}
                subtext={`Cell: ${vehicle.batteryTemp ?? 24}°C`}
                status={vehicle.battery < 25 ? "warn" : "good"}
              />
            ) : (
              <MetricCard
                icon={Gauge}
                label="Engine Coolant"
                value={`${vehicle.engineTemp}°C`}
                subtext={vehicle.engineTemp > 105 ? "Thermal limit" : "Operating temp"}
                status={vehicle.engineTemp > 105 ? "danger" : "good"}
              />
            )}
            <MetricCard
              icon={Wrench}
              label="Next Service"
              value={vehicle.nextService}
              subtext={vehicle.serviceCode.split(" ")[0]}
              status={vehicle.nextService === "Now" ? "danger" : vehicle.nextService.includes("2") ? "warn" : "good"}
            />
          </div>

          {/* TPMS 4-Wheel Live Visualizer */}
          <div className="rounded-2xl border border-[#23272F] bg-[#111317] p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CircleDot size={16} className="text-[#00D2C4]" />
                <span className="font-display font-bold text-sm text-white">
                  Active TPMS 4-Corner Telemetry
                </span>
              </div>
              <span className="font-mono text-[11px] text-zinc-400">
                Recommended: 34.0 PSI
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 rounded-xl border border-[#23272F] bg-[#161920] p-4">
              {/* Front Left */}
              <TirePressureBox
                position="Front Left"
                psi={vehicle.tirePressures.fl}
                temp="23°C"
                status={vehicle.tirePressures.fl < 30 ? "danger" : "good"}
              />
              {/* Front Right */}
              <TirePressureBox
                position="Front Right"
                psi={vehicle.tirePressures.fr}
                temp="24°C"
                status={vehicle.tirePressures.fr < 30 ? "danger" : "good"}
              />
              {/* Rear Left */}
              <TirePressureBox
                position="Rear Left"
                psi={vehicle.tirePressures.rl}
                temp="22°C"
                status={vehicle.tirePressures.rl < 30 ? "danger" : "good"}
              />
              {/* Rear Right */}
              <TirePressureBox
                position="Rear Right"
                psi={vehicle.tirePressures.rr}
                temp="23°C"
                status={vehicle.tirePressures.rr < 30 ? "danger" : "good"}
              />
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={12} className="text-emerald-400" /> All wheel speed sensors calibrated
              </span>
              <span className="font-mono">Mileage: {vehicle.mileage.toLocaleString()} km</span>
            </div>
          </div>

        </div>

      </div>

      {/* Predictive Alerts Section */}
      <div className="rounded-2xl border border-[#23272F] bg-[#111317] p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
              <Zap size={18} className="text-[#00D2C4]" />
              Predictive Diagnostics &amp; Fault Detection
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Identifies component fatigue before becoming a roadside breakdown.
            </p>
          </div>
          <span className="rounded-lg bg-[#1B1E26] px-2.5 py-1 text-xs font-mono text-zinc-400 border border-[#2B303C]">
            {vehicle.alerts.length} Active Telemetry Signals
          </span>
        </div>

        <div className="space-y-3">
          {vehicle.alerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onLogTicket={() => onLogTicket(`[${alert.level.toUpperCase()}] ${alert.title}`, alert.msg, alert.dtcCode)}
              onOrderPart={() => alert.relatedPartId && onOrderPart(alert.relatedPartId)}
              onAskAI={() => onAskAssistant(`Explain what is causing the alert: "${alert.title}" on my ${vehicle.name}. What are the repair steps?`)}
            />
          ))}
        </div>
      </div>

      {/* Emergency GPS & Nearest Certified Workshop Hub */}
      <div className="rounded-2xl border border-[#23272F] bg-[#111317] p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#20252F]">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 rounded bg-[#00D2C4]/15 px-2 py-0.5 text-[10px] font-bold text-[#00D2C4] border border-[#00D2C4]/30 uppercase tracking-wider">
                <Compass size={11} /> Live Geolocation Telematics
              </span>
              <span className="rounded bg-[#181C24] px-2 py-0.5 text-[10px] font-mono text-zinc-400 border border-[#242A36]">
                GPS: {userLocation.label}
              </span>
            </div>
            <h3 className="font-display text-lg font-bold text-white mt-1">
              Nearest Certified Workshop &amp; Emergency Service Center
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              If your vehicle displays warnings on the road, navigate to the closest certified bay or dispatch roadside assistance.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onAskAssistant(`Where is the nearest certified workshop to my current location (${userLocation.label}) for my ${vehicle.name}?`)}
              className="flex items-center gap-1.5 rounded-xl border border-[#00D2C4]/40 bg-[#00D2C4]/10 px-3.5 py-2 text-xs font-semibold text-[#00D2C4] hover:bg-[#00D2C4]/20 transition-all shadow-sm"
            >
              <Mic size={13} />
              <span>Voice AI Search</span>
            </button>

            <button
              onClick={onOpenLocatorModal}
              className="flex items-center gap-1.5 rounded-xl border border-[#2B313D] bg-[#161921] px-3.5 py-2 text-xs font-semibold text-zinc-200 hover:border-[#00D2C4]/40 hover:text-white transition-colors shadow-sm"
            >
              <Building size={13} className="text-[#00D2C4]" />
              <span>All Facilities</span>
            </button>
          </div>
        </div>

        {/* Featured Nearest Workshop Card */}
        <NearestWorkshopCard
          workshop={nearestWorkshop}
          vehicle={vehicle}
          onReserveBay={onReserveBay}
        />
      </div>

    </div>
  );
};

// Sub-components

function HealthScoreRing({ value, size = 84 }: { value: number; size?: number }) {
  const stroke = 7;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  const color = value >= 80 ? "#3DDC97" : value >= 60 ? "#E8A33D" : "#E5484D";

  return (
    <div className="relative flex items-center justify-center shrink-0">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#23272F" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-xl font-bold text-white tracking-tight">{value}</span>
        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-tighter">/ 100</span>
      </div>
    </div>
  );
}

function SubsystemBar({
  label,
  score,
  detail,
  icon: Icon,
}: {
  label: string;
  score: number;
  detail: string;
  icon: any;
}) {
  const color = score >= 80 ? "bg-emerald-400" : score >= 60 ? "bg-amber-400" : "bg-rose-500";

  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="flex items-center gap-1.5 text-zinc-300 font-medium">
          <Icon size={12} className="text-[#00D2C4]" />
          {label}
        </span>
        <span className="font-mono text-[11px] text-zinc-400">{detail}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-[#20242D] overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-500`}
          style={{ width: `${Math.min(100, Math.max(10, score))}%` }}
        />
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  subtext,
  status,
}: {
  icon: any;
  label: string;
  value: string;
  subtext: string;
  status: "good" | "warn" | "danger";
}) {
  const borderStatus =
    status === "danger"
      ? "border-rose-500/40 bg-rose-950/10"
      : status === "warn"
      ? "border-amber-500/40 bg-amber-950/10"
      : "border-[#23272F] bg-[#111317]";

  const textColor =
    status === "danger" ? "text-rose-400" : status === "warn" ? "text-amber-400" : "text-white";

  return (
    <div className={`rounded-xl border p-3.5 transition-colors ${borderStatus}`}>
      <div className="flex items-center justify-between text-zinc-400 text-[11px] mb-1.5">
        <span className="truncate">{label}</span>
        <Icon size={13} className="text-[#00D2C4] shrink-0" />
      </div>
      <div className={`font-display text-lg font-bold ${textColor}`}>{value}</div>
      <div className="text-[10px] text-zinc-400 truncate mt-0.5">{subtext}</div>
    </div>
  );
}

function TirePressureBox({
  position,
  psi,
  temp,
  status,
}: {
  position: string;
  psi: number;
  temp: string;
  status: "good" | "warn" | "danger";
}) {
  const isDanger = status === "danger";

  return (
    <div
      className={`rounded-lg border p-2.5 sm:p-3 transition-colors ${
        isDanger
          ? "border-rose-500/50 bg-rose-950/20"
          : "border-[#282D37] bg-[#12151B]"
      }`}
    >
      <div className="flex items-center justify-between text-[11px]">
        <span className="font-medium text-zinc-300">{position}</span>
        <span className="text-[10px] text-zinc-500 font-mono">{temp}</span>
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span
          className={`font-mono text-base sm:text-lg font-bold ${
            isDanger ? "text-rose-400 animate-pulse" : "text-emerald-400"
          }`}
        >
          {psi.toFixed(1)}
        </span>
        <span className="text-[10px] text-zinc-400">PSI</span>
      </div>
      {isDanger && (
        <div className="mt-1 text-[10px] font-semibold text-rose-400 flex items-center gap-1">
          <AlertTriangle size={10} /> Low Pressure
        </div>
      )}
    </div>
  );
}

const AlertCard: React.FC<{
  alert: Alert;
  onLogTicket: () => void;
  onOrderPart: () => void;
  onAskAI: () => void;
}> = ({
  alert,
  onLogTicket,
  onOrderPart,
  onAskAI,
}) => {
  const isDanger = alert.level === "danger";
  const isWarn = alert.level === "warn";

  const borderColor = isDanger
    ? "border-rose-500/40 bg-rose-950/15"
    : isWarn
    ? "border-amber-500/40 bg-amber-950/15"
    : "border-[#23272F] bg-[#151820]";

  return (
    <div className={`rounded-xl border p-4 transition-all ${borderColor}`}>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 shrink-0">
            {isDanger ? (
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <AlertTriangle size={15} />
              </div>
            ) : isWarn ? (
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <AlertTriangle size={15} />
              </div>
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 size={15} />
              </div>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-display text-sm font-bold text-white">{alert.title}</span>
              {alert.dtcCode && (
                <span className="rounded bg-[#080A0E] px-1.5 py-0.5 font-mono text-[10px] text-zinc-400 border border-[#23272F]">
                  DTC: {alert.dtcCode}
                </span>
              )}
              {alert.timeHorizon && (
                <span className="rounded bg-[#00D2C4]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#00D2C4] border border-[#00D2C4]/20">
                  Horizon: {alert.timeHorizon}
                </span>
              )}
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">{alert.msg}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:self-start shrink-0">
          <button
            onClick={onAskAI}
            className="flex items-center gap-1 rounded-lg border border-[#2D333E] bg-[#12151B] px-2.5 py-1.5 text-xs text-zinc-300 hover:border-[#00D2C4]/50 hover:text-white transition-colors"
          >
            <Sparkles size={12} className="text-[#00D2C4]" />
            <span>AI Triage</span>
          </button>

          {alert.relatedPartId && (
            <button
              onClick={onOrderPart}
              className="flex items-center gap-1 rounded-lg border border-[#00D2C4]/40 bg-[#00D2C4]/10 px-2.5 py-1.5 text-xs font-semibold text-[#00D2C4] hover:bg-[#00D2C4]/20 transition-colors"
            >
              <ShoppingBag size={12} />
              <span>Order OEM Part</span>
            </button>
          )}

          {alert.level !== "good" && (
            <button
              onClick={onLogTicket}
              className="flex items-center gap-1 rounded-lg bg-[#00D2C4] px-3 py-1.5 text-xs font-bold text-black hover:bg-[#00E5D4] transition-colors shadow-sm"
            >
              <Ticket size={12} />
              <span>Log Ticket</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
