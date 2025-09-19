import { useState, useEffect } from "react";

interface CountdownTimerProps {
  startTime: string;
  className?: string;
  showSeconds?: boolean;
}

export function CountdownTimer({ startTime, className = "", showSeconds = true }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const timeUntilStart = new Date(startTime).getTime() - new Date().getTime();
      setTimeLeft(Math.max(0, timeUntilStart));
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  if (timeLeft <= 0) {
    return <span className={`text-green-400 ${className}`}>Started</span>;
  }

  return (
    <span className={`text-green-400 ${className}`}>
      {hours > 0 && `${hours}h `}
      {minutes > 0 && `${minutes}m `}
      {showSeconds && `${seconds}s`}
    </span>
  );
}
