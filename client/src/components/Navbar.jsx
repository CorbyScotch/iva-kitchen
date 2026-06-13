import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Menu, X, ChefHat, User, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";

const Navbar = () => {
  // Controls whether the mobile menu is open or closed
  const [isOpen, setIsOpen] = useState(false);

  const { userInfo, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/");
    setIsOpen(false); // close mobile menu if open
  };

  // Closes mobile menu when a link is clicked
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-2" onClick={closeMenu}>
            <ChefHat className="text-orange-500" size={28} />
            <span className="text-xl font-bold text-gray-800">
              Iva <span className="text-orange-500">Kitchen</span>
            </span>
          </Link>

          {/* ── Desktop Menu ── */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/menu"
              className="text-gray-600 hover:text-orange-500 font-medium transition-colors"
            >
              Menu
            </Link>
            <Link
              to="/reservations"
              className="text-gray-600 hover:text-orange-500 font-medium transition-colors"
            >
              Reservations
            </Link>

            {/* Admin link — only shows for admins */}
            {userInfo?.role === "admin" && (
              <Link
                to="/admin"
                className="text-gray-600 hover:text-orange-500 font-medium transition-colors"
              >
                Dashboard
              </Link>
            )}

            {/* Cart icon with badge */}
            {userInfo && (
              <Link to="/cart" className="relative">
                <ShoppingCart
                  className="text-gray-600 hover:text-orange-500 transition-colors"
                  size={22}
                />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* Auth buttons */}
            {userInfo ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/profile"
                  className="flex items-center gap-1 text-gray-600 hover:text-orange-500 transition-colors"
                >
                  <User size={18} />
                  <span className="font-medium">
                    {userInfo.name.split(" ")[0]}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-gray-600 hover:text-red-500 transition-colors"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-orange-500 font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600 transition-colors font-medium"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* ── Mobile: cart + hamburger ── */}
          <div className="flex md:hidden items-center gap-4">
            {userInfo && (
              <Link to="/cart" className="relative" onClick={closeMenu}>
                <ShoppingCart className="text-gray-600" size={22} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}
            {/* Hamburger button — toggles the mobile menu */}
            <button onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? (
                <X className="text-gray-600" size={24} />
              ) : (
                <Menu className="text-gray-600" size={24} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Dropdown Menu ── */}
      {isOpen && (
        <div className="md:hidden bg-white border-t px-4 pb-4 flex flex-col gap-4">
          <Link
            to="/menu"
            className="text-gray-600 hover:text-orange-500 font-medium pt-3"
            onClick={closeMenu}
          >
            Menu
          </Link>
          <Link
            to="/reservations"
            className="text-gray-600 hover:text-orange-500 font-medium"
            onClick={closeMenu}
          >
            Reservations
          </Link>

          {userInfo?.role === "admin" && (
            <Link
              to="/admin"
              className="text-gray-600 hover:text-orange-500 font-medium"
              onClick={closeMenu}
            >
              Dashboard
            </Link>
          )}

          {userInfo ? (
            <>
              <Link
                to="/profile"
                className="text-gray-600 hover:text-orange-500 font-medium"
                onClick={closeMenu}
              >
                My Profile
              </Link>
              <button
                onClick={handleLogout}
                className="text-left text-red-500 font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-gray-600 hover:text-orange-500 font-medium"
                onClick={closeMenu}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-orange-500 text-white px-4 py-2 rounded-full text-center font-medium"
                onClick={closeMenu}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
