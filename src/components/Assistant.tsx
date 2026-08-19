import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Send,
  Bot,
  User,
  Ticket,
  ShoppingBag,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Disc,
  CircleDot,
  Battery,
  Wrench,
  HelpCircle,
  Zap,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  MapPin,
  Building,
  Navigation,
} from "lucide-react";
import { Vehicle, ChatMessage, Product, Workshop, UserLocation } from "../types";
import { VoiceAssistantManager } from "../utils/voiceUtils";
import { NearestWorkshopCard } from "./NearestWorkshopCard";

interface AssistantProps {
  vehicle: Vehicle;
  products: Product[];
  workshops: Workshop[];
  userLocation: UserLocation;
  nearestWorkshop: Workshop;
  onEscalateToTicket: (subject: string, details?: string, priority?: string) => void;
  onAddToCart: (product: Product) => void;
  onSwitchTab: (tab: string) => void;
  onOpenLocatorModal: () => void;
}

export const Assistant: React.FC<AssistantProps> = ({
  vehicle,
  products,
  workshops,
  userLocation,
  nearestWorkshop,
  onEscalateToTicket,
  onAddToCart,
  onSwitchTab,
  onOpenLocatorModal,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m-welcome",
      role: "ai",
      text: `Hello. I am your Connected Vehicle Predictive Care AI Voice & Diagnostic Assistant. 

Connected vehicle: ${vehicle.name} (VIN: ${vehicle.vin.slice(0, 11)}...).
GPS Location: ${userLocation.label} (Closest certified facility: ${nearestWorkshop.name}, ${nearestWorkshop.distanceKm} km away).

${
  vehicle.alerts.some((a) => a.level !== "good")
    ? `⚠️ Telemetry notice: ${vehicle.alerts.filter((a) => a.level !== "good").map((a) => a.title).join("; ")}.`
    : "All primary powertrain, braking, and TPMS sensors are currently nominal."
}

You can speak to me with your microphone or type any question below. How can I assist you?`,
      timestamp: "Just now",
      canEscalate: true,
      suggestedPriority: vehicle.health < 65 ? "High" : "Medium",
      suggestedWorkshop: vehicle.alerts.some((a) => a.level === "danger") ? nearestWorkshop : undefined,
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [voiceSpeechEnabled, setVoiceSpeechEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [interimSpeech, setInterimSpeech] = useState("");

  const scrollEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    setSpeechSupported(VoiceAssistantManager.isSpeechRecognitionSupported());
  }, []);

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, isListening, interimSpeech]);

  // Quick Voice Diagnostic Prompts
  const quickPrompts = [
    { label: "📍 Nearest Workshop for Issue", query: `Where is the nearest certified workshop to take my ${vehicle.name}?` },
    { label: "⚠️ Brake Wear Triage", query: "Can you analyze the rear brake lining wear on my vehicle and nearest dealer?" },
    { label: "🛞 Front Tire Pressure Drop", query: "Front-left tire is reading low. Is it safe to drive and where is closest tire bay?" },
    { label: "⚡ Battery Health & Range", query: "Check high-voltage battery health, cell temperatures, and charging capacity." },
    { label: "🛠️ Recommend OEM Parts", query: "What certified replacement parts are recommended for my chassis?" },
  ];

  // Toggle Voice Recognition
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setInterimSpeech("");
      return;
    }

    try {
      const recognizer = VoiceAssistantManager.createSpeechRecognizer(
        (transcript, isFinal) => {
          setInterimSpeech(transcript);
          if (isFinal) {
            setInput(transcript);
            setInterimSpeech("");
            setIsListening(false);
            handleSend(transcript);
          }
        },
        (error) => {
          console.warn("Speech recognition notice:", error);
          setIsListening(false);
          setInterimSpeech("");
        },
        () => {
          setIsListening(false);
          setInterimSpeech("");
        }
      );

      if (recognizer) {
        recognitionRef.current = recognizer;
        recognizer.start();
        setIsListening(true);
      }
    } catch (e) {
      console.warn("Failed to initialize speech recognizer", e);
      setIsListening(false);
    }
  };

  const handleSpeak = (text: string) => {
    if (isSpeaking) {
      VoiceAssistantManager.stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    VoiceAssistantManager.speakText(
      text,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  };

  const handleSend = async (customPrompt?: string) => {
    const query = (customPrompt ?? input).trim();
    if (!query || loading) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }

    const userMsg: ChatMessage = {
      id: "usr-" + Date.now(),
      role: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Call Server-side Gemini AI triage API with location & nearest workshop context
      const res = await fetch("/api/assistant/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicle,
          prompt: query,
          history: messages.slice(-5).map((m) => ({ role: m.role, text: m.text })),
          userLocation,
          nearestWorkshop,
        }),
      });

      if (!res.ok) {
        throw new Error("Server triage returned status " + res.status);
      }

      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: "ai-" + Date.now(),
        role: "ai",
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        suggestedPriority: data.priority,
        suggestedParts: data.suggestedParts,
        suggestedWorkshop: data.suggestedWorkshop || (/near|where|shop|workshop|dealer|mechanic|location|breakdown/.test(query.toLowerCase()) ? nearestWorkshop : undefined),
        canEscalate: true,
      };

      setMessages((prev) => [...prev, aiMsg]);

      // Auto-read response aloud if voice speech is enabled
      if (voiceSpeechEnabled) {
        handleSpeak(data.reply);
      }
    } catch (err) {
      console.warn("API request fallback:", err);

      const lower = query.toLowerCase();
      let replyText = "";
      let priority: "High" | "Medium" | "Low" = "Medium";
      const parts: string[] = [];
      let matchedWorkshop: Workshop | undefined = undefined;

      if (/near|where|shop|workshop|dealer|location|tow|breakdown/.test(lower)) {
        replyText = `Nearest Certified Workshop:\n\nBased on your GPS location (${userLocation.label}), the closest facility is ${nearestWorkshop.name}.\n\nDistance: ${nearestWorkshop.distanceKm} km (~${nearestWorkshop.driveTimeMin} min drive)\nAddress: ${nearestWorkshop.address}\n\nThey currently have ${nearestWorkshop.availableBays} express diagnostic bays open. I can transmit your vehicle telemetry to them immediately.`;
        priority = "Medium";
        matchedWorkshop = nearestWorkshop;
      } else if (/brake/.test(lower)) {
        replyText = `Telemetry Audit for ${vehicle.name}:\n\nYour rear brake friction linings are currently at ${vehicle.brakeWear}% wear index. Replacement recommended in ~450 km.\n\nClosest service center: ${nearestWorkshop.name} (${nearestWorkshop.distanceKm} km away). Certified OEM Brake Pads (Part #OEM-BP7904) have been flagged.`;
        priority = "High";
        parts.push("p1");
        matchedWorkshop = nearestWorkshop;
      } else if (/tire|tyre|pressure|tpms/.test(lower)) {
        replyText = `TPMS Sensor Telemetry for ${vehicle.name}:\n\nFront-left tire is reading ${vehicle.tirePressures.fl} PSI. Driving Caution: Proceed at moderate speed to ${nearestWorkshop.name} (${nearestWorkshop.distanceKm} km away, ~${nearestWorkshop.driveTimeMin} min drive).`;
        priority = vehicle.tirePressures.fl < 30 ? "High" : "Medium";
        parts.push("p3");
        matchedWorkshop = nearestWorkshop;
      } else {
        replyText = `I have analyzed your request for ${vehicle.name}. All active vehicle systems are connected to CAN-bus telematics. If you are experiencing unexpected behavior, I can guide you to ${nearestWorkshop.name} (${nearestWorkshop.distanceKm} km away).`;
        priority = "Medium";
      }

      const aiMsg: ChatMessage = {
        id: "ai-" + Date.now(),
        role: "ai",
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        suggestedPriority: priority,
        suggestedParts: parts,
        suggestedWorkshop: matchedWorkshop,
        canEscalate: true,
      };

      setMessages((prev) => [...prev, aiMsg]);

      if (voiceSpeechEnabled) {
        handleSpeak(replyText);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      
      {/* Main Chat Interface (8 Cols) */}
      <div className="lg:col-span-8 flex flex-col h-[680px] rounded-2xl border border-[#23272F] bg-[#111317] overflow-hidden shadow-2xl">
        
        {/* Chat Header with Voice Audio Controls & Location Indicator */}
        <div className="flex items-center justify-between border-b border-[#23272F] bg-[#14171E] px-4 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00D2C4]/15 border border-[#00D2C4]/30 text-[#00D2C4]">
              <Bot size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-sm font-bold text-white">
                  Connected Care AI Voice Assistant
                </span>
                <span className="rounded bg-[#00D2C4]/15 px-1.5 py-0.5 text-[9px] font-bold text-[#00D2C4] border border-[#00D2C4]/20">
                  Voice Enabled
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono">
                Streaming: {vehicle.name} · {vehicle.vin.slice(0, 11)}...
              </p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            {/* GPS Location Button */}
            <button
              onClick={onOpenLocatorModal}
              className="flex items-center gap-1.5 rounded-lg border border-[#2B313D] bg-[#101216] px-2.5 py-1 text-xs text-zinc-300 hover:border-[#00D2C4]/50 hover:text-white transition-colors"
            >
              <MapPin size={12} className="text-[#00D2C4]" />
              <span className="font-mono text-[11px] hidden sm:inline">{userLocation.label.split(",")[0]}</span>
              <span className="text-[10px] text-[#00D2C4] font-bold">({nearestWorkshop.distanceKm} km)</span>
            </button>

            {/* Audio Readout Toggle */}
            <button
              onClick={() => {
                if (isSpeaking) VoiceAssistantManager.stopSpeaking();
                setVoiceSpeechEnabled(!voiceSpeechEnabled);
              }}
              title={voiceSpeechEnabled ? "Mute MBUX Voice Readout" : "Enable MBUX Voice Readout"}
              className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
                voiceSpeechEnabled
                  ? "border-[#00D2C4]/40 bg-[#00D2C4]/10 text-[#00D2C4]"
                  : "border-[#2B313D] bg-[#101216] text-zinc-500 hover:text-white"
              }`}
            >
              {voiceSpeechEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 scrollbar">
          {messages.map((m) => {
            const isAi = m.role === "ai";
            const suggestedProducts = (m.suggestedParts || [])
              .map((id) => products.find((p) => p.id === id))
              .filter(Boolean) as Product[];

            return (
              <div
                key={m.id}
                className={`flex gap-3 ${isAi ? "items-start" : "flex-row-reverse items-start"}`}
              >
                {/* Avatar */}
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border ${
                    isAi
                      ? "bg-[#00D2C4]/15 border-[#00D2C4]/30 text-[#00D2C4]"
                      : "bg-[#1E232B] border-[#2E3542] text-zinc-300"
                  }`}
                >
                  {isAi ? <Bot size={15} /> : <User size={15} />}
                </div>

                {/* Bubble Container */}
                <div className={`space-y-2 max-w-[88%] sm:max-w-[80%]`}>
                  <div
                    className={`relative rounded-2xl p-4 text-xs sm:text-[13px] leading-relaxed shadow-sm ${
                      isAi
                        ? "bg-[#171B22] text-zinc-200 border border-[#252B36]"
                        : "bg-[#00D2C4] text-black font-medium border border-[#00E5D4]"
                    }`}
                  >
                    <p className="whitespace-pre-line">{m.text}</p>
                    
                    <div className="mt-2 flex items-center justify-between">
                      <span
                        className={`text-[10px] font-mono ${
                          isAi ? "text-zinc-500" : "text-black/70"
                        }`}
                      >
                        {m.timestamp}
                      </span>

                      {/* Listen to message audio */}
                      {isAi && (
                        <button
                          onClick={() => handleSpeak(m.text)}
                          className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-[#00D2C4] transition-colors"
                        >
                          <Volume2 size={12} />
                          <span>Listen</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Contextual Workshop Card inside AI Response */}
                  {isAi && m.suggestedWorkshop && (
                    <div className="pt-1">
                      <NearestWorkshopCard
                        workshop={m.suggestedWorkshop}
                        vehicle={vehicle}
                        onReserveBay={(ws) =>
                          onEscalateToTicket(
                            `Express Bay Reservation at ${ws.name}`,
                            `Owner requested fast-track reservation from AI Assistant triage. Vehicle: ${vehicle.name}.`,
                            "High"
                          )
                        }
                      />
                    </div>
                  )}

                  {/* Contextual Product Cards inside AI Response */}
                  {isAi && (
                    <div className="space-y-2 pt-1">
                      {suggestedProducts.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between gap-3 rounded-xl border border-[#00D2C4]/30 bg-[#00D2C4]/5 p-3 text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#14181F] text-[#00D2C4] border border-[#232935]">
                              <ShoppingBag size={14} />
                            </div>
                            <div>
                              <div className="font-semibold text-white">{p.name}</div>
                              <div className="font-mono text-[10px] text-zinc-400">
                                Part #{p.partNumber} · R{p.price.toLocaleString()}
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => onAddToCart(p)}
                            className="flex items-center gap-1.5 rounded-lg bg-[#00D2C4] px-3 py-1.5 text-xs font-bold text-black hover:bg-[#00E5D4] transition-colors shrink-0"
                          >
                            <ShoppingBag size={12} />
                            <span>Add to Cart</span>
                          </button>
                        </div>
                      ))}

                      {/* Escalate to Ticket Button */}
                      {m.canEscalate && (
                        <button
                          onClick={() =>
                            onEscalateToTicket(
                              `AI Escalation: ${m.text.slice(0, 45)}...`,
                              m.text,
                              m.suggestedPriority || "Medium"
                            )
                          }
                          className="flex w-full items-center justify-between rounded-xl border border-[#2D333E] bg-[#12151B] p-2.5 text-xs text-zinc-300 hover:border-[#00D2C4]/40 hover:text-white transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <Ticket size={13} className="text-[#00D2C4]" />
                            <span>Escalate to Master Technician Ticket (Fast-Track)</span>
                          </span>
                          <span className="font-mono text-[10px] text-[#00D2C4] font-semibold">
                            Priority: {m.suggestedPriority || "Medium"} →
                          </span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Interim Speech Preview While User Speaks */}
          {isListening && (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 animate-pulse">
                <Mic size={15} />
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-[#171B22] border border-[#00D2C4]/40 px-4 py-3 text-xs text-zinc-200">
                <div className="flex items-center gap-1">
                  <span className="h-2 w-1 bg-[#00D2C4] rounded-full animate-[pulse_0.6s_ease-in-out_infinite]" />
                  <span className="h-4 w-1 bg-[#00D2C4] rounded-full animate-[pulse_0.4s_ease-in-out_infinite]" />
                  <span className="h-3 w-1 bg-[#00D2C4] rounded-full animate-[pulse_0.8s_ease-in-out_infinite]" />
                </div>
                <span className="font-mono text-zinc-300">
                  {interimSpeech || "Listening to your voice command..."}
                </span>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#00D2C4]/15 border border-[#00D2C4]/30 text-[#00D2C4]">
                <Bot size={15} />
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-[#171B22] border border-[#252B36] px-4 py-3 text-xs text-zinc-400">
                <span className="h-2 w-2 rounded-full bg-[#00D2C4] animate-bounce" />
                <span className="h-2 w-2 rounded-full bg-[#00D2C4] animate-bounce [animation-delay:0.2s]" />
                <span className="h-2 w-2 rounded-full bg-[#00D2C4] animate-bounce [animation-delay:0.4s]" />
                <span className="ml-1 text-[11px] font-mono">Analyzing vehicle CAN bus &amp; GPS location...</span>
              </div>
            </div>
          )}

          <div ref={scrollEndRef} />
        </div>

        {/* Input Bar with Voice Microphone Button */}
        <div className="border-t border-[#23272F] bg-[#14171E] p-3 sm:p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            {/* Voice Mic Button */}
            <button
              type="button"
              onClick={toggleListening}
              title={isListening ? "Stop listening" : "Click to speak voice command"}
              className={`relative flex h-10 w-10 items-center justify-center rounded-xl border transition-all shrink-0 ${
                isListening
                  ? "border-rose-500 bg-rose-500/20 text-rose-400 ring-2 ring-rose-500/30"
                  : "border-[#2D333E] bg-[#101216] text-[#00D2C4] hover:border-[#00D2C4] hover:bg-[#00D2C4]/10"
              }`}
            >
              {isListening ? (
                <>
                  <MicOff size={16} />
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                  </span>
                </>
              ) : (
                <Mic size={16} />
              )}
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask by voice or text: "Nearest workshop", "Explain brake alert", "Tire low"...`}
              disabled={loading}
              className="flex-1 rounded-xl border border-[#2B313D] bg-[#0E1014] px-4 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-[#00D2C4] focus:outline-none focus:ring-1 focus:ring-[#00D2C4]"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00D2C4] text-black hover:bg-[#00E5D4] transition-colors disabled:opacity-40 shrink-0 font-bold"
            >
              <Send size={16} />
            </button>
          </form>
        </div>

      </div>

      {/* Right Sidebar: Location Context & Voice Action Suggestions (4 Cols) */}
      <div className="lg:col-span-4 space-y-4">
        
        {/* Closest Mercedes-Benz Workshop Card */}
        <div className="rounded-2xl border border-[#23272F] bg-[#111317] p-4 sm:p-5 shadow-xl">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
            <span className="flex items-center gap-1.5">
              <MapPin size={13} className="text-[#00D2C4]" />
              <span>Nearest Certified Hub</span>
            </span>
            <button
              onClick={onOpenLocatorModal}
              className="text-[11px] font-bold text-[#00D2C4] hover:underline"
            >
              View All
            </button>
          </div>

          <NearestWorkshopCard
            workshop={nearestWorkshop}
            vehicle={vehicle}
            compact={true}
            onReserveBay={(ws) =>
              onEscalateToTicket(
                `Emergency Bay Reservation at ${ws.name}`,
                `Owner requested immediate workshop bay reservation via voice AI. Vehicle: ${vehicle.name}.`,
                "High"
              )
            }
          />
        </div>

        {/* Quick Voice & Diagnostic Prompts */}
        <div className="rounded-2xl border border-[#23272F] bg-[#111317] p-4 sm:p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Sparkles size={13} className="text-[#00D2C4]" />
              <span>Voice / Text Shortcuts</span>
            </span>
            <span className="text-[10px] font-mono text-[#00D2C4]">AI Telematics v3.4</span>
          </div>

          <div className="space-y-2">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(qp.query)}
                className="w-full text-left rounded-xl border border-[#242A34] bg-[#151820] p-2.5 text-xs text-zinc-300 hover:border-[#00D2C4]/50 hover:bg-[#1A1F29] hover:text-white transition-all flex items-center justify-between group"
              >
                <span>{qp.label}</span>
                <ArrowRight size={12} className="text-zinc-500 group-hover:text-[#00D2C4] transition-colors shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* 24/7 Roadside Assistance Card */}
        <div className="rounded-2xl border border-rose-500/30 bg-gradient-to-br from-rose-950/20 via-[#141215] to-[#111317] p-4 sm:p-5 shadow-xl">
          <div className="flex items-center gap-2 text-rose-400 font-display text-sm font-bold">
            <AlertTriangle size={16} />
            <span>24/7 Emergency Roadside Tow</span>
          </div>
          <p className="mt-1 text-xs text-zinc-300 leading-relaxed">
            Stranded or experiencing critical loss of braking/pressure? Dispatch certified emergency roadside assist directly to your GPS coordinates ({userLocation.label}).
          </p>
          <a
            href="tel:+27800133355"
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-rose-500 py-2.5 text-xs font-bold text-white hover:bg-rose-600 transition-colors shadow-sm"
          >
            <span>Call 24/7 Roadside (0800 133 355)</span>
          </a>
        </div>

      </div>

    </div>
  );
};
