import { createContext, useContext, useState, useEffect } from "react";
import {
  getCart,
  addToCart,
  removeFromCart,
  updateCartItem,
  clearCart,
} from "../services/cartService";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { userInfo } = useAuth();

  // Fetch cart from backend whenever user logs in
  useEffect(() => {
    if (userInfo) {
      fetchCart();
    } else {
      setCartItems([]); // clear cart display when logged out
    }
  }, [userInfo]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const { data } = await getCart();
      setCartItems(data.items || []);
    } catch (err) {
      console.log("Cart fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (item) => {
    try {
      const { data } = await addToCart(item);
      setCartItems(data.items);
    } catch (err) {
      console.log("Add to cart error:", err);
    }
  };

  const removeItem = async (itemId) => {
    try {
      const { data } = await removeFromCart(itemId);
      setCartItems(data.items);
    } catch (err) {
      console.log("Remove from cart error:", err);
    }
  };

  const updateItem = async (itemId, quantity) => {
    try {
      const { data } = await updateCartItem(itemId, quantity);
      setCartItems(data.items);
    } catch (err) {
      console.log("Update cart error:", err);
    }
  };

  const emptyCart = async () => {
    try {
      await clearCart();
      setCartItems([]);
    } catch (err) {
      console.log("Clear cart error:", err);
    }
  };

  // Total number of items in cart — shown on the cart icon badge
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Total price
  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        loading,
        addItem,
        removeItem,
        updateItem,
        emptyCart,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

// adding a comment to see if changes will be reflected by git hub
