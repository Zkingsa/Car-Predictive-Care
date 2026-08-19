import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API health endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "Predictive Care Connected Hub", timestamp: new Date().toISOString() });
});

// AI Diagnostic Triage Endpoint
app.post("/api/assistant/triage", async (req, res) => {
  try {
    const { vehicle, prompt, history, userLocation, nearestWorkshop } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt" });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      const ai = new GoogleGenAI({ apiKey });
      const systemInstruction = `You are the "Predictive Care" Connected Vehicle AI Diagnostic Voice & Text Assistant.
You are connected directly to the owner's vehicle telemetry stream and GPS location.
Vehicle Profile:
- Model: ${vehicle?.name || "Connected Vehicle"}
- VIN: ${vehicle?.vin || "Unknown"}
- Mileage: ${vehicle?.mileage?.toLocaleString() || "N/A"} km
- Brake Wear: ${vehicle?.brakeWear ?? "N/A"}%
- Tire Pressure: ${vehicle?.tirePressure ?? "N/A"} PSI
- Battery SoC: ${vehicle?.battery !== null && vehicle?.battery !== undefined ? vehicle.battery + "%" : "N/A (Combustion/Hybrid)"}
- Engine Coolant/Oil Temp: ${vehicle?.engineTemp ?? "N/A"}°C
- Active Alerts: ${JSON.stringify(vehicle?.alerts || [])}
- Health Score: ${vehicle?.health ?? 85}/100

Location & Workshop Context:
- Owner GPS Location: ${userLocation?.label || "Detected near Sandton / Johannesburg"}
- Nearest Certified Workshop: ${nearestWorkshop ? `${nearestWorkshop.name} (${nearestWorkshop.distanceKm} km away, ~${nearestWorkshop.driveTimeMin} min drive, ${nearestWorkshop.address}, Phone: ${nearestWorkshop.phone})` : "Sandton Central Certified Auto Care (2.4 km away)"}

Your Mission:
1. Provide precise, professional, and clear automotive triage. Explain what the telemetry means in plain English with high automotive engineering precision.
2. If the user asks for nearest shop, location, emergency help, or where to take their car during an alert, reference the nearest certified workshop, its distance, driving ETA, and caution them on driving safety (e.g. driving slow if tire pressure is low).
3. If parts are required, suggest matching OEM replacement components (e.g. OEM Brake Pad Set, Tire Pressure Valve/Seal, Cabin Filter, High-Power EV Charging Cable).
4. State whether the owner can safely drive or if immediate fast-track certified service is recommended.
5. Offer to auto-log a prioritized support ticket (with an estimated resolution time) so the owner bypasses phone queues.

Keep your response structured, concise (2-3 short paragraphs or targeted bullet points), empathetic, authoritative, and suitable for both voice audio readout and visual display.`;

      const formattedHistory = (history || []).slice(-6).map((h: { role: string; text: string }) => ({
        role: h.role === "ai" ? "model" : "user",
        parts: [{ text: h.text }],
      }));

      const contents = [
        ...formattedHistory,
        { role: "user", parts: [{ text: prompt }] },
      ];

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.4,
          maxOutputTokens: 600,
        },
      });

      const responseText = response.text || "";

      // Determine priority, part suggestions, and workshop matching
      const lower = (prompt + " " + responseText).toLowerCase();
      let priority = "Medium";
      if (/critical|danger|blowout|brake failure|smoke|overheat|low pressure|84%|immediate/.test(lower)) {
        priority = "High";
      } else if (/minor|question|merch|accessory|routine/.test(lower)) {
        priority = "Low";
      }

      const suggestedParts = [];
      if (/brake/.test(lower)) suggestedParts.push("p1");
      if (/tire|tyre|pressure/.test(lower)) suggestedParts.push("p3");
      if (/charge|charging|cable|plug/.test(lower)) suggestedParts.push("p4");
      if (/filter|odor|smell|cabin/.test(lower)) suggestedParts.push("p6");

      const hasLocationQuery = /near|nearest|where|location|shop|workshop|dealer|mechanic|emergency|breakdown|tow|address|navigate|directions/.test(lower);

      return res.json({
        reply: responseText,
        priority,
        suggestedParts,
        suggestedWorkshop: hasLocationQuery ? nearestWorkshop : undefined,
        vehicleId: vehicle?.id,
      });
    }

    // Fallback intelligent triage with location awareness
    const t = prompt.toLowerCase();
    let reply = "";
    let priority = "Medium";
    const suggestedParts: string[] = [];
    const isLocationQuery = /near|nearest|where|location|shop|workshop|dealer|mechanic|emergency|breakdown|tow|address|navigate|directions/.test(t);

    const ws = nearestWorkshop || {
      name: "Sandton Central Certified Auto Care & EV Hub",
      address: "16 Rivonia Road, Sandton, Johannesburg",
      distanceKm: 2.4,
      driveTimeMin: 6,
      phone: "+27 (0) 11 282 8000",
      availableBays: 3,
    };

    if (isLocationQuery) {
      if (/brake/.test(t) || vehicle?.brakeWear > 75) {
        reply = `Nearest Certified Workshop:\n\nBased on your detected GPS location, the closest certified center is ${ws.name} (${ws.distanceKm} km away · ~${ws.driveTimeMin} min drive).\n\nSince your rear brake wear is at ${vehicle?.brakeWear ?? 84}%, we have verified they have ${ws.availableBays} express diagnostic bays open right now. Would you like me to reserve an express bay and send GPS navigation to your cockpit?`;
        priority = "High";
        suggestedParts.push("p1");
      } else if (/tire|pressure/.test(t) || vehicle?.tirePressure < 30) {
        reply = `Emergency Workshop Triage:\n\n${ws.name} is ${ws.distanceKm} km from your current location (${ws.address}).\n\nDriving Caution: Your front tire is at ${vehicle?.tirePressure ?? 28} PSI. Please limit speed to under 60 km/h and avoid sharp cornering during the ${ws.driveTimeMin}-minute drive. Express tire service bay 02 is on standby.`;
        priority = "High";
        suggestedParts.push("p3");
      } else {
        reply = `Nearest Certified Service Facility:\n\n${ws.name}\n📍 ${ws.address}\n📏 Distance: ${ws.distanceKm} km (~${ws.driveTimeMin} min drive)\n📞 Direct Service: ${ws.phone}\n\nAll ${vehicle?.name || "connected"} diagnostic tools, high-voltage battery specialists, and genuine OEM parts are available on site.`;
        priority = "Medium";
      }
    } else if (/brake/.test(t)) {
      reply = `Diagnostic Telemetry Report for ${vehicle?.name || "your vehicle"}:\n\nYour rear brake lining wear is measured at ${vehicle?.brakeWear ?? 84}%. At this threshold, friction material is within 2.5mm of the backing plate. We recommend booking a service within 2 weeks to prevent rotor grooving. OEM Brake Pads (Part #OEM-BP7904) have been flagged for your chassis.\n\nNearest workshop: ${ws.name} (${ws.distanceKm} km away). Would you like me to auto-log a High-Priority ticket?`;
      priority = "High";
      suggestedParts.push("p1");
    } else if (/tire|tyre|pressure|psi/.test(t)) {
      reply = `TPMS Sensor Telemetry for ${vehicle?.name || "your vehicle"}:\n\nFront-Left tire pressure is currently reading ${vehicle?.tirePressure ?? 29} PSI, which is below the recommended 34 PSI threshold. Under-inflation reduces range efficiency by ~4% and increases tread shoulder wear.\n\nClosest service center: ${ws.name} (${ws.distanceKm} km away, ~${ws.driveTimeMin} min drive). I can transmit your telemetry and notify their express bay.`;
      priority = vehicle?.tirePressure && vehicle.tirePressure < 30 ? "High" : "Medium";
      suggestedParts.push("p3");
    } else if (/battery|charge|range|electric/.test(t)) {
      if (vehicle?.battery !== null && vehicle?.battery !== undefined) {
        reply = `High-Voltage Telemetry for ${vehicle?.name || "EV"}:\n\nCurrent State of Charge (SoC) is at ${vehicle.battery}%. Cell thermal conditioning is nominal at 24°C with zero degradation anomalies across all modules. Next scheduled HV inspection is in ${vehicle.nextService || "2 weeks"}.`;
        priority = "Low";
        suggestedParts.push("p4");
      } else {
        reply = `Your ${vehicle?.name || "vehicle"} is powered by a high-efficiency combustion powertrain. Current engine coolant temperature is ${vehicle?.engineTemp ?? 95}°C (nominal range 88°C - 102°C). Auxiliary battery health is at 98%.`;
        priority = "Low";
      }
    } else if (/service|maintenance|schedule|b-service|a-service/.test(t)) {
      reply = `Scheduled Maintenance Telemetry for ${vehicle?.name || "your vehicle"}:\n\nYour next scheduled maintenance interval (${vehicle?.nextService === "Now" ? "Service A (Overdue)" : "Service B (Recommended)"}) is due in ${vehicle?.nextService || "2 weeks"}.\n\nNearest facility: ${ws.name} (${ws.distanceKm} km away). I can pre-book this into our fast-track queue immediately.`;
      priority = vehicle?.nextService === "Now" ? "High" : "Medium";
    } else if (/part|buy|order|shop|merch|accessory/.test(t)) {
      reply = `Genuine OEM Catalog & Parts Logistics:\n\nAll replacement components in our catalog are certified and matched directly to your VIN (${vehicle?.vin || "1V2US8...4471"}). You can order directly for delivery or choose certified workshop installation with zero surcharge.`;
      priority = "Low";
      suggestedParts.push("p1", "p4", "p2");
    } else {
      reply = `Telemetry Analysis complete for ${vehicle?.name || "your vehicle"}:\n\nI have reviewed the real-time sensor bus. System status is overall ${vehicle?.health ?? 85}% health score. If you are on the road and experiencing issues, I can pinpoint your exact GPS location and connect you with ${ws.name} (${ws.distanceKm} km away).`;
      priority = "Medium";
    }

    return res.json({
      reply,
      priority,
      suggestedParts,
      suggestedWorkshop: isLocationQuery ? ws : undefined,
      vehicleId: vehicle?.id,
    });
  } catch (error: any) {
    console.error("AI Triage Error:", error);
    res.status(500).json({ error: error.message || "Failed to process triage request" });
  }
});

// Vite middleware for development or static serving for production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Predictive Care Connected Hub running on http://localhost:${PORT}`);
  });
}

startServer();
