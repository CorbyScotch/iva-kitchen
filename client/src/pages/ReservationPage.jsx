import { useState, useEffect } from "react";
import {
  createReservation,
  getMyReservations,
  cancelReservation,
} from "../services/reservationService";
import { useAuth } from "../context/AuthContext";
import {
  CalendarDays,
  Clock,
  Users,
  MessageSquare,
  Phone,
  User,
  XCircle,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import useTitle from "../hooks/useTitle";

// ─── Status Badge ────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const styles = {
    Pending: "bg-yellow-100 text-yellow-600",
    Confirmed: "bg-green-100 text-green-600",
    Cancelled: "bg-red-100 text-red-500",
  };
  const icons = {
    Pending: <AlertCircle size={13} />,
    Confirmed: <CheckCircle size={13} />,
    Cancelled: <XCircle size={13} />,
  };
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${styles[status]}`}
    >
      {icons[status]} {status}
    </span>
  );
};

// ─── Reservation Card ────────────────────────────────────
const ReservationCard = ({ reservation, onCancel }) => {
  const isUpcoming =
    reservation.status !== "Cancelled" &&
    new Date(reservation.date) >= new Date();

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <div className="flex justify-between items-start gap-2 mb-3">
        <div>
          <p className="font-bold text-gray-800">{reservation.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Booked on{" "}
            {new Date(reservation.createdAt).toLocaleDateString("en-GH")}
          </p>
        </div>
        <StatusBadge status={reservation.status} />
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

      {/* Cancel button — only show for upcoming reservations */}
      {isUpcoming && (
        <button
          onClick={() => onCancel(reservation._id)}
          className="text-sm text-red-400 hover:text-red-600 font-medium transition-colors"
        >
          Cancel Reservation
        </button>
      )}
    </div>
  );
};

// ─── Main Reservation Page ───────────────────────────────
const ReservationPage = () => {
  const { userInfo } = useAuth();

  const [formData, setFormData] = useState({
    name: userInfo?.name || "",
    phone: userInfo?.phone || "",
    date: "",
    time: "",
    guests: 2,
    specialRequests: "",
  });

  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Available time slots
  const TIME_SLOTS = [
    "11:00 AM",
    "11:30 AM",
    "12:00 PM",
    "12:30 PM",
    "1:00 PM",
    "1:30 PM",
    "2:00 PM",
    "2:30 PM",
    "6:00 PM",
    "6:30 PM",
    "7:00 PM",
    "7:30 PM",
    "8:00 PM",
    "8:30 PM",
    "9:00 PM",
  ];

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const { data } = await getMyReservations();
      setReservations(data);
    } catch (err) {
      toast.error("Failed to load reservations");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.date || !formData.time) {
      toast.error("Please select a date and time");
      return;
    }

    // Make sure they're not booking in the past
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // reset time to midnight for fair comparison

    if (selectedDate < today) {
      toast.error("Please select a future date");
      return;
    }

    if (formData.guests < 1 || formData.guests > 20) {
      toast.error("Guests must be between 1 and 20");
      return;
    }

    try {
      setSubmitting(true);
      const { data } = await createReservation(formData);

      // Add the new reservation to the top of the list
      setReservations([data, ...reservations]);

      // Reset form (keep name and phone pre-filled)
      setFormData({
        name: userInfo?.name || "",
        phone: userInfo?.phone || "",
        date: "",
        time: "",
        guests: 2,
        specialRequests: "",
      });

      toast.success("Table reserved successfully! 🎉");
    } catch (err) {
      toast.error(err.response?.data?.message || "Reservation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id) => {
    // Simple confirmation before cancelling
    if (!window.confirm("Are you sure you want to cancel this reservation?")) {
      return;
    }
    try {
      await cancelReservation(id);
      // Update the status locally without refetching from backend
      setReservations(
        reservations.map((r) =>
          r._id === id ? { ...r, status: "Cancelled" } : r,
        ),
      );
      toast.success("Reservation cancelled");
    } catch (err) {
      toast.error("Failed to cancel reservation");
    }
  };

  // Get today's date in YYYY-MM-DD format for the min date on the input
  // This prevents selecting past dates in the date picker
  const todayString = new Date().toISOString().split("T")[0];

  useTitle("Manage Reservations");
  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4">
        {/* Page header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Reserve a <span className="text-orange-500">Table</span>
          </h1>
          <p className="text-gray-500 mt-2">
            Book your spot and we'll have everything ready for you
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ── Booking Form ── */}
          <div className="bg-white rounded-3xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">
              New Reservation
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
              </div>

              {/* Date + Guests side by side */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <div className="relative">
                    <CalendarDays
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      min={todayString}
                      onChange={handleChange}
                      required
                      className="w-full pl-9 pr-2 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Guests
                  </label>
                  <div className="relative">
                    <Users
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="number"
                      name="guests"
                      value={formData.guests}
                      onChange={handleChange}
                      min={1}
                      max={20}
                      required
                      className="w-full pl-9 pr-2 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </div>
                </div>
              </div>

              {/* Time slots */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select a Time
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setFormData({ ...formData, time: slot })}
                      className={`py-2 px-2 rounded-xl text-sm font-medium border transition-colors
                        ${
                          formData.time === slot
                            ? "bg-orange-500 text-white border-orange-500"
                            : "border-gray-200 text-gray-600 hover:border-orange-400"
                        }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Special Requests */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Requests{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <MessageSquare
                    size={16}
                    className="absolute left-3 top-3 text-gray-400"
                  />
                  <textarea
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleChange}
                    placeholder="e.g. Window seat, birthday celebration, allergies..."
                    rows={3}
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-orange-500 text-white py-3 rounded-full font-semibold hover:bg-orange-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? "Booking..." : "Reserve Table"}
              </button>
            </form>
          </div>

          {/* ── My Reservations ── */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              My Reservations
            </h2>

            {loading ? (
              <div className="space-y-4">
                {[1, 2].map((n) => (
                  <div
                    key={n}
                    className="h-40 bg-gray-100 rounded-2xl animate-pulse"
                  />
                ))}
              </div>
            ) : reservations.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                <CalendarDays
                  size={40}
                  className="text-gray-300 mx-auto mb-3"
                />
                <p className="text-gray-500">No reservations yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Your bookings will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {reservations.map((r) => (
                  <ReservationCard
                    key={r._id}
                    reservation={r}
                    onCancel={handleCancel}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationPage;
