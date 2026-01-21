'use client';

import { useState } from 'react';

export default function ShareButton() {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.origin;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'InkOra',
          text: 'InkOra helps you personalize invitations beautifully, at scale.',
          url: url,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: Copy to clipboard
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 glass px-6 py-3 rounded-full text-sm font-medium hover:shadow-glow transition-all z-50"
    >
      {copied ? '✓ Link Copied!' : '✨ Share InkOra'}
    </button>
  );
}