import { Link } from "react-router-dom";
import { ChefHat } from "lucide-react";

const NotFoundPage = () => (
  <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center px-4 text-center">
    <ChefHat size={60} className="text-orange-300 mb-4" />
    <h1 className="text-8xl font-extrabold text-orange-500">404</h1>
    <h2 className="text-2xl font-bold text-gray-800 mt-2">Page Not Found</h2>
    <p className="text-gray-500 mt-3 max-w-sm">
      Looks like this page got eaten! Let's get you back to something delicious.
    </p>
    <Link
      to="/"
      className="mt-8 bg-orange-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-orange-600 transition-colors"
    >
      Back to Home
    </Link>
  </div>
);

export default NotFoundPage;
