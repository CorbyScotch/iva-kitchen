import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getFeaturedItems } from "../services/menuService";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import {
  ChefHat,
  Star,
  Clock,
  Truck,
  ShieldCheck,
  ArrowRight,
  ShoppingCart,
  CalendarDays,
} from "lucide-react";
import toast from "react-hot-toast";
import useTitle from "../hooks/useTitle";

// ─── Hero Section ────────────────────────────────────────
const HeroSection = () => (
  <section className="bg-gradient-to-br from-orange-50 to-amber-50 py-16 md:py-24">
    <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center gap-10">
      {/* Text side */}
      <div className="flex-1 text-center md:text-left">
        <span className="bg-orange-100 text-orange-600 text-sm font-semibold px-3 py-1 rounded-full">
          🇬🇭 Authentic Ghanaian Cuisine
        </span>
        <h1 className="mt-4 text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
          Taste the Heart of <span className="text-orange-500">Ghana</span>
        </h1>
        <p className="mt-4 text-gray-600 text-lg max-w-md mx-auto md:mx-0">
          From smoky grills to rich stews — every dish is made with fresh
          ingredients and the love of Ghanaian tradition.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
          <Link
            to="/menu"
            className="bg-orange-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
          >
            View Our Menu <ArrowRight size={18} />
          </Link>
          <Link
            to="/reservations"
            className="border-2 border-orange-500 text-orange-500 px-6 py-3 rounded-full font-semibold hover:bg-orange-50 transition-colors flex items-center justify-center gap-2"
          >
            Reserve a Table <CalendarDays size={18} />
          </Link>
        </div>
      </div>

      {/* Image side — a colourful food collage using emojis as placeholder */}
      <div className="flex-1 flex justify-center">
        <div className="bg-white rounded-3xl shadow-xl p-8 grid grid-cols-2 gap-4 max-w-xs">
          {["🍛", "🐟", "🥘", "🥤"].map((emoji, i) => (
            <div
              key={i}
              className="bg-orange-50 rounded-2xl p-6 text-5xl flex items-center justify-center"
            >
              {emoji}
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

// ─── Featured Dishes Section ─────────────────────────────
const FeaturedDishes = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const { userInfo } = useAuth();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await getFeaturedItems();
        setItems(data);
      } catch (err) {
        console.log("Failed to fetch featured items:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  // UPDATED — now takes the selected option too
  const handleAddToCart = async (item, selectedOption) => {
    if (!userInfo) {
      toast.error("Please login to add items to cart");
      return;
    }
    await addItem({
      menuItem: item._id,
      name: item.name,
      label: selectedOption.label,
      price: selectedOption.price,
      image: item.image || "",
      quantity: 1,
    });
    toast.success(`${item.name} (${selectedOption.label}) added to cart!`);
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Featured <span className="text-orange-500">Dishes</span>
          </h2>
          <p className="text-gray-500 mt-2">
            Customer favourites made fresh every day
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-gray-100 rounded-2xl h-64 animate-pulse"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="text-center text-gray-400">No featured items yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <FeaturedCard
                key={item._id}
                item={item}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 text-orange-500 font-semibold hover:gap-3 transition-all"
          >
            See Full Menu <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
};

// NEW — separate card component so we can hold each item's own selectedOption state
// (Same reason MenuCard needed its own component instead of being inline)
const FeaturedCard = ({ item, onAddToCart }) => {
  const [selectedOption, setSelectedOption] = useState(
    item.options?.[0] || { label: "Regular", price: 0 },
  );
  const hasMultipleOptions = item.options?.length > 1;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="bg-orange-50 h-44 flex items-center justify-center text-6xl">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          "🍽️"
        )}
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-gray-800">{item.name}</h3>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {item.description}
            </p>
          </div>
          <span className="text-orange-500 font-bold text-sm ml-2 whitespace-nowrap">
            GH₵ {selectedOption.price}
          </span>
        </div>

        {hasMultipleOptions && (
          <select
            value={selectedOption.label}
            onChange={(e) =>
              setSelectedOption(
                item.options.find((opt) => opt.label === e.target.value),
              )
            }
            className="mt-3 w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
          >
            {item.options.map((opt) => (
              <option key={opt.label} value={opt.label}>
                {opt.label} — GH₵ {opt.price}
              </option>
            ))}
          </select>
        )}

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => onAddToCart(item, selectedOption)}
            className="flex-1 bg-orange-500 text-white py-2 rounded-full text-sm font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center gap-1"
          >
            <ShoppingCart size={15} /> Add to Cart
          </button>
          <Link
            to={`/menu/${item._id}`}
            className="border border-orange-500 text-orange-500 px-3 py-2 rounded-full text-sm font-semibold hover:bg-orange-50 transition-colors"
          >
            View
          </Link>
        </div>
      </div>
    </div>
  );
};

// ─── Why Choose Us Section ───────────────────────────────
const WhyUs = () => {
  const reasons = [
    {
      icon: <ChefHat size={28} className="text-orange-500" />,
      title: "Authentic Recipes",
      desc: "Every dish follows traditional Ghanaian recipes passed down through generations.",
    },
    {
      icon: <Star size={28} className="text-orange-500" />,
      title: "Fresh Ingredients",
      desc: "We source our ingredients fresh daily from local markets.",
    },
    {
      icon: <Clock size={28} className="text-orange-500" />,
      title: "Fast Service",
      desc: "Your food is ready in under 30 minutes — whether dine-in or delivery.",
    },
    {
      icon: <Truck size={28} className="text-orange-500" />,
      title: "Easy Delivery",
      desc: "Order online and we deliver straight to your door.",
    },
  ];

  return (
    <section className="py-16 bg-orange-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Why Choose <span className="text-orange-500">Iva Kitchen?</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {reasons.map((reason, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 shadow-sm text-center hover:shadow-md transition-shadow"
            >
              <div className="flex justify-center mb-3">{reason.icon}</div>
              <h3 className="font-bold text-gray-800 mb-2">{reason.title}</h3>
              <p className="text-sm text-gray-500">{reason.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── How It Works Section ────────────────────────────────
const HowItWorks = () => {
  const steps = [
    {
      emoji: "🍽️",
      step: "01",
      title: "Browse Menu",
      desc: "Explore our wide selection of Ghanaian dishes and drinks.",
    },
    {
      emoji: "🛒",
      step: "02",
      title: "Add to Cart",
      desc: "Pick your favourites and add them to your cart.",
    },
    {
      emoji: "💳",
      step: "03",
      title: "Pay with MoMo",
      desc: "Checkout securely with MTN, Vodafone or AirtelTigo.",
    },
    {
      emoji: "🚀",
      step: "04",
      title: "Enjoy!",
      desc: "Track your order and enjoy your food hot and fresh.",
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-gray-900">
            How It <span className="text-orange-500">Works</span>
          </h2>
          <p className="text-gray-500 mt-2">
            Order your favourite food in 4 easy steps
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <div key={i} className="text-center">
              {/* Step number */}
              <div className="text-5xl mb-3">{s.emoji}</div>
              <span className="text-orange-500 font-extrabold text-sm">
                {s.step}
              </span>
              <h3 className="font-bold text-gray-800 mt-1 mb-2">{s.title}</h3>
              <p className="text-sm text-gray-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── Reservation CTA Section ─────────────────────────────
const ReservationCTA = () => (
  <section className="py-16 bg-gray-900 text-white">
    <div className="max-w-3xl mx-auto px-4 text-center">
      <CalendarDays size={40} className="text-orange-500 mx-auto mb-4" />
      <h2 className="text-3xl font-extrabold">Reserve Your Table Today</h2>
      <p className="text-gray-400 mt-3 text-lg">
        Planning a special occasion? Book a table and we'll make it a night to
        remember.
      </p>
      <Link
        to="/reservations"
        className="mt-8 inline-flex items-center gap-2 bg-orange-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-orange-600 transition-colors"
      >
        Book a Table <ArrowRight size={18} />
      </Link>
    </div>
  </section>
);

// ─── Main HomePage component — puts it all together ──────
const HomePage = () => {
  useTitle("Home");
  return (
    <div>
      <HeroSection />
      <FeaturedDishes />
      <WhyUs />
      <HowItWorks />
      <ReservationCTA />
    </div>
  );
};

export default HomePage;
