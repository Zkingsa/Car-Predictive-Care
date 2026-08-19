/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { Navbar } from "./components/Navbar";
import { Dashboard } from "./components/Dashboard";
import { Assistant } from "./components/Assistant";
import { Tickets } from "./components/Tickets";
import { Shop } from "./components/Shop";
import { ServiceLocatorModal } from "./components/ServiceLocatorModal";
import { AuthModal } from "./components/AuthModal";
import { TelemetryInfoModal } from "./components/TelemetryInfoModal";
import { INITIAL_VEHICLES, PRODUCTS, INITIAL_TICKETS, WORKSHOPS } from "./data/mockData";
import { Vehicle, Ticket, Product, CartItem, UserLocation, Workshop, User } from "./types";
import { getWorkshopsSortedByDistance } from "./utils/geoUtils";

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>("dashboard");
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(INITIAL_VEHICLES[0].id);
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState<boolean>(false);
  const [highlightPartId, setHighlightPartId] = useState<string | null>(null);

  // Theme State: Day Mode ("light") vs Night HUD ("dark")
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("predictivecare_theme");
      if (saved === "light" || saved === "dark") return saved;
    }
    return "dark";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("predictivecare_theme", theme);
      if (theme === "light") {
        document.body.classList.remove("dark-mode");
        document.body.classList.add("light-mode");
        document.documentElement.setAttribute("data-theme", "light");
      } else {
        document.body.classList.remove("light-mode");
        document.body.classList.add("dark-mode");
        document.documentElement.setAttribute("data-theme", "dark");
      }
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Authentication state
  const [currentUser, setCurrentUser] = useState<User | null>({
    id: "usr-demo-01",
    name: "Alex Sterling",
    email: "alex.sterling@fleetcare.io",
    role: "Fleet Owner",
    registeredVehicles: ["v1", "v2", "v3"],
  });
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [telemetryModalOpen, setTelemetryModalOpen] = useState<boolean>(false);

  // User GPS Location & Workshop Locator States
  const [userLocation, setUserLocation] = useState<UserLocation>({
    label: "Sandton, Johannesburg (GPS)",
    lat: -26.1076,
    lng: 28.0567,
  });
  const [isDetectingGps, setIsDetectingGps] = useState<boolean>(false);
  const [locatorModalOpen, setLocatorModalOpen] = useState<boolean>(false);

  // Compute sorted workshops whenever location changes
  const sortedWorkshops = useMemo(() => {
    return getWorkshopsSortedByDistance(WORKSHOPS, userLocation);
  }, [userLocation]);

  const nearestWorkshop = sortedWorkshops[0] || WORKSHOPS[0];

  // Auto-detect GPS on first load if available
  useEffect(() => {
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            label: "Detected Device GPS",
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            isCustom: false,
          });
        },
        (err) => {
          console.log("Using default automotive GPS reference point:", err.message);
        },
        { timeout: 5000 }
      );
    }
  }, []);

  const handleDetectGps = () => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      alert("Geolocation is not supported in this browser environment.");
      return;
    }
    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          label: "Live Device GPS",
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          isCustom: false,
        });
        setIsDetectingGps(false);
      },
      (err) => {
        alert("GPS Location notice: " + err.message + ". Reverting to Sandton Hub.");
        setIsDetectingGps(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Ticket pre-fill states for inter-module workflows
  const [prefillSubject, setPrefillSubject] = useState<string>("");
  const [prefillDetails, setPrefillDetails] = useState<string>("");
  const [prefillPriority, setPrefillPriority] = useState<string>("");
  const [prefillDtc, setPrefillDtc] = useState<string>("");

  const currentVehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];

  // Inter-module action: Log ticket from alert or assistant
  const handleLogTicket = (subject: string, details?: string, dtc?: string, priority?: string) => {
    setPrefillSubject(subject);
    setPrefillDetails(details || "");
    setPrefillDtc(dtc || "");
    setPrefillPriority(priority || "");
    setCurrentTab("tickets");
  };

  // Inter-module action: Fast-track workshop bay reservation
  const handleReserveWorkshopBay = (workshop: Workshop) => {
    handleLogTicket(
      `Express Service Bay Reservation at ${workshop.name}`,
      `Owner requested priority booking from GPS Locator. Estimated driving time: ~${workshop.driveTimeMin} min. Vehicle: ${currentVehicle.name}.`,
      currentVehicle.alerts[0]?.dtcCode,
      "High"
    );
  };

  // Inter-module action: Order flagged part from alert or assistant
  const handleOrderPart = (partId: string) => {
    setHighlightPartId(partId);
    const product = PRODUCTS.find((p) => p.id === partId);
    if (product) {
      handleAddToCart(product);
    }
    setCurrentTab("shop");
  };

  // Inter-module action: Switch to AI Assistant with prompt
  const handleAskAssistant = (prompt: string) => {
    setCurrentTab("assistant");
  };

  // Cart operations
  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1, installAtDealer: true }];
    });
    setCartOpen(true);
  };

  const handleUpdateCartQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === productId) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Create new ticket
  const handleCreateTicket = (newTicketData: Partial<Ticket>) => {
    const fullTicket: Ticket = {
      id: newTicketData.id || `T-${1050 + tickets.length}`,
      vehicleId: newTicketData.vehicleId || currentVehicle.id,
      vehicleName: newTicketData.vehicleName || currentVehicle.name,
      vin: newTicketData.vin || currentVehicle.vin,
      subject: newTicketData.subject || "General Diagnostic Review",
      description: newTicketData.description || "",
      priority: newTicketData.priority || "Medium",
      status: newTicketData.status || "Queued",
      eta: newTicketData.eta || "~35 min",
      createdAt: "Just now",
      assignedTech: "Dispatch Queue (Automated Triage)",
      telemetrySnapshot: newTicketData.telemetrySnapshot,
      timeline: newTicketData.timeline || [
        {
          title: "Ticket Auto-Logged via Connected Predictive Care AI",
          timestamp: "Just now",
          note: "Telemetry packet synchronized with Certified Service Network.",
          author: "Predictive Care AI Agent",
        },
      ],
    };

    setTickets((prev) => [fullTicket, ...prev]);
  };

  // Telemetry Scan Simulator
  const handleRunScan = (vehicleId: string) => {
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id === vehicleId) {
          // Slightly jitter sensor readings to prove live polling
          const newFl = Number((v.tirePressures.fl + (Math.random() * 0.4 - 0.2)).toFixed(1));
          const newFr = Number((v.tirePressures.fr + (Math.random() * 0.2 - 0.1)).toFixed(1));
          return {
            ...v,
            lastConnected: "Just now (Live CAN-Bus)",
            mileage: v.mileage + 12,
            tirePressures: { ...v.tirePressures, fl: newFl, fr: newFr },
            tirePressure: Number(((newFl + newFr + v.tirePressures.rl + v.tirePressures.rr) / 4).toFixed(0)),
          };
        }
        return v;
      })
    );
  };

  return (
    <div className="min-h-screen bg-[#08090B] text-[#F3F4F6] flex flex-col font-sans selection:bg-[#00D2C4]/20 selection:text-[#00E5D4]">
      
      {/* Top Navigation with Responsive Burger Menu, GPS Pill, Day Mode Switcher & Auth */}
      <Navbar
        currentTab={currentTab}
        setTab={setCurrentTab}
        vehicles={vehicles}
        selectedVehicleId={selectedVehicleId}
        setSelectedVehicleId={setSelectedVehicleId}
        cartCount={cart.reduce((s, i) => s + i.qty, 0)}
        openCart={() => setCartOpen(true)}
        userLocation={userLocation}
        nearestWorkshop={nearestWorkshop}
        onOpenLocatorModal={() => setLocatorModalOpen(true)}
        currentUser={currentUser}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        
        {currentTab === "dashboard" && (
          <Dashboard
            vehicle={currentVehicle}
            vehicles={vehicles}
            userLocation={userLocation}
            nearestWorkshop={nearestWorkshop}
            onSelectVehicle={setSelectedVehicleId}
            onLogTicket={handleLogTicket}
            onOrderPart={handleOrderPart}
            onAskAssistant={handleAskAssistant}
            onRunScan={handleRunScan}
            onOpenLocatorModal={() => setLocatorModalOpen(true)}
            onReserveBay={handleReserveWorkshopBay}
          />
        )}

        {currentTab === "assistant" && (
          <Assistant
            vehicle={currentVehicle}
            products={PRODUCTS}
            workshops={sortedWorkshops}
            userLocation={userLocation}
            nearestWorkshop={nearestWorkshop}
            onEscalateToTicket={(subject, details, priority) =>
              handleLogTicket(subject, details, undefined, priority)
            }
            onAddToCart={handleAddToCart}
            onSwitchTab={setCurrentTab}
            onOpenLocatorModal={() => setLocatorModalOpen(true)}
          />
        )}

        {currentTab === "tickets" && (
          <Tickets
            tickets={tickets}
            vehicles={vehicles}
            currentVehicle={currentVehicle}
            onCreateTicket={handleCreateTicket}
            prefillSubject={prefillSubject}
            prefillDetails={prefillDetails}
            prefillPriority={prefillPriority}
            prefillDtc={prefillDtc}
            clearPrefill={() => {
              setPrefillSubject("");
              setPrefillDetails("");
              setPrefillPriority("");
              setPrefillDtc("");
            }}
          />
        )}

        {currentTab === "shop" && (
          <Shop
            products={PRODUCTS}
            currentVehicle={currentVehicle}
            cart={cart}
            onAddToCart={handleAddToCart}
            onUpdateQty={handleUpdateCartQty}
            onRemoveItem={handleRemoveFromCart}
            onClearCart={handleClearCart}
            cartOpen={cartOpen}
            setCartOpen={setCartOpen}
            highlightPartId={highlightPartId}
          />
        )}

      </main>

      {/* Service Locator Modal */}
      <ServiceLocatorModal
        isOpen={locatorModalOpen}
        onClose={() => setLocatorModalOpen(false)}
        workshops={sortedWorkshops}
        userLocation={userLocation}
        onUpdateLocation={setUserLocation}
        onDetectGps={handleDetectGps}
        isDetectingGps={isDetectingGps}
        vehicle={currentVehicle}
        onReserveBay={handleReserveWorkshopBay}
      />

      {/* User Login & Registration Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        currentUser={currentUser}
        onLogin={(user) => setCurrentUser(user)}
        onLogout={() => setCurrentUser(null)}
      />

      {/* Live Telemetry Info Modal */}
      <TelemetryInfoModal
        isOpen={telemetryModalOpen}
        onClose={() => setTelemetryModalOpen(false)}
        vehicle={currentVehicle}
      />

      {/* Footer & Brand-Neutral Philosophy */}
      <footer className="mt-auto border-t border-[#1C2028] bg-[#0A0C0F] py-6 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-zinc-300">
              Predictive<span className="text-[#00D2C4]">Care</span>
            </span>
            <span>·</span>
            <span className="text-zinc-400 font-medium">
              “Detect. Resolve. Supply. One unified connected fleet hub.”
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono text-zinc-500">
            <span>Telematics Core v3.4</span>
            <span>·</span>
            <span>CAN-Bus 500kbps</span>
            <span>·</span>
            <button
              onClick={() => setTelemetryModalOpen(true)}
              title="Click to view live CAN-Bus telemetry details"
              className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 underline-offset-2 hover:underline cursor-pointer transition-colors"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Telemetry Synchronized
            </button>
          </div>

        </div>
      </footer>

    </div>
  );
}
