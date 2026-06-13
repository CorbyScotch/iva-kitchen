import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// If logged in AND admin — show the page
// Otherwise — redirect to home
const AdminRoute = ({ children }) => {
  const { userInfo } = useAuth();

  if (!userInfo || userInfo.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
