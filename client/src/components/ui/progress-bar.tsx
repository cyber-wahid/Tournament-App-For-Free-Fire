import { useEffect, useState } from "react";

interface ProgressBarProps {
  isLoading?: boolean;
}

export function ProgressBar({ isLoading = true }: ProgressBarProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isLoading) {
      setProgress(0);
      const timer = setTimeout(() => {
        setProgress(100);
      }, 50); // Start after 50ms

      return () => clearTimeout(timer);
    } else {
      setProgress(100);
    }
  }, [isLoading]);

  useEffect(() => {
    if (progress < 100) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 2; // Increment by 2% every 10ms for smooth animation
        });
      }, 10);

      return () => clearInterval(interval);
    }
  }, [progress]);

  if (progress >= 100) {
    return null;
  }

  return (
    <div className="fixed top-16 left-0 w-full h-1 bg-transparent z-40">
      <div 
        className="h-full bg-fire-yellow transition-all duration-75 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
