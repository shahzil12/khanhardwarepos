'use client';

import { useEffect, useState } from 'react';

interface FormattedDateProps {
  dateString: string;
  showTime?: boolean;
}

export default function FormattedDate({ dateString, showTime = false }: FormattedDateProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return empty during SSR and initial hydration to prevent mismatch
    return <span className="opacity-0">Loading...</span>;
  }

  const date = new Date(dateString);

  if (showTime) {
    return (
      <span suppressHydrationWarning>
        {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    );
  }

  return (
    <span suppressHydrationWarning>
      {date.toLocaleDateString()}
    </span>
  );
}
