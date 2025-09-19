import { useEffect, useState } from "react";

interface FireLoadingProps {
  children: React.ReactNode;
}

export function FireLoading({ children }: FireLoadingProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300); // 0.3 seconds

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-dark">
        <div className="text-center">
          <div className="w-12 h-12 bg-fire-yellow rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
            <i className="fas fa-fire text-primary-dark text-xl font-bold"></i>
          </div>
          <p className="text-fire-yellow font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
