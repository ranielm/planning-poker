import { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';

interface SessionTimerProps {
  className?: string;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export default function SessionTimer({ className = '' }: SessionTimerProps) {
  const [startTime] = useState(() => Date.now());
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <div className={`flex items-center gap-1.5 text-slate-500 dark:text-slate-400 ${className}`}>
      <Timer className="h-4 w-4" />
      <span className="font-mono text-sm tabular-nums">
        {formatDuration(elapsed)}
      </span>
    </div>
  );
}
