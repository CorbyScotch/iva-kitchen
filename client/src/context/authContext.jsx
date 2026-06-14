import { createContext, useContext, useState, useEffect } from "react";

// 1. Create the notice board
const AuthContext = createContext();

// 2. Create the provider — the component that wraps the app and shares the data
export const AuthProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(
    // On load, check if user was already logged in (saved in localStorage)
    localStorage.getItem("userInfo")
      ? JSON.parse(localStorage.getItem("userInfo"))
      : null,
  );

  // Login — save user to state AND localStorage
  const login = (data) => {
    setUserInfo(data);
    localStorage.setItem("userInfo", JSON.stringify(data));
  };

  // Logout — clear everything
  const logout = () => {
    setUserInfo(null);
    localStorage.removeItem("userInfo");
  };

  return (
    <AuthContext.Provider value={{ userInfo, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Custom hook — shortcut to use this context anywhere
export const useAuth = () => useContext(AuthContext);

// adding a comment to see if changes will be reflected by git hub
