import { useState, useEffect } from "react";
import { getAllOrders, updateOrderStatus } from "../../services/orderService";
import { ChevronDown } from "lucide-react";
import toast from "react-hot-toast";

const STATUS_OPTIONS = [
  "Pending",
  "Confirmed",
  "Preparing",
  "Ready",
  "Delivered",
  "Cancelled",
];

const statusColor = {
  Pending: "bg-yellow-100 text-yellow-600",
  Confirmed: "bg-blue-100 text-blue-600",
  Preparing: "bg-purple-100 text-purple-600",
  Ready: "bg-indigo-100 text-indigo-600",
  Delivered: "bg-green-100 text-green-600",
  Cancelled: "bg-red-100 text-red-500",
};

// ─── Single Order Card ───────────────────────────────────
const OrderCard = ({ order, onStatusChange }) => {
  const [updating, setUpdating] = useState(false);

  const handleChange = async (e) => {
    const newStatus = e.target.value;
    try {
      setUpdating(true);
      await onStatusChange(order._id, newStatus);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="font-bold text-gray-800">
            #{order._id.slice(-8).toUpperCase()}
          </p>
          <p className="text-sm text-gray-500 mt-0.5">
            {order.user?.name || "Customer"} · {order.phone}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {new Date(order.createdAt).toLocaleString("en-GH", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>

        {/* Status dropdown */}
        <div className="relative">
          <select
            value={order.status}
            onChange={handleChange}
            disabled={updating}
            className={`appearance-none pl-3 pr-8 py-1.5 rounded-full text-xs font-semibold border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-60 ${statusColor[order.status]}`}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <ChevronDown
            size={12}
            className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
          />
        </div>
      </div>

      {/* Items */}
      <div className="bg-gray-50 rounded-xl p-3 mb-3">
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between text-sm py-0.5">
            <span className="text-gray-600">
              {item.name} x{item.quantity}
            </span>
            <span className="font-medium text-gray-800">
              GH₵ {(item.price * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500 truncate mr-2">
          📍 {order.deliveryAddress}
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full
            ${
              order.paymentStatus === "Paid"
                ? "bg-green-100 text-green-600"
                : "bg-yellow-100 text-yellow-600"
            }`}
          >
            {order.paymentStatus}
          </span>
          <span className="font-bold text-orange-500 text-sm">
            GH₵ {order.totalAmount.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

// ─── Main Admin Orders Page ──────────────────────────────
const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await getAllOrders();
      setOrders(data);
    } catch (err) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      // Update locally
      setOrders(
        orders.map((o) =>
          o._id === orderId ? { ...o, status: newStatus } : o,
        ),
      );
      toast.success(`Order updated to ${newStatus}`);
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const filteredOrders =
    filterStatus === "All"
      ? orders
      : orders.filter((o) => o.status === filterStatus);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Orders</h1>
          <p className="text-gray-500 mt-1">
            {orders.length} total order{orders.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {["All", ...STATUS_OPTIONS].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors
                ${
                  filterStatus === status
                    ? "bg-orange-500 text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-orange-400"
                }`}
            >
              {status}
              {status !== "All" && (
                <span className="ml-1.5 text-xs opacity-70">
                  ({orders.filter((o) => o.status === status).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Orders grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-48 bg-gray-100 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm">
            <p className="text-gray-400">No orders found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrdersPage;
