"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { GlassButton } from "@/components/ui/GlassButton";
import { ArrowLeft, CircleCheck as CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { createOrder, type CartItemForOrder } from "@/lib/data";

export default function CheckoutPage() {
  const { cart, getTotals, removeItem, clearCart } = useStore();
  const { total } = getTotals();
  const [isOrdered, setIsOrdered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  const handleOrder = async () => {
    if (!customerName || !customerPhone || !tableNumber) {
      setError("Please fill in all details including table number.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const cartItemsForOrder: CartItemForOrder[] = cart.map((item) => ({
        menuItemId: item.itemId === 'h1' || !item.itemId.includes('-') 
          ? 'a0000001-0000-0000-0000-000000000001' 
          : item.itemId,
        name: item.name,
        basePrice: item.basePrice,
        quantity: item.quantity,
        selectedOptions: item.options.map(o => ({
          optionName: o.optionName,
          valueLabel: o.valueName,
          priceAdjustment: o.priceAdjustment
        })),
        selectedAddons: item.addons.map(a => ({
          addonName: a.addonName,
          addonPrice: a.price
        })),
      }));

      const id = await createOrder(cartItemsForOrder, {
        name: customerName,
        phone: customerPhone,
        tableNumber,
        notes: notes || undefined,
      });

      setOrderId(id);
      clearCart();
      setIsOrdered(true);
    } catch (err: unknown) {
      console.error("Order error:", err);
      setError(err instanceof Error ? err.message : "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (isOrdered) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-cafe-bg">
        <div className="bg-cafe-bg-dark border border-cafe-border max-w-md w-full text-center py-12 px-6 rounded-[20px] space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 12 }}
            className="flex justify-center"
          >
            <CheckCircle2 className="w-24 h-24 text-cafe-success" />
          </motion.div>
          <h1 className="text-[28px] font-serif text-cafe-text">Order Celebrated!</h1>
          <p className="text-[14px] text-cafe-text-secondary font-sans">
            Your coffee is being prepared with care. We&apos;ll notify you when it&apos;s ready for pickup.
          </p>
          <div className="pt-4">
            <Link href={`/status?id=${orderId}`}>
              <GlassButton className="w-full h-[56px] px-8 text-[15px]">
                Track Live Status
              </GlassButton>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cafe-bg text-cafe-text pb-20">
      <header className="sticky top-0 z-30 bg-cafe-bg/90 backdrop-blur-md border-b border-cafe-border p-4 flex items-center gap-4 max-w-4xl mx-auto">
        <Link href="/menu" className="p-2 hover:bg-cafe-bg-mid rounded-full transition-colors text-cafe-text-secondary">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="font-serif text-[28px] text-cafe-text">Your Order</h1>
        {cart.length > 0 && (
          <span className="bg-brown-300 text-cafe-bg text-[12px] font-bold px-3 py-1 rounded-full ml-auto">
            {cart.length} items
          </span>
        )}
      </header>

      <div className="max-w-4xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Cart Items */}
        <div className="space-y-6">
          {cart.length === 0 ? (
            <div className="py-12 text-center text-cafe-text-muted font-sans text-[14px]">
              Your cart is empty.
              <div className="mt-4">
                <Link href="/menu" className="text-brown-500 font-bold hover:underline">Go back to menu</Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.cartItemId} className="bg-cafe-bg-dark border border-cafe-border rounded-[16px] p-4 flex justify-between items-center transition-colors hover:border-cafe-border-light">
                  <div>
                    <h3 className="font-sans font-semibold text-[16px] text-cafe-text">{item.name}</h3>
                    <p className="text-[12px] text-cafe-text-muted mt-1 font-sans">
                      {item.options.map((o) => o.valueName).join(' • ')} • x{item.quantity}
                    </p>
                    {item.addons.length > 0 && (
                      <p className="text-[12px] text-brown-500 mt-1 font-sans">
                        + {item.addons.map((a) => a.addonName).join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="font-sans font-bold text-[16px] text-brown-600">${item.totalPrice.toFixed(2)}</span>
                    <button
                      onClick={() => removeItem(item.cartItemId)}
                      className="text-[12px] font-sans font-bold text-cafe-danger hover:text-cafe-danger/80 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Checkout Form */}
        <div className="space-y-6">
          <div className="bg-cafe-bg-dark border border-cafe-border rounded-[16px] p-6 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[14px] font-semibold text-cafe-text font-sans">Full Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-cafe-bg-mid border border-cafe-border text-cafe-text placeholder:text-cafe-text-muted rounded-[12px] px-4 py-3 outline-none focus:border-brown-400 focus:shadow-[0_0_0_3px_rgba(139,107,61,0.2)] transition-all font-sans text-[16px]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[14px] font-semibold text-cafe-text font-sans">Phone Number</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="(555) 000-0000"
                  className="w-full bg-cafe-bg-mid border border-cafe-border text-cafe-text placeholder:text-cafe-text-muted rounded-[12px] px-4 py-3 outline-none focus:border-brown-400 focus:shadow-[0_0_0_3px_rgba(139,107,61,0.2)] transition-all font-sans text-[16px]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[14px] font-semibold text-cafe-text font-sans">Table Number</label>
                <input
                  type="text"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="e.g. Table 5 or Takeaway"
                  className="w-full bg-cafe-bg-mid border border-cafe-border text-cafe-text placeholder:text-cafe-text-muted rounded-[12px] px-4 py-3 outline-none focus:border-brown-400 focus:shadow-[0_0_0_3px_rgba(139,107,61,0.2)] transition-all font-sans text-[16px]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[14px] font-semibold text-cafe-text font-sans">Special Requests (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. No cilantro, extra hot..."
                  rows={2}
                  className="w-full bg-cafe-bg-mid border border-cafe-border text-cafe-text placeholder:text-cafe-text-muted rounded-[12px] px-4 py-3 outline-none focus:border-brown-400 focus:shadow-[0_0_0_3px_rgba(139,107,61,0.2)] transition-all resize-none font-sans text-[16px]"
                />
              </div>
              {error && <p className="text-cafe-danger text-[14px] font-sans font-medium">{error}</p>}
            </div>

            <div className="pt-6 border-t border-cafe-border space-y-4">
              <div className="flex justify-between items-center text-[14px] font-sans text-cafe-text-secondary">
                <span>Subtotal</span>
                <span>${getTotals().subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-[14px] font-sans text-cafe-text-muted">
                <span>Tax (5%)</span>
                <span>${getTotals().tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-[16px] font-bold text-cafe-text font-sans">Total</span>
                <span className="text-[24px] font-serif text-brown-700 font-bold">${total.toFixed(2)}</span>
              </div>
              <GlassButton
                className="w-full mt-4 h-[56px] text-[15px]"
                onClick={handleOrder}
                disabled={loading || cart.length === 0}
              >
                {loading ? "Processing..." : `Pay $${total.toFixed(2)}`}
              </GlassButton>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
