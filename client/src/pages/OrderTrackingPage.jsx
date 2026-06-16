import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getOrder } from "../services/orderService";
import {
  Clock,
  CheckCircle,
  ChefHat,
  PackageCheck,
  Truck,
  XCircle,
  MapPin,
  Phone,
  ArrowLeft,
} from "lucide-react";
import toast from "react-hot-toast";
import Spinner from "../components/Spinner";
import useTitle from "../hooks/useTitle";

// ─── Status config ───────────────────────────────────────
// Each status has an icon, label and color
const STATUS_STEPS = [
  {
    key: "Pending",
    label: "Order Placed",
    icon: Clock,
    desc: "We received your order",
  },
  {
    key: "Confirmed",
    label: "Confirmed",
    icon: CheckCircle,
    desc: "Restaurant confirmed your order",
  },
  {
    key: "Preparing",
    label: "Preparing",
    icon: ChefHat,
    desc: "Chef is cooking your meal",
  },
  {
    key: "Ready",
    label: "Ready",
    icon: PackageCheck,
    desc: "Your order is ready for delivery",
  },
  {
    key: "Delivered",
    label: "Delivered",
    icon: Truck,
    desc: "Enjoy your meal!",
  },
];

// ─── Status Timeline Component ───────────────────────────
const StatusTimeline = ({ currentStatus }) => {
  // Find the index of the current status in our steps array
  const currentIndex = STATUS_STEPS.findIndex((s) => s.key === currentStatus);

  // Cancelled order gets its own display
  if (currentStatus === "Cancelled") {
    return (
      <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl p-4">
        <XCircle className="text-red-500 shrink-0" size={24} />
        <div>
          <p className="font-bold text-red-600">Order Cancelled</p>
          <p className="text-sm text-red-400">
            This order has been cancelled. Contact us for help.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {STATUS_STEPS.map((step, index) => {
        // A step is "done" if it's before or at the current status
        const isDone = index <= currentIndex;
        // A step is "active" if it IS the current status
        const isActive = index === currentIndex;
        const Icon = step.icon;

        return (
          <div key={step.key} className="flex items-start gap-4 mb-6 last:mb-0">
            {/* Icon + connecting line */}
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors
                  ${
                    isDone
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-400"
                  }
                  ${isActive ? "ring-4 ring-orange-100" : ""}
                `}
              >
                <Icon size={18} />
              </div>
              {/* Vertical line connecting steps — hidden on last step */}
              {index < STATUS_STEPS.length - 1 && (
                <div
                  className={`w-0.5 h-8 mt-1 transition-colors
                    ${index < currentIndex ? "bg-orange-500" : "bg-gray-200"}
                  `}
                />
              )}
            </div>

            {/* Step text */}
            <div className="pt-1.5">
              <p
                className={`font-semibold text-sm
                  ${isDone ? "text-gray-900" : "text-gray-400"}
                `}
              >
                {step.label}
                {isActive && (
                  <span className="ml-2 text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                    Current
                  </span>
                )}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{step.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── Main Order Tracking Page ────────────────────────────
const OrderTrackingPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    try {
      const { data } = await getOrder(id);
      setOrder(data);
    } catch (err) {
      toast.error("Could not load order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();

    // Auto-refresh every 30 seconds
    // Like a live score — updates without the user doing anything
    const interval = setInterval(fetchOrder, 30000);

    // Cleanup — stop the interval when the user leaves this page
    // Without this, it would keep running in the background forever
    return () => clearInterval(interval);
  }, [id]);

  if (loading) return <Spinner />;

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-5xl mb-4">😕</p>
          <h2 className="text-xl font-bold text-gray-700">Order not found</h2>
          <Link
            to="/"
            className="mt-4 inline-block text-orange-500 font-semibold hover:underline"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  // useTitle(
  //   order ? `Order #${order._id.slice(-8).toUpperCase()}` : "Track Order",
  // );
  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/profile"
            className="text-gray-500 hover:text-orange-500 transition-colors"
          >
            <ArrowLeft size={22} />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">
              Track Order
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Order ID: #{order._id.slice(-8).toUpperCase()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ── Left: Status Timeline ── */}
          <div className="bg-white rounded-3xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-gray-900">Order Status</h2>
              {/* Payment badge */}
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full
                  ${
                    order.paymentStatus === "Paid"
                      ? "bg-green-100 text-green-600"
                      : "bg-yellow-100 text-yellow-600"
                  }`}
              >
                {order.paymentStatus}
              </span>
            </div>
            <StatusTimeline currentStatus={order.status} />
          </div>

          {/* ── Right: Order Details ── */}
          <div className="space-y-4">
            {/* Items ordered */}
            <div className="bg-white rounded-3xl shadow-sm p-6">
              <h2 className="font-bold text-gray-900 mb-4">Items Ordered</h2>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.name}
                      <span className="text-gray-400">
                        {" "}
                        {item.name}
                        {item.label && item.label !== "Regular"
                          ? ` (${item.label})`
                          : ""}{" "}
                        x{item.quantity}
                      </span>
                    </span>
                    <span className="font-semibold text-gray-800">
                      GH₵ {(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between font-bold text-gray-900">
                <span>Total</span>
                <span className="text-orange-500">
                  GH₵ {order.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Delivery info */}
            <div className="bg-white rounded-3xl shadow-sm p-6 space-y-3">
              <h2 className="font-bold text-gray-900 mb-4">Delivery Details</h2>
              <div className="flex items-start gap-3 text-sm text-gray-600">
                <MapPin size={16} className="text-orange-500 shrink-0 mt-0.5" />
                <span>{order.deliveryAddress}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Phone size={16} className="text-orange-500 shrink-0" />
                <span>{order.phone}</span>
              </div>
            </div>

            {/* Order placed time */}
            <div className="bg-white rounded-3xl shadow-sm p-4 text-center">
              <p className="text-xs text-gray-400">Order placed on</p>
              <p className="text-sm font-semibold text-gray-700 mt-0.5">
                {new Date(order.createdAt).toLocaleString("en-GH", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Auto-refresh notice */}
        <p className="text-center text-xs text-gray-400 mt-6">
          This page refreshes automatically every 30 seconds
        </p>
      </div>
    </div>
  );
};

export default OrderTrackingPage;
