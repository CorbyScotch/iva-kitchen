import { useState } from "react";
import { Link } from "react-router-dom";
import { ChefHat, Mail, ArrowLeft } from "lucide-react";
import API from "../services/api";
import toast from "react-hot-toast";
import useTitle from "../hooks/useTitle";

const ForgotPasswordPage = () => {
  useTitle("Forgot Password");

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    try {
      setLoading(true);
      await API.post("/auth/forgot-password", { email });
      setSubmitted(true);
    } catch (err) {
      toast.error("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl shadow-sm w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <ChefHat size={40} className="text-orange-500" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            Forgot Password?
          </h1>
          <p className="text-gray-500 mt-1">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        {submitted ? (
          // Confirmation message after submitting
          <div className="text-center bg-green-50 text-green-700 rounded-xl p-5 text-sm">
            If that email exists in our system, a reset link has been sent.
            Check your inbox (and spam folder).
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="kofi@gmail.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}

        <Link
          to="/login"
          className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-orange-500 mt-6 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
