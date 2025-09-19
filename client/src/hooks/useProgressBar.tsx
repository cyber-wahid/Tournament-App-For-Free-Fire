import { useEffect, useState } from "react";
import { useLocation } from "wouter";

export function useProgressBar() {
  const [location] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500); // 0.5 seconds

    return () => clearTimeout(timer);
  }, [location]);

  return isLoading;
}
