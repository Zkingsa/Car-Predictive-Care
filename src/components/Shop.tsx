import React, { useState } from "react";
import {
  ShoppingBag,
  Wrench,
  Zap,
  ShieldCheck,
  Star,
  Plus,
  Minus,
  Check,
  ArrowRight,
  Filter,
  Search,
  CheckCircle2,
  Truck,
  Building,
  X,
  CreditCard,
} from "lucide-react";
import { Product, CartItem, Vehicle } from "../types";

interface ShopProps {
  products: Product[];
  currentVehicle: Vehicle;
  cart: CartItem[];
  onAddToCart: (product: Product) => void;
  onUpdateQty: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  highlightPartId?: string | null;
}

export const Shop: React.FC<ShopProps> = ({
  products,
  currentVehicle,
  cart,
  onAddToCart,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  cartOpen,
  setCartOpen,
  highlightPartId,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [installPreference, setInstallPreference] = useState<"delivery" | "dealer">("dealer");
  const [orderConfirmed, setOrderConfirmed] = useState<boolean>(false);
  const [lastOrderId, setLastOrderId] = useState<string>("");

  const categories = ["All", "OEM Parts", "EV & Hybrid", "Performance", "Accessories"];

  // Filter products
  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== "All" && p.cat !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.partNumber?.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Calculate totals
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const vat = Math.round(subtotal * 0.15);
  const total = subtotal;

  const handleCheckout = () => {
    const generatedId = `PC-ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    setLastOrderId(generatedId);
    setOrderConfirmed(true);
  };

  const resetOrder = () => {
    onClearCart();
    setOrderConfirmed(false);
    setCartOpen(false);
  };

  // Find flagged part from current vehicle alerts
  const flaggedPartId = currentVehicle.alerts.find((a) => a.relatedPartId)?.relatedPartId || highlightPartId;
  const flaggedProduct = products.find((p) => p.id === flaggedPartId);

  return (
    <div className="space-y-6">
      
      {/* Contextual Telemetry Recommendation Banner */}
      {flaggedProduct && (
        <div className="relative overflow-hidden rounded-2xl border border-[#00D2C4]/40 bg-gradient-to-r from-[#00D2C4]/15 via-[#0C1E1D] to-[#111317] p-5 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 rounded-full bg-[#00D2C4] px-2.5 py-0.5 text-[10px] font-bold text-black uppercase tracking-wider">
                  <Wrench size={11} /> Flagged by Diagnostics
                </span>
                <span className="font-mono text-xs text-[#00E5D4]">
                  Chassis Match: {currentVehicle.name}
                </span>
              </div>

              <h3 className="font-display text-base sm:text-lg font-bold text-white">
                {flaggedProduct.name}
              </h3>

              <p className="text-xs text-zinc-300">
                Identified during your latest telematics scan (Wear threshold reached). Pre-order now for same-day workshop allocation or direct delivery.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <div className="text-xs text-zinc-400">Certified OEM Price</div>
                <div className="font-display text-lg font-bold text-[#00D2C4]">
                  R{flaggedProduct.price.toLocaleString()}
                </div>
              </div>

              <button
                onClick={() => onAddToCart(flaggedProduct)}
                className="flex items-center gap-1.5 rounded-xl bg-[#00D2C4] px-4 py-2.5 text-xs font-bold text-black hover:bg-[#00E5D4] transition-colors shadow-sm"
              >
                <Plus size={14} />
                <span>Add Flagged Part</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header & Category Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <ShoppingBag size={22} className="text-[#00D2C4]" />
            Certified OEM Parts &amp; Accessories Catalog
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Certified OEM components and performance accessories matched directly to your VIN.
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search part #, category, item..."
            className="w-full rounded-xl border border-[#2B313D] bg-[#111317] pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#00D2C4] focus:outline-none"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-xl px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all border ${
              selectedCategory === cat
                ? "border-[#00D2C4] bg-[#00D2C4]/15 text-[#00E5D4]"
                : "border-[#23272F] bg-[#111317] text-zinc-400 hover:border-[#353C49] hover:text-white"
            }`}
          >
            {cat === "All" ? "All Catalog" : cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProducts.map((p) => {
          const isCompatible = p.compatibleModels.includes(currentVehicle.name) || p.compatibleModels.includes("All Models");
          const inCart = cart.find((i) => i.id === p.id);
          const isFlagged = p.id === flaggedPartId;

          return (
            <div
              key={p.id}
              className={`group flex flex-col justify-between rounded-2xl border bg-[#111317] p-5 shadow-xl transition-all ${
                isFlagged
                  ? "border-[#00D2C4]/60 bg-gradient-to-b from-[#0F1D1C] to-[#111317]"
                  : "border-[#23272F] hover:border-[#343B47] hover:bg-[#14171E]"
              }`}
            >
              <div>
                {/* Visual Header / Category & Fitment */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="rounded bg-[#1A1D24] px-2 py-0.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider border border-[#2B303A]">
                    {p.cat}
                  </span>

                  {isCompatible ? (
                    <span className="flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                      <ShieldCheck size={11} /> Guaranteed Fit
                    </span>
                  ) : (
                    <span className="text-[10px] text-zinc-500 font-mono">Universal</span>
                  )}
                </div>

                {/* Part Title & Number */}
                <h3 className="font-display text-sm font-bold text-white group-hover:text-[#00E5D4] transition-colors leading-snug">
                  {p.name}
                </h3>
                
                {p.partNumber && (
                  <div className="mt-1 font-mono text-[11px] text-zinc-400">
                    OEM Part #: <span className="text-zinc-300 font-semibold">{p.partNumber}</span>
                  </div>
                )}

                <p className="mt-2 text-xs text-zinc-400 leading-relaxed line-clamp-2">
                  {p.description}
                </p>

                {/* Ratings & Stock */}
                <div className="mt-3 flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-[#1F232B]">
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star size={12} fill="#E8A33D" />
                    <span className="font-bold text-white text-[11px]">{p.rating}</span>
                    <span className="text-zinc-500 text-[10px]">({p.reviewsCount})</span>
                  </div>

                  <span className="font-mono text-[10px] text-emerald-400">
                    {p.stockCount} in stock (Express Hub)
                  </span>
                </div>
              </div>

              {/* Price & Add to Cart */}
              <div className="mt-5 flex items-center justify-between pt-3 border-t border-[#23272F]">
                <div>
                  <div className="text-[10px] text-zinc-500 uppercase font-semibold">Price</div>
                  <div className="font-display text-lg font-bold text-white">
                    R{p.price.toLocaleString()}
                  </div>
                </div>

                <button
                  onClick={() => onAddToCart(p)}
                  className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all shadow-sm ${
                    inCart
                      ? "bg-[#00D2C4]/20 text-[#00D2C4] border border-[#00D2C4]/40"
                      : "bg-[#00D2C4] text-black hover:bg-[#00E5D4]"
                  }`}
                >
                  {inCart ? (
                    <>
                      <Check size={13} />
                      <span>In Cart ({inCart.qty})</span>
                    </>
                  ) : (
                    <>
                      <Plus size={13} />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Slide-Over Cart Drawer & Checkout */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#111317] border-l border-[#272D38] h-full flex flex-col justify-between p-6 shadow-2xl overflow-y-auto scrollbar">
            
            {!orderConfirmed ? (
              <>
                {/* Cart Header */}
                <div>
                  <div className="flex items-center justify-between border-b border-[#23272F] pb-4">
                    <div className="flex items-center gap-2">
                      <ShoppingBag size={18} className="text-[#00D2C4]" />
                      <h3 className="font-display text-lg font-bold text-white">Your OEM Order</h3>
                      <span className="rounded-full bg-[#00D2C4]/15 px-2 py-0.5 text-xs font-bold text-[#00D2C4]">
                        {cart.reduce((s, i) => s + i.qty, 0)} Items
                      </span>
                    </div>
                    <button
                      onClick={() => setCartOpen(false)}
                      className="rounded-lg p-1.5 text-zinc-400 hover:bg-[#1C2028] hover:text-white"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Cart Items List */}
                  <div className="my-4 space-y-3">
                    {cart.length === 0 ? (
                      <div className="py-12 text-center text-zinc-500">
                        <ShoppingBag size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm font-semibold text-zinc-300">Your cart is empty</p>
                        <p className="text-xs text-zinc-500 mt-1">Select components or merch from the catalog.</p>
                      </div>
                    ) : (
                      cart.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-3 rounded-xl border border-[#23272F] bg-[#161920] p-3"
                        >
                          <div className="space-y-0.5 flex-1 min-w-0">
                            <div className="text-xs font-semibold text-white truncate">{item.name}</div>
                            {item.partNumber && (
                              <div className="font-mono text-[10px] text-zinc-400">Part #{item.partNumber}</div>
                            )}
                            <div className="font-display text-xs font-bold text-[#00D2C4]">
                              R{(item.price * item.qty).toLocaleString()}
                            </div>
                          </div>

                          {/* Qty Controls */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => onUpdateQty(item.id, -1)}
                              className="flex h-6 w-6 items-center justify-center rounded-lg border border-[#2C323E] bg-[#101216] text-zinc-400 hover:text-white"
                            >
                              <Minus size={11} />
                            </button>
                            <span className="w-5 text-center font-mono text-xs font-bold text-white">
                              {item.qty}
                            </span>
                            <button
                              onClick={() => onUpdateQty(item.id, 1)}
                              className="flex h-6 w-6 items-center justify-center rounded-lg border border-[#2C323E] bg-[#101216] text-zinc-400 hover:text-white"
                            >
                              <Plus size={11} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Delivery & Dealer Installation Preference */}
                  {cart.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-[#23272F]">
                      <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                        Fulfillment Preference
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setInstallPreference("dealer")}
                          className={`rounded-xl border p-2.5 text-left transition-all ${
                            installPreference === "dealer"
                              ? "border-[#00D2C4] bg-[#00D2C4]/10 text-white"
                              : "border-[#252B35] bg-[#14171E] text-zinc-400 hover:border-[#353C49]"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 text-xs font-bold">
                            <Building size={13} className="text-[#00D2C4]" />
                            <span>Workshop Install</span>
                          </div>
                          <p className="text-[10px] text-zinc-400 mt-1">Pre-allocated to your selected certified workshop</p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setInstallPreference("delivery")}
                          className={`rounded-xl border p-2.5 text-left transition-all ${
                            installPreference === "delivery"
                              ? "border-[#00D2C4] bg-[#00D2C4]/10 text-white"
                              : "border-[#252B35] bg-[#14171E] text-zinc-400 hover:border-[#353C49]"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 text-xs font-bold">
                            <Truck size={13} className="text-[#00D2C4]" />
                            <span>Express Delivery</span>
                          </div>
                          <p className="text-[10px] text-zinc-400 mt-1">Dispatched to your registered owner address</p>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Checkout Summary & Action */}
                {cart.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-[#23272F]">
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between text-zinc-400">
                        <span>Parts Subtotal</span>
                        <span className="font-mono text-zinc-200">R{(subtotal - vat).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Estimated 15% VAT (Included)</span>
                        <span className="font-mono text-zinc-200">R{vat.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Courier / Workshop Delivery</span>
                        <span className="font-mono text-emerald-400 font-semibold">FREE (Connected Fleet)</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-[#23272F]">
                        <span>Total Due</span>
                        <span className="font-display text-base font-bold text-[#00D2C4]">
                          R{total.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handleCheckout}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#00D2C4] py-3 text-xs font-bold text-black hover:bg-[#00E5D4] transition-colors shadow-lg"
                    >
                      <CreditCard size={15} />
                      <span>Confirm &amp; Place Order</span>
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* Order Confirmation Receipt */
              <div className="space-y-5 my-auto text-center py-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#00D2C4]/15 border border-[#00D2C4]/30 text-[#00D2C4] mx-auto">
                  <CheckCircle2 size={32} />
                </div>

                <div>
                  <h3 className="font-display text-xl font-bold text-white">Order Confirmed</h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Your OEM allocation has been transmitted to Central Parts Logistics.
                  </p>
                </div>

                <div className="rounded-xl border border-[#23272F] bg-[#161920] p-4 text-left space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Order Reference</span>
                    <span className="font-mono font-bold text-[#00D2C4]">{lastOrderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Destination</span>
                    <span className="text-zinc-300">
                      {installPreference === "dealer" ? "Certified Workshop Center" : "Owner Registered Address"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Total Paid</span>
                    <span className="font-bold text-white">R{total.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={resetOrder}
                  className="w-full rounded-xl bg-[#00D2C4] py-2.5 text-xs font-bold text-black hover:bg-[#00E5D4]"
                >
                  Return to Dashboard
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
