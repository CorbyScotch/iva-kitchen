import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMenuItems } from "../services/menuService";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { ShoppingCart, Search } from "lucide-react";
import toast from "react-hot-toast";
import useTitle from "../hooks/useTitle";

// All possible categories — matches what we defined in the MenuItem model
const CATEGORIES = [
  "All",
  "Local Dishes",
  "Grills",
  "Fast Food",
  "Drinks",
  "Desserts",
  "Sides",
];

// ─── Single Menu Card ────────────────────────────────────
const MenuCard = ({ item, onAddToCart }) => (
  <div className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
    {/* Image */}
    <div className="bg-orange-50 h-44 flex items-center justify-center text-6xl overflow-hidden">
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

    {/* Card body */}
    <div className="p-4">
      {/* Category badge */}
      <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full font-medium">
        {item.category}
      </span>

      <div className="mt-2 flex justify-between items-start gap-2">
        <h3 className="font-bold text-gray-800">{item.name}</h3>
        <span className="text-orange-500 font-bold whitespace-nowrap">
          GH₵ {item.price}
        </span>
      </div>

      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
        {item.description}
      </p>

      {/* Availability badge */}
      {!item.isAvailable && (
        <span className="mt-2 inline-block text-xs bg-red-100 text-red-500 px-2 py-1 rounded-full">
          Currently Unavailable
        </span>
      )}

      {/* Buttons */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => onAddToCart(item)}
          disabled={!item.isAvailable}
          className="flex-1 bg-orange-500 text-white py-2 rounded-full text-sm font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
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

// ─── Main Menu Page ──────────────────────────────────────
const MenuPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const { addItem } = useCart();
  const { userInfo } = useAuth();

  // Fetch items whenever the category filter changes
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        // If 'All' is selected, don't pass a category filter
        const { data } = await getMenuItems(
          activeCategory !== "All" ? activeCategory : "",
        );
        setItems(data);
      } catch (err) {
        toast.error("Failed to load menu");
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [activeCategory]); // re-runs every time activeCategory changes

  const handleAddToCart = async (item) => {
    if (!userInfo) {
      toast.error("Please login to add items to cart");
      return;
    }
    await addItem({
      menuItem: item._id,
      name: item.name,
      price: item.price,
      image: item.image || "",
      quantity: 1,
    });
    toast.success(`${item.name} added to cart!`);
  };

  // Filter items by search query — this happens on the frontend
  // We already have the items from the backend, just hiding non-matching ones
  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  useTitle("Menu");
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Page Header ── */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 py-12 text-white text-center">
        <h1 className="text-4xl font-extrabold">Our Menu</h1>
        <p className="mt-2 text-orange-100">
          Freshly prepared meals made with love
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* ── Search Bar ── */}
        <div className="relative max-w-md mx-auto mb-8">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search dishes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
          />
        </div>

        {/* ── Category Filter Tabs ── */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors
                ${
                  activeCategory === cat
                    ? "bg-orange-500 text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-orange-400"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ── Results count ── */}
        {!loading && (
          <p className="text-gray-500 text-sm mb-6">
            {filteredItems.length}{" "}
            {filteredItems.length === 1 ? "dish" : "dishes"} found
          </p>
        )}

        {/* ── Menu Grid ── */}
        {loading ? (
          // Skeleton loaders while fetching
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="bg-gray-100 rounded-2xl h-72 animate-pulse"
              />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🍽️</p>
            <p className="text-gray-500 text-lg">No dishes found</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("All");
              }}
              className="mt-4 text-orange-500 font-semibold hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <MenuCard
                key={item._id}
                item={item}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuPage;
