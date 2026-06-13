import { useState, useEffect } from "react";
import {
  getAllReservations,
  updateReservationStatus,
} from "../../services/reservationService";
import { CalendarDays, Clock, Users, Phone, User } from "lucide-react";
import toast from "react-hot-toast";

const statusColor = {
  Pending: "bg-yellow-100 text-yellow-600",
  Confirmed: "bg-green-100 text-green-600",
  Cancelled: "bg-red-100 text-red-500",
};

// ─── Reservation Card ────────────────────────────────────
const ReservationCard = ({ reservation, onStatusChange }) => {
  const [updating, setUpdating] = useState(false);

  const handleAction = async (newStatus) => {
    try {
      setUpdating(true);
      await onStatusChange(reservation._id, newStatus);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      {/* Top */}
      <div className="flex items-start justify-between gap-2 mb-4">
        <div>
          <p className="font-bold text-gray-800">{reservation.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {reservation.user?.email}
          </p>
        </div>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${statusColor[reservation.status]}`}
        >
          {reservation.status}
        </span>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
        <div className="flex items-center gap-2">
          <CalendarDays size={14} className="text-orange-500" />
          {new Date(reservation.date).toLocaleDateString("en-GH", {
            dateStyle: "medium",
          })}
        </div>
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-orange-500" />
          {reservation.time}
        </div>
        <div className="flex items-center gap-2">
          <Users size={14} className="text-orange-500" />
          {reservation.guests} guest{reservation.guests > 1 ? "s" : ""}
        </div>
        <div className="flex items-center gap-2">
          <Phone size={14} className="text-orange-500" />
          {reservation.phone}
        </div>
      </div>

      {/* Special requests */}
      {reservation.specialRequests && (
        <div className="bg-gray-50 rounded-xl px-3 py-2 text-xs text-gray-500 mb-4">
          <span className="font-medium text-gray-700">Note: </span>
          {reservation.specialRequests}
        </div>
      )}

      {/* Action buttons — only show if still Pending */}
      {reservation.status === "Pending" && (
        <div className="flex gap-2">
          <button
            onClick={() => handleAction("Confirmed")}
            disabled={updating}
            className="flex-1 bg-green-500 text-white py-2 rounded-full text-sm font-semibold hover:bg-green-600 transition-colors disabled:opacity-60"
          >
            Confirm
          </button>
          <button
            onClick={() => handleAction("Cancelled")}
            disabled={updating}
            className="flex-1 bg-red-100 text-red-500 py-2 rounded-full text-sm font-semibold hover:bg-red-200 transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Main Admin Reservations Page ───────────────────────
const AdminReservationsPage = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const { data } = await getAllReservations();
      setReservations(data);
    } catch (err) {
      toast.error("Failed to load reservations");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateReservationStatus(id, newStatus);
      setReservations(
        reservations.map((r) =>
          r._id === id ? { ...r, status: newStatus } : r,
        ),
      );
      toast.success(`Reservation ${newStatus.toLowerCase()}`);
    } catch (err) {
      toast.error("Failed to update reservation");
    }
  };

  const filteredReservations =
    filterStatus === "All"
      ? reservations
      : reservations.filter((r) => r.status === filterStatus);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Reservations
          </h1>
          <p className="text-gray-500 mt-1">
            {reservations.length} total reservation
            {reservations.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {["All", "Pending", "Confirmed", "Cancelled"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors
                ${
                  filterStatus === status
                    ? "bg-orange-500 text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-orange-400"
                }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-48 bg-gray-100 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm">
            <CalendarDays size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400">No reservations found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredReservations.map((r) => (
              <ReservationCard
                key={r._id}
                reservation={r}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReservationsPage;
