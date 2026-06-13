import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Every time the URL path changes, scroll to the top
    window.scrollTo(0, 0);
  }, [pathname]);

  // This component renders nothing — it just runs the effect
  return null;
};

export default ScrollToTop;
