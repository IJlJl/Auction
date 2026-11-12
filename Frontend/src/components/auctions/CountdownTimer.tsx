import React, { useEffect, useState } from 'react';

interface CountdownTimerProps {
  targetDate: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const calculateTime = () => {
      const difference = new Date(targetDate).getTime() - Date.now();

      if (difference <= 0) {
        setTimeLeft('ЗАВЕРШЕНО');
        setIsUrgent(false);
        return false;
      }

     
      setIsUrgent(difference < 1000 * 60 * 10);

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference / (1000 * 60)) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      const pad = (n: number) => n.toString().padStart(2, '0');

      if (hours > 0) {
        setTimeLeft(`${hours}г ${pad(minutes)}хв ${pad(seconds)}с`);
      } else {
        setTimeLeft(`${pad(minutes)}:${pad(seconds)}`);
      }

      return true;
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  const isFinished = timeLeft === 'ЗАВЕРШЕНО';

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border backdrop-blur-md transition-all ${
        isFinished
          ? 'bg-slate-800/80 border-slate-700/50 text-slate-400'
          : isUrgent
          ? 'bg-red-500/20 border-red-500/50 text-red-400 animate-pulse'
          : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
      }`}
    >
  
      {!isFinished && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            isUrgent ? 'bg-red-400' : 'bg-blue-400'
          }`}
        />
      )}
      {timeLeft}
    </div>
  );
};