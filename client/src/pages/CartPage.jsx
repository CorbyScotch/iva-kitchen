import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import useTitle from "../hooks/useTitle";

// ─── Single Cart Item Row ────────────────────────────────
const CartItem = ({ item, onUpdate, onRemove }) => (
  <div className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-0">
    {/* Image */}
    <div className="bg-orange-50 rounded-xl h-16 w-16 flex items-center justify-center text-3xl shrink-0 overflow-hidden">
      {item.image ? (
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover rounded-xl"
        />
      ) : (
        "🍽️"
      )}
    </div>

    {/* Name + price */}
    <div className="flex-1 min-w-0">
      <h3 className="font-semibold text-gray-800 truncate">{item.name}</h3>
      <p className="text-orange-500 font-bold text-sm mt-0.5">
        GH₵ {item.price}
      </p>
    </div>

    {/* Quantity controls */}
    <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1.5">
      <button
        onClick={() => onUpdate(item._id, item.quantity - 1)}
        disabled={item.quantity <= 1}
        className="text-gray-500 hover:text-orange-500 transition-colors disabled:opacity-30"
      >
        <Minus size={14} />
      </button>
      <span className="text-gray-800 font-semibold w-4 text-center text-sm">
        {item.quantity}
      </span>
      <button
        onClick={() => onUpdate(item._id, item.quantity + 1)}
        className="text-gray-500 hover:text-orange-500 transition-colors"
      >
        <Plus size={14} />
      </button>
    </div>

    {/* Item subtotal */}
    <span className="font-bold text-gray-800 w-16 text-right text-sm">
      GH₵ {(item.price * item.quantity).toFixed(2)}
    </span>

    {/* Remove button */}
    <button
      onClick={() => onRemove(item._id)}
      className="text-gray-400 hover:text-red-500 transition-colors"
    >
      <Trash2 size={18} />
    </button>
  </div>
);

// ─── Main Cart Page ──────────────────────────────────────
const CartPage = () => {
  const { cartItems, cartTotal, updateItem, removeItem, emptyCart, loading } =
    useCart();

  const handleUpdate = async (itemId, newQuantity) => {
    if (newQuantity < 1) return; // safety check
    await updateItem(itemId, newQuantity);
  };

  const handleRemove = async (itemId) => {
    await removeItem(itemId);
    toast.success("Item removed from cart");
  };

  const handleClearCart = async () => {
    await emptyCart();
    toast.success("Cart cleared");
  };

  // ── Empty cart state ──
  if (!loading && cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <ShoppingCart size={64} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-400 mb-6">
            Looks like you haven't added anything yet
          </p>
          <Link
            to="/menu"
            className="bg-orange-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-orange-600 transition-colors inline-flex items-center gap-2"
          >
            Browse Menu <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  useTitle("My Cart");
  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4">
        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Your Cart</h1>
          {cartItems.length > 0 && (
            <button
              onClick={handleClearCart}
              className="text-sm text-red-400 hover:text-red-600 font-medium transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* ── Cart Items ── */}
          <div className="flex-1 bg-white rounded-3xl shadow-sm p-6">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="h-16 bg-gray-100 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : (
              cartItems.map((item) => (
                <CartItem
                  key={item._id}
                  item={item}
                  onUpdate={handleUpdate}
                  onRemove={handleRemove}
                />
              ))
            )}
          </div>

          {/* ── Order Summary ── */}
          <div className="lg:w-72">
            <div className="bg-white rounded-3xl shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Order Summary
              </h2>

              {/* Line items */}
              <div className="space-y-3 text-sm">
                {cartItems.map((item) => (
                  <div
                    key={item._id}
                    className="flex justify-between text-gray-600"
                  >
                    <span className="truncate mr-2">
                      {item.name} x{item.quantity}
                    </span>
                    <span className="font-medium whitespace-nowrap">
                      GH₵ {(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 my-4" />

              {/* Delivery note */}
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>Delivery</span>
                <span className="text-green-500 font-medium">Free</span>
              </div>

              {/* Total */}
              <div className="flex justify-between font-extrabold text-gray-900 text-lg">
                <span>Total</span>
                <span className="text-orange-500">
                  GH₵ {cartTotal.toFixed(2)}
                </span>
              </div>

              {/* Checkout button */}
              <Link
                to="/checkout"
                className="mt-6 w-full bg-orange-500 text-white py-3 rounded-full font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
              >
                Proceed to Checkout <ArrowRight size={18} />
              </Link>

              {/* Continue shopping */}
              <Link
                to="/menu"
                className="mt-3 w-full text-center text-sm text-gray-500 hover:text-orange-500 transition-colors block"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
