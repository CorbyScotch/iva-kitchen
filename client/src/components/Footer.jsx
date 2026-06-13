import { Link } from "react-router-dom";
import { ChefHat, MapPin, Phone, Mail, Clock } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* ── Brand column ── */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ChefHat className="text-orange-500" size={24} />
              <span className="text-white text-lg font-bold">
                Iva <span className="text-orange-500">Kitchen</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              Bringing the rich flavours of Ghana to your table. Fresh
              ingredients, authentic recipes, unforgettable meals.
            </p>
          </div>

          {/* ── Quick links column ── */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/"
                  className="hover:text-orange-500 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/menu"
                  className="hover:text-orange-500 transition-colors"
                >
                  Our Menu
                </Link>
              </li>
              <li>
                <Link
                  to="/reservations"
                  className="hover:text-orange-500 transition-colors"
                >
                  Reservations
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="hover:text-orange-500 transition-colors"
                >
                  Create Account
                </Link>
              </li>
            </ul>
          </div>

          {/* ── Contact column ── */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <MapPin size={16} className="text-orange-500 shrink-0" />
                <span>123 Oxford Street, Osu, Accra</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-orange-500 shrink-0" />
                <span>+233 24 000 0000</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-orange-500 shrink-0" />
                <span>hello@ivakitchen.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock size={16} className="text-orange-500 shrink-0" />
                <span>Mon – Sun: 8:00 AM – 10:00 PM</span>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="border-t border-gray-700 mt-10 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Iva Kitchen. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
