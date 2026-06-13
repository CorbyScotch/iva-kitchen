import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMenuItem } from "../services/menuService";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { ShoppingCart, ArrowLeft, Plus, Minus } from "lucide-react";
import toast from "react-hot-toast";
import useTitle from "../hooks/useTitle";

const MenuItemPage = () => {
  const { id } = useParams(); // grabs the :id from the URL
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  const { addItem } = useCart();
  const { userInfo } = useAuth();

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const { data } = await getMenuItem(id);
        setItem(data);
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
      price: item.price,
      image: item.image || "",
      quantity,
    });
    toast.success(`${item.name} x${quantity} added to cart!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-orange-500 text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!item) return null;

  useTitle(item?.name || "Menu");

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto px-4">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-orange-500 mb-6 transition-colors"
        >
          <ArrowLeft size={18} /> Back to Menu
        </button>

        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          {/* Image */}
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

          {/* Details */}
          <div className="p-6">
            <div className="flex justify-between items-start gap-4">
              <div>
                {/* Category badge */}
                <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full font-medium">
                  {item.category}
                </span>
                <h1 className="text-2xl font-extrabold text-gray-900 mt-2">
                  {item.name}
                </h1>
              </div>
              <span className="text-2xl font-extrabold text-orange-500 whitespace-nowrap">
                GH₵ {item.price}
              </span>
            </div>

            <p className="text-gray-600 mt-4 leading-relaxed">
              {item.description}
            </p>

            {/* Availability */}
            {!item.isAvailable && (
              <div className="mt-4 bg-red-50 text-red-500 px-4 py-3 rounded-xl text-sm font-medium">
                This item is currently unavailable
              </div>
            )}

            {/* Quantity selector + Add to cart */}
            {item.isAvailable && (
              <div className="mt-6 flex items-center gap-4">
                {/* Quantity controls */}
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

                {/* Add to cart button */}
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-orange-500 text-white py-3 rounded-full font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={18} />
                  Add to Cart — GH₵ {(item.price * quantity).toFixed(2)}
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
