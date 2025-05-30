'use client';

import { useEffect, useState } from 'react';

export default function TimeDisplay() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const now = new Date();
    setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, []);

  return <span>{time}</span>;
}
