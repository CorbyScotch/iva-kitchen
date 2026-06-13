import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllOrders } from "../../services/orderService";
import { getMenuItems } from "../../services/menuService";
import { getAllReservations } from "../../services/reservationService";
import {
  ShoppingBag,
  UtensilsCrossed,
  CalendarDays,
  TrendingUp,
  Clock,
  ChevronRight,
} from "lucide-react";
import Spinner from "../../components/Spinner";

// ─── Stat Card ───────────────────────────────────────────
const StatCard = ({ icon, label, value, color, to }) => (
  <Link
    to={to}
    className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
  >
    <div
      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}
    >
      {icon}
    </div>
    <div>
      <p className="text-2xl font-extrabold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
    <ChevronRight size={18} className="text-gray-300 ml-auto" />
  </Link>
);

// ─── Recent Order Row ─────────────────────────────────────
const RecentOrderRow = ({ order }) => {
  const statusColor = {
    Pending: "bg-yellow-100 text-yellow-600",
    Confirmed: "bg-blue-100 text-blue-600",
    Preparing: "bg-purple-100 text-purple-600",
    Ready: "bg-indigo-100 text-indigo-600",
    Delivered: "bg-green-100 text-green-600",
    Cancelled: "bg-red-100 text-red-500",
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <div>
        <p className="font-semibold text-gray-800 text-sm">
          #{order._id.slice(-8).toUpperCase()}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {order.user?.name || "Customer"} · GH₵ {order.totalAmount.toFixed(2)}
        </p>
      </div>
      <span
        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor[order.status]}`}
      >
        {order.status}
      </span>
    </div>
  );
};

// ─── Main Admin Dashboard ────────────────────────────────
const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Fetch all three at the same time using Promise.all
        // Instead of waiting for each one to finish before starting the next
        const [ordersRes, menuRes, reservationsRes] = await Promise.all([
          getAllOrders(),
          getMenuItems(),
          getAllReservations(),
        ]);
        setOrders(ordersRes.data);
        setMenuItems(menuRes.data);
        setReservations(reservationsRes.data);
      } catch (err) {
        console.log("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Calculate total revenue from paid orders only
  const totalRevenue = orders
    .filter((o) => o.paymentStatus === "Paid")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  // Pending orders count
  const pendingOrders = orders.filter((o) => o.status === "Pending").length;

  // Today's reservations
  const todayReservations = reservations.filter((r) => {
    const resDate = new Date(r.date).toDateString();
    const today = new Date().toDateString();
    return resDate === today && r.status !== "Cancelled";
  }).length;

  if (loading) return <Spinner />;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Welcome back! Here's what's happening at Iva Kitchen.
          </p>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<TrendingUp size={22} className="text-white" />}
            label="Total Revenue"
            value={`GH₵ ${totalRevenue.toFixed(0)}`}
            color="bg-orange-500"
            to="/admin/orders"
          />
          <StatCard
            icon={<ShoppingBag size={22} className="text-white" />}
            label="Total Orders"
            value={orders.length}
            color="bg-blue-500"
            to="/admin/orders"
          />
          <StatCard
            icon={<UtensilsCrossed size={22} className="text-white" />}
            label="Menu Items"
            value={menuItems.length}
            color="bg-green-500"
            to="/admin/menu"
          />
          <StatCard
            icon={<CalendarDays size={22} className="text-white" />}
            label="Today's Reservations"
            value={todayReservations}
            color="bg-purple-500"
            to="/admin/reservations"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ── Recent Orders ── */}
          <div className="bg-white rounded-3xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Recent Orders</h2>
              <Link
                to="/admin/orders"
                className="text-sm text-orange-500 font-medium hover:underline"
              >
                View all
              </Link>
            </div>

            {orders.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">
                No orders yet
              </p>
            ) : (
              // Show only the 5 most recent orders
              orders
                .slice(0, 5)
                .map((order) => (
                  <RecentOrderRow key={order._id} order={order} />
                ))
            )}
          </div>

          {/* ── Quick Actions + Pending Alert ── */}
          <div className="space-y-4">
            {/* Pending orders alert */}
            {pendingOrders > 0 && (
              <Link
                to="/admin/orders"
                className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-2xl p-4 hover:bg-orange-100 transition-colors"
              >
                <Clock size={22} className="text-orange-500 shrink-0" />
                <div>
                  <p className="font-bold text-orange-700">
                    {pendingOrders} Pending Order{pendingOrders > 1 ? "s" : ""}
                  </p>
                  <p className="text-sm text-orange-500">
                    Tap to review and confirm
                  </p>
                </div>
                <ChevronRight size={18} className="text-orange-400 ml-auto" />
              </Link>
            )}

            {/* Quick action links */}
            <div className="bg-white rounded-3xl shadow-sm p-6">
              <h2 className="font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                {[
                  {
                    to: "/admin/menu",
                    label: "Manage Menu Items",
                    icon: (
                      <UtensilsCrossed size={18} className="text-orange-500" />
                    ),
                    desc: "Add, edit or remove dishes",
                  },
                  {
                    to: "/admin/orders",
                    label: "Manage Orders",
                    icon: <ShoppingBag size={18} className="text-orange-500" />,
                    desc: "Update order statuses",
                  },
                  {
                    to: "/admin/reservations",
                    label: "Manage Reservations",
                    icon: (
                      <CalendarDays size={18} className="text-orange-500" />
                    ),
                    desc: "Confirm or cancel bookings",
                  },
                ].map((action) => (
                  <Link
                    key={action.to}
                    to={action.to}
                    className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-orange-50 rounded-xl transition-colors group"
                  >
                    <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm shrink-0">
                      {action.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 text-sm">
                        {action.label}
                      </p>
                      <p className="text-xs text-gray-400">{action.desc}</p>
                    </div>
                    <ChevronRight
                      size={16}
                      className="text-gray-300 group-hover:text-orange-500 transition-colors"
                    />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
