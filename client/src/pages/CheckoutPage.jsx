import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { createOrder, updatePaymentStatus } from "../services/orderService";
import { MapPin, Phone, ShieldCheck, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import PaystackPop from "@paystack/inline-js";
import useTitle from "../hooks/useTitle";

const CheckoutPage = () => {
  const { cartItems, cartTotal, emptyCart } = useCart();
  const { userInfo } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    deliveryAddress: "",
    phone: userInfo?.phone || "", // pre-fill with their registered phone
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ── Step 1: Create order in DB (still unpaid) ──────────
  const createPendingOrder = async () => {
    const orderData = {
      items: cartItems.map((item) => ({
        menuItem: item.menuItem,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      totalAmount: cartTotal,
      deliveryAddress: formData.deliveryAddress,
      phone: formData.phone,
    };
    const { data } = await createOrder(orderData);
    return data; // returns the created order with its _id
  };

  // ── Step 2: Launch Paystack payment popup ──────────────
  const initiatePayment = (order) => {
    const handler = PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      email: userInfo.email,
      // Paystack always works in the smallest currency unit
      // For Ghana Cedis, that's pesewas (1 cedi = 100 pesewas)
      amount: Math.round(cartTotal * 100),
      currency: "GHS",
      ref: `IVA-${order._id}-${Date.now()}`, // unique reference
      metadata: {
        orderId: order._id,
        customerName: userInfo.name,
      },

      // ── Runs when payment is successful ──
      callback: async (response) => {
        try {
          // Step 3: Tell our backend the payment went through
          await updatePaymentStatus(order._id, response.reference);
          await emptyCart();
          toast.success("Payment successful! Order placed 🎉");
          // Send them to order tracking page
          navigate(`/orders/${order._id}`);
        } catch (err) {
          toast.error(
            "Payment recorded but order update failed. Contact support.",
          );
        }
      },

      // ── Runs when user closes the popup without paying ──
      onClose: () => {
        toast.error("Payment cancelled");
        setLoading(false);
      },
    });
    handler.openIframe(); // opens the Paystack payment popup
  };

  // ── Main handler — runs when they click Pay Now ────────
  const handleCheckout = async (e) => {
    e.preventDefault();

    if (!formData.deliveryAddress.trim()) {
      toast.error("Please enter your delivery address");
      return;
    }
    if (!formData.phone.trim()) {
      toast.error("Please enter your phone number");
      return;
    }
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    try {
      setLoading(true);
      // First create the order, then launch payment
      const order = await createPendingOrder();
      initiatePayment(order);
    } catch (err) {
      toast.error(err.response?.data?.message || "Checkout failed");
      setLoading(false);
    }
  };

  // ── Empty cart guard ───────────────────────────────────
  if (cartItems.length === 0) return <Navigate to="/cart" replace />;

  useTitle("Checkout");
  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/cart")}
            className="text-gray-500 hover:text-orange-500 transition-colors"
          >
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-3xl font-extrabold text-gray-900">Checkout</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* ── Left: Delivery Details Form ── */}
          <div className="flex-1">
            <form onSubmit={handleCheckout} className="space-y-6">
              <div className="bg-white rounded-3xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Delivery Details
                </h2>

                {/* Delivery Address */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Address
                  </label>
                  <div className="relative">
                    <MapPin
                      size={18}
                      className="absolute left-3 top-3.5 text-gray-400"
                    />
                    <textarea
                      name="deliveryAddress"
                      value={formData.deliveryAddress}
                      onChange={handleChange}
                      placeholder="your delivery location"
                      rows={3}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Your phone number"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </div>
                </div>
              </div>

              {/* Payment method info */}
              <div className="bg-white rounded-3xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Payment Method
                </h2>
                <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
                  <ShieldCheck className="text-green-500 shrink-0" size={22} />
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">
                      Mobile Money via Paystack
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      MTN, Vodafone, AirtelTigo — 100% secure
                    </p>
                  </div>
                </div>
              </div>

              {/* Pay button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 text-white py-4 rounded-full font-bold text-lg hover:bg-orange-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : `Pay GH₵ ${cartTotal.toFixed(2)}`}
              </button>
            </form>
          </div>

          {/* ── Right: Order Summary ── */}
          <div className="lg:w-72">
            <div className="bg-white rounded-3xl shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Order Summary
              </h2>

              {/* Items */}
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex justify-between text-sm">
                    <span className="text-gray-600 truncate mr-2">
                      {item.name} x{item.quantity}
                    </span>
                    <span className="font-semibold text-gray-800 whitespace-nowrap">
                      GH₵ {(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 my-4" />

              {/* Delivery */}
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>Delivery</span>
                <span className="text-green-500 font-medium">Free</span>
              </div>

              {/* Total */}
              <div className="flex justify-between font-extrabold text-gray-900 text-lg">
                <span>Total</span>
                <span className="text-orange-500">
                  GH₵ {cartTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
