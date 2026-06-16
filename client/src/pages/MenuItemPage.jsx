import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMenuItem } from "../services/menuService";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { ShoppingCart, ArrowLeft, Plus, Minus } from "lucide-react";
import toast from "react-hot-toast";

const MenuItemPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  // NEW — track which size/option the customer picked
  const [selectedOption, setSelectedOption] = useState(null);

  const { addItem } = useCart();
  const { userInfo } = useAuth();

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const { data } = await getMenuItem(id);
        setItem(data);
        // Default to the first option once the item loads
        setSelectedOption(data.options?.[0] || { label: "Regular", price: 0 });
      } catch (err) {
        toast.error("Item not found");
        navigate("/menu");
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  const handleAddToCart = async () => {
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
      quantity,
    });
    toast.success(
      `${item.name} (${selectedOption.label}) x${quantity} added to cart!`,
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-orange-500 text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!item || !selectedOption) return null;

  const hasMultipleOptions = item.options.length > 1;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto px-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-orange-500 mb-6 transition-colors"
        >
          <ArrowLeft size={18} /> Back to Menu
        </button>

        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <div className="bg-orange-50 h-64 flex items-center justify-center text-8xl overflow-hidden">
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

          <div className="p-6">
            <div className="flex justify-between items-start gap-4">
              <div>
                <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full font-medium">
                  {item.category}
                </span>
                <h1 className="text-2xl font-extrabold text-gray-900 mt-2">
                  {item.name}
                </h1>
              </div>
              {/* Price now reflects the SELECTED option, not a fixed price */}
              <span className="text-2xl font-extrabold text-orange-500 whitespace-nowrap">
                GH₵ {selectedOption.price}
              </span>
            </div>

            <p className="text-gray-600 mt-4 leading-relaxed">
              {item.description}
            </p>

            {!item.isAvailable && (
              <div className="mt-4 bg-red-50 text-red-500 px-4 py-3 rounded-xl text-sm font-medium">
                This item is currently unavailable
              </div>
            )}

            {/* ── Size selector — only show if there's more than one option ── */}
            {item.isAvailable && hasMultipleOptions && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose a size
                </label>
                <div className="flex flex-wrap gap-2">
                  {item.options.map((opt) => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setSelectedOption(opt)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors
                        ${
                          selectedOption.label === opt.label
                            ? "bg-orange-500 text-white border-orange-500"
                            : "border-gray-200 text-gray-600 hover:border-orange-400"
                        }`}
                    >
                      {opt.label} — GH₵ {opt.price}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {item.isAvailable && (
              <div className="mt-6 flex items-center gap-4">
                <div className="flex items-center gap-3 bg-gray-100 rounded-full px-4 py-2">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="text-gray-600 hover:text-orange-500 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="font-bold text-gray-800 w-4 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="text-gray-600 hover:text-orange-500 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-orange-500 text-white py-3 rounded-full font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={18} />
                  Add to Cart — GH₵{" "}
                  {(selectedOption.price * quantity).toFixed(2)}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuItemPage;
