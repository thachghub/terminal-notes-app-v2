'use client';

import { useState, useEffect } from 'react';

export default function TerminalDisplayWidgets() {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    // Initialize with current time
    setCurrentTime(new Date().toLocaleTimeString());
    
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-4 pl-2 max-w-md">
      <div className="flex gap-24 items-center">
        <span className="text-cyan-500">user:</span>
        <span className="text-cyan-300">example@email.com</span>
      </div>
      <div className="flex gap-24 items-center">
        <span className="text-cyan-500">Date:</span>
        <span className="text-cyan-300">May 23, 2025</span>
      </div>
      <div className="flex gap-24 items-center">
        <span className="text-cyan-500">Time:</span>
        <span className="text-cyan-300">{currentTime || 'Loading...'}</span>
      </div>
    </div>
  );
}
