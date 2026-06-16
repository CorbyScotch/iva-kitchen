import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyOrders } from "../services/orderService";
import { getProfile } from "../services/authService";
import {
  User,
  Phone,
  Mail,
  ShoppingBag,
  ChevronRight,
  Package,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";
import API from "../services/api";
import useTitle from "../hooks/useTitle";

// ─── Status colour helper ────────────────────────────────
const statusColor = (status) => {
  const map = {
    Pending: "bg-yellow-100 text-yellow-600",
    Confirmed: "bg-blue-100 text-blue-600",
    Preparing: "bg-purple-100 text-purple-600",
    Ready: "bg-indigo-100 text-indigo-600",
    Delivered: "bg-green-100 text-green-600",
    Cancelled: "bg-red-100 text-red-500",
  };
  return map[status] || "bg-gray-100 text-gray-600";
};

// ─── Order Row ───────────────────────────────────────────
const OrderRow = ({ order }) => (
  <Link
    to={`/orders/${order._id}`}
    className="flex items-center justify-between p-4 bg-gray-50 hover:bg-orange-50 rounded-2xl transition-colors group"
  >
    <div className="flex items-center gap-3">
      <div className="bg-white w-10 h-10 rounded-xl flex items-center justify-center shadow-sm shrink-0">
        <Package size={18} className="text-orange-500" />
      </div>
      <div>
        <p className="font-semibold text-gray-800 text-sm">
          #{order._id.slice(-8).toUpperCase()}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {order.items.length} item{order.items.length > 1 ? "s" : ""} · GH₵{" "}
          {order.totalAmount.toFixed(2)}
        </p>
        <p className="text-xs text-gray-400">
          {new Date(order.createdAt).toLocaleDateString("en-GH", {
            dateStyle: "medium",
          })}
        </p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <span
        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor(order.status)}`}
      >
        {order.status}
      </span>
      <ChevronRight
        size={16}
        className="text-gray-300 group-hover:text-orange-500 transition-colors"
      />
    </div>
  </Link>
);

// ─── Main Profile Page ───────────────────────────────────
const ProfilePage = () => {
  const { userInfo, login: saveUser } = useAuth();

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Edit form state
  const [formData, setFormData] = useState({
    name: userInfo?.name || "",
    phone: userInfo?.phone || "",
  });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useTitle("My Profile");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await getMyOrders();
      setOrders(data);
    } catch (err) {
      toast.error("Failed to load orders");
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    try {
      setSaving(true);
      // Call backend to update profile
      const { data } = await API.put("/auth/profile", formData);

      // Update AuthContext + localStorage with new info
      // Spread the old userInfo to keep the token, just update name/phone
      saveUser({ ...userInfo, name: data.name, phone: data.phone });

      setEditing(false);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto px-4">
        {/* Page header */}
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">
          My Profile
        </h1>

        <div className="space-y-6">
          {/* ── Profile Card ── */}
          <div className="bg-white rounded-3xl shadow-sm p-6">
            {/* Avatar + name */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                <span className="text-2xl font-extrabold text-orange-500">
                  {/* First letter of their name as avatar */}
                  {userInfo?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {userInfo?.name}
                </h2>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full
                    ${
                      userInfo?.role === "admin"
                        ? "bg-purple-100 text-purple-600"
                        : "bg-green-100 text-green-600"
                    }`}
                >
                  {userInfo?.role === "admin" ? "⚡ Admin" : "👤 Customer"}
                </span>
              </div>
            </div>

            {/* Info fields */}
            <div className="space-y-4">
              {/* Email — not editable */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Mail size={18} className="text-orange-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400">Email</p>
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {userInfo?.email}
                  </p>
                </div>
                <span className="text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">
                  Fixed
                </span>
              </div>

              {/* Name — editable */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <User size={18} className="text-orange-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400">Full Name</p>
                  {editing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full text-sm font-medium text-gray-700 bg-white border border-orange-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-orange-400 mt-1"
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-700">
                      {userInfo?.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Phone — editable */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Phone size={18} className="text-orange-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400">Phone Number</p>
                  {editing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full text-sm font-medium text-gray-700 bg-white border border-orange-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-orange-400 mt-1"
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-700">
                      {userInfo?.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Edit / Save buttons */}
            <div className="mt-5 flex gap-3">
              {editing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 bg-orange-500 text-white py-2.5 rounded-full font-semibold hover:bg-orange-600 transition-colors disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false);
                      // Reset form back to current values
                      setFormData({
                        name: userInfo?.name || "",
                        phone: userInfo?.phone || "",
                      });
                    }}
                    className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-full font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="flex-1 border border-orange-500 text-orange-500 py-2.5 rounded-full font-semibold hover:bg-orange-50 transition-colors"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* ── Order History ── */}
          <div className="bg-white rounded-3xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <ShoppingBag size={20} className="text-orange-500" />
              <h2 className="text-lg font-bold text-gray-900">Order History</h2>
              {orders.length > 0 && (
                <span className="ml-auto text-sm text-gray-400">
                  {orders.length} order{orders.length > 1 ? "s" : ""}
                </span>
              )}
            </div>

            {ordersLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="h-16 bg-gray-100 rounded-2xl animate-pulse"
                  />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-10">
                <Clock size={40} className="text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No orders yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Your order history will appear here
                </p>
                <Link
                  to="/menu"
                  className="mt-4 inline-block text-orange-500 font-semibold hover:underline text-sm"
                >
                  Browse our menu →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <OrderRow key={order._id} order={order} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
