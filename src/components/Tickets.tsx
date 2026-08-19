import React, { useState, useEffect } from "react";
import {
  Ticket as TicketIcon,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  X,
  Sparkles,
  ShieldAlert,
  User,
  Wrench,
  Activity,
  Filter,
  Check,
} from "lucide-react";
import { Ticket, Vehicle, TicketPriority, TicketStatus } from "../types";

interface TicketsProps {
  tickets: Ticket[];
  vehicles: Vehicle[];
  currentVehicle: Vehicle;
  onCreateTicket: (ticket: Partial<Ticket>) => void;
  prefillSubject?: string;
  prefillDetails?: string;
  prefillPriority?: string;
  prefillDtc?: string;
  clearPrefill: () => void;
}

export const Tickets: React.FC<TicketsProps> = ({
  tickets,
  vehicles,
  currentVehicle,
  onCreateTicket,
  prefillSubject,
  prefillDetails,
  prefillPriority,
  prefillDtc,
  clearPrefill,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [filterVehicle, setFilterVehicle] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Form State
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(currentVehicle.id);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("Braking & Dynamics");

  // Auto-fill if redirected from dashboard or AI assistant
  useEffect(() => {
    if (prefillSubject || prefillDetails) {
      setSubject(prefillSubject || "");
      setDescription(prefillDetails || "");
      setSelectedVehicleId(currentVehicle.id);
      setShowModal(true);
    }
  }, [prefillSubject, prefillDetails, currentVehicle.id]);

  const targetVehicle = vehicles.find((v) => v.id === selectedVehicleId) || currentVehicle;

  // Real-time AI Priority & SLA Calculation
  const calculatePriority = (text: string): { priority: TicketPriority; eta: string; reason: string } => {
    const t = text.toLowerCase();
    if (/brake failure|rotor|metal|blowout|smoke|overheat|stall|severe|emergency|critical|loss of braking/.test(t)) {
      return { priority: "Critical", eta: "~5 min", reason: "Potential critical safety or thermal risk detected" };
    }
    if (/brake|pad|wear|tire pressure|puncture|leak|tpms low|28 psi|84%/.test(t)) {
      return { priority: "High", eta: "~8 min", reason: "Component fatigue flagged by telemetry" };
    }
    if (/noise|squeak|vibration|software|firmware|ota|service b|service a/.test(t)) {
      return { priority: "Medium", eta: "~35 min", reason: "Standard maintenance or software calibration" };
    }
    return { priority: "Low", eta: "~2 hrs", reason: "Routine owner inquiry or cosmetic accessory query" };
  };

  const priorityMeta = calculatePriority(subject + " " + description);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;

    const newTicket: Partial<Ticket> = {
      id: `T-${1040 + tickets.length + Math.floor(Math.random() * 50)}`,
      vehicleId: targetVehicle.id,
      vehicleName: targetVehicle.name,
      vin: targetVehicle.vin,
      subject: subject.trim(),
      description: description.trim() || "Diagnostic review requested by owner.",
      priority: priorityMeta.priority,
      status: "Queued",
      eta: priorityMeta.eta,
      createdAt: "Just now",
      assignedTech: "Dispatch Queue (Fast-Track Assigned)",
      telemetrySnapshot: {
        mileage: targetVehicle.mileage,
        brakeWear: targetVehicle.brakeWear,
        tirePressure: targetVehicle.tirePressure,
        batteryOrTemp: targetVehicle.battery !== null ? `${targetVehicle.battery}% SoC` : `${targetVehicle.engineTemp}°C`,
        dtcCode: prefillDtc || (targetVehicle.alerts[0]?.dtcCode ?? "CAN-OK"),
      },
      timeline: [
        {
          title: "Ticket Auto-Logged with Vehicle Telemetry",
          timestamp: "Just now",
          note: `Sensor snapshot attached: Mileage ${targetVehicle.mileage.toLocaleString()} km, Health: ${targetVehicle.health}%.`,
          author: "Predictive Care Telematics",
        },
      ],
    };

    onCreateTicket(newTicket);
    setSubject("");
    setDescription("");
    setShowModal(false);
    clearPrefill();
  };

  // Filtered tickets
  const filteredTickets = tickets.filter((t) => {
    if (filterVehicle !== "all" && t.vehicleId !== filterVehicle) return false;
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header & New Ticket Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <TicketIcon size={22} className="text-[#00D2C4]" />
            Fast-Track Support Tickets
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Zero call center waiting. Telematics-backed prioritization connects directly to Mercedes-Benz Master Technicians.
          </p>
        </div>

        <button
          onClick={() => {
            setShowModal(true);
            setSubject("");
            setDescription("");
          }}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#00D2C4] px-4 py-2.5 text-xs font-bold text-black hover:bg-[#00E5D4] transition-colors shadow-sm shrink-0"
        >
          <Plus size={15} />
          <span>Log New Ticket</span>
        </button>
      </div>

      {/* SLA Metric Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SlaCard priority="Critical" time="~5-8 min" desc="Immediate Safety Triage" color="border-rose-500/40 text-rose-400" />
        <SlaCard priority="High" time="~10-15 min" desc="Active Wear / Telemetry Alerts" color="border-amber-500/40 text-amber-400" />
        <SlaCard priority="Medium" time="~35 min" desc="Service & Calibration" color="border-[#00D2C4]/40 text-[#00D2C4]" />
        <SlaCard priority="Low" time="~2 hrs" desc="General Consultations" color="border-[#2D333E] text-zinc-300" />
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#23272F] bg-[#111317] p-3">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <Filter size={13} className="text-[#00D2C4]" />
          <span className="font-semibold">Filter:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterVehicle}
            onChange={(e) => setFilterVehicle(e.target.value)}
            className="rounded-lg border border-[#2B313D] bg-[#161920] px-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-[#00D2C4]"
          >
            <option value="all">All Vehicles</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-[#2B313D] bg-[#161920] px-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-[#00D2C4]"
          >
            <option value="all">All Statuses</option>
            <option value="Queued">Queued</option>
            <option value="Diagnostic Assigned">Diagnostic Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Parts Allocated">Parts Allocated</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Ticket List */}
      <div className="space-y-3">
        {filteredTickets.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#282E39] p-8 text-center text-zinc-500">
            <CheckCircle2 size={32} className="mx-auto text-emerald-400 mb-2 opacity-80" />
            <div className="text-sm font-semibold text-white">No Open Tickets Found</div>
            <p className="text-xs text-zinc-400 mt-1">All vehicle systems are currently operating under factory specification.</p>
          </div>
        ) : (
          filteredTickets.map((t) => (
            <div
              key={t.id}
              onClick={() => setSelectedTicket(t)}
              className="group cursor-pointer rounded-2xl border border-[#23272F] bg-[#111317] p-4 sm:p-5 hover:border-[#00D2C4]/40 hover:bg-[#14171E] transition-all shadow-lg"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#181B23] border border-[#282F3B] text-[#00D2C4]">
                    <TicketIcon size={18} />
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#00D2C4]">{t.id}</span>
                      <span className="text-zinc-500">·</span>
                      <span className="text-xs font-semibold text-zinc-300">{t.vehicleName}</span>
                      <PriorityBadge priority={t.priority} />
                    </div>

                    <h3 className="text-sm font-bold text-white group-hover:text-[#00E5D4] transition-colors">
                      {t.subject}
                    </h3>

                    <p className="text-xs text-zinc-400 line-clamp-1">{t.description}</p>
                  </div>
                </div>

                {/* Right Side Info */}
                <div className="flex items-center gap-3 sm:gap-4 shrink-0 sm:self-center">
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-300 justify-end">
                      <Clock size={12} className="text-[#00D2C4]" />
                      <span className="font-mono font-semibold">ETA {t.eta}</span>
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">{t.createdAt}</div>
                  </div>

                  <StatusPill status={t.status} />

                  <ChevronRight size={16} className="text-zinc-500 group-hover:text-[#00D2C4] group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>

              {/* Telemetry snippet preview */}
              {t.telemetrySnapshot && (
                <div className="mt-3 pt-3 border-t border-[#1C2028] flex flex-wrap items-center gap-4 text-[11px] font-mono text-zinc-400">
                  <span>Mileage: {t.telemetrySnapshot.mileage?.toLocaleString()} km</span>
                  {t.telemetrySnapshot.brakeWear !== undefined && (
                    <span>Brake Wear: {t.telemetrySnapshot.brakeWear}%</span>
                  )}
                  {t.telemetrySnapshot.tirePressure !== undefined && (
                    <span>TPMS: {t.telemetrySnapshot.tirePressure} PSI</span>
                  )}
                  {t.telemetrySnapshot.dtcCode && (
                    <span className="text-zinc-300 font-bold">DTC: {t.telemetrySnapshot.dtcCode}</span>
                  )}
                  {t.assignedTech && (
                    <span className="text-zinc-400 ml-auto flex items-center gap-1">
                      <User size={11} className="text-[#00D2C4]" /> {t.assignedTech}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-[#2A303C] bg-[#111317] p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto scrollbar">
            <div className="flex items-center justify-between border-b border-[#23272F] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#00D2C4]">{selectedTicket.id}</span>
                  <PriorityBadge priority={selectedTicket.priority} />
                  <StatusPill status={selectedTicket.status} />
                </div>
                <h3 className="font-display text-lg font-bold text-white mt-1">
                  {selectedTicket.subject}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-[#1E232B] hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Vehicle & Telemetry Box */}
            <div className="rounded-xl border border-[#23272F] bg-[#161920] p-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-300">
                <span className="font-semibold text-white">{selectedTicket.vehicleName}</span>
                <span className="font-mono text-[11px] text-zinc-400">VIN: {selectedTicket.vin}</span>
              </div>
              {selectedTicket.telemetrySnapshot && (
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#23272F] text-xs font-mono">
                  <div>
                    <span className="text-zinc-500 block text-[10px]">ODOMETER</span>
                    <span className="text-zinc-200">{selectedTicket.telemetrySnapshot.mileage?.toLocaleString()} km</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">TELEMETRY CODE</span>
                    <span className="text-[#00D2C4]">{selectedTicket.telemetrySnapshot.dtcCode || "NOMINAL"}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">RESPONSE SLA</span>
                    <span className="text-emerald-400">{selectedTicket.eta}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Issue Description
              </div>
              <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed rounded-xl bg-[#161920] border border-[#23272F] p-3.5">
                {selectedTicket.description}
              </p>
            </div>

            {/* Live Progress Timeline */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">
                Live Resolution Timeline
              </div>
              <div className="space-y-3 pl-2 border-l-2 border-[#23272F]">
                {selectedTicket.timeline.map((evt, idx) => (
                  <div key={idx} className="relative pl-4">
                    <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-[#00D2C4] ring-4 ring-[#111317]" />
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white">{evt.title}</span>
                      <span className="font-mono text-[10px] text-zinc-400">{evt.timestamp}</span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">{evt.note}</p>
                    <div className="text-[10px] text-zinc-500 font-mono mt-0.5">By {evt.author}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[#23272F] flex justify-end">
              <button
                onClick={() => setSelectedTicket(null)}
                className="rounded-xl bg-[#1C2028] px-4 py-2 text-xs font-semibold text-white hover:bg-[#252B36]"
              >
                Close Ticket View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Ticket Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-[#2A303C] bg-[#111317] p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#23272F] pb-3.5">
              <div>
                <h3 className="font-display text-lg font-bold text-white">Log Fast-Track Support Ticket</h3>
                <p className="text-xs text-zinc-400">Direct transmission to certified workshop triage queue</p>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  clearPrefill();
                }}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-[#1E232B] hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Vehicle selector */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Target Vehicle</label>
                <select
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  className="w-full rounded-xl border border-[#2B313D] bg-[#161920] px-3.5 py-2.5 text-xs text-white focus:border-[#00D2C4] focus:outline-none"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.vin.slice(0, 10)}...)
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Subsystem Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-[#2B313D] bg-[#161920] px-3.5 py-2.5 text-xs text-white focus:border-[#00D2C4] focus:outline-none"
                >
                  <option value="Braking & Dynamics">Braking &amp; Dynamics (Friction / ABS / ESP)</option>
                  <option value="TPMS & Tires">TPMS &amp; Wheel Pressure</option>
                  <option value="Powertrain & Battery">High-Voltage Battery / Powertrain</option>
                  <option value="Software & OTA">MBUX Software / Telematics Calibration</option>
                  <option value="General Service">Service A / Service B Booking</option>
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Issue Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Brake vibration during high speed deceleration"
                  className="w-full rounded-xl border border-[#2B313D] bg-[#161920] px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#00D2C4] focus:outline-none"
                />
              </div>

              {/* Details */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Diagnostic Notes &amp; Observations</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide any additional symptoms or context for the master technician..."
                  className="w-full rounded-xl border border-[#2B313D] bg-[#161920] px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#00D2C4] focus:outline-none resize-none"
                />
              </div>

              {/* AI Auto-Calculation SLA preview box */}
              <div className="rounded-xl border border-[#00D2C4]/30 bg-[#00D2C4]/10 p-3.5 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-bold text-[#00E5D4]">
                    <Sparkles size={14} /> AI Auto-Assigned Priority
                  </span>
                  <PriorityBadge priority={priorityMeta.priority} />
                </div>
                <div className="text-zinc-300 font-mono text-[11px]">
                  Estimated Master Tech SLA: <strong className="text-white">{priorityMeta.eta}</strong>
                </div>
                <p className="text-[11px] text-zinc-400">{priorityMeta.reason}</p>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    clearPrefill();
                  }}
                  className="rounded-xl px-4 py-2.5 text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#00D2C4] px-5 py-2.5 text-xs font-bold text-black hover:bg-[#00E5D4] transition-colors shadow-sm"
                >
                  Submit &amp; Queue Ticket
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const color =
    priority === "Critical"
      ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
      : priority === "High"
      ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
      : priority === "Medium"
      ? "bg-[#00D2C4]/20 text-[#00D2C4] border-[#00D2C4]/30"
      : "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";

  return (
    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${color}`}>
      {priority}
    </span>
  );
}

function StatusPill({ status }: { status: TicketStatus }) {
  const color =
    status === "Resolved"
      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      : status === "In Progress" || status === "Parts Allocated"
      ? "bg-[#00D2C4]/10 text-[#00D2C4] border-[#00D2C4]/30"
      : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";

  return (
    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${color}`}>
      {status}
    </span>
  );
}

function SlaCard({
  priority,
  time,
  desc,
  color,
}: {
  priority: string;
  time: string;
  desc: string;
  color: string;
}) {
  return (
    <div className={`rounded-xl border bg-[#111317] p-3 ${color.split(" ")[0]}`}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">{priority}</span>
        <span className="font-mono text-xs font-bold text-white">{time}</span>
      </div>
      <div className="mt-1 text-[10px] text-zinc-400 truncate">{desc}</div>
    </div>
  );
}
