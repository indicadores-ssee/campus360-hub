'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';

import type { BannerAnnouncement } from '@/types/banner';

interface AnnouncementCarouselProperties {
  messages: BannerAnnouncement[];
  rotationIntervalMs?: number;
}

export default function AnnouncementCarousel({
  messages,
  rotationIntervalMs = 15_000,
}: AnnouncementCarouselProperties) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const hasMultiple = messages.length > 1;
  const activeMessage = messages[activeIndex];

  const goToNext = useCallback(() => {
    setActiveIndex((current) => (current + 1) % messages.length);
  }, [messages.length]);

  useEffect(() => {
    setActiveIndex(0);
  }, [messages]);

  useEffect(() => {
    if (!hasMultiple || isPaused) return;

    const timer = window.setInterval(goToNext, rotationIntervalMs);
    return () => window.clearInterval(timer);
  }, [goToNext, hasMultiple, isPaused, rotationIntervalMs]);

  if (!activeMessage) return null;

  return (
    <div className="mx-auto max-w-3xl px-4">
      <div
        className="rounded-lg bg-utpl-navy px-5 py-3"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocusCapture={() => setIsPaused(true)}
        onBlurCapture={() => setIsPaused(false)}
      >
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-utpl-gold">
            <span className="font-display text-sm font-bold text-utpl-navy">!</span>
          </div>
          <div className="min-w-0 flex-1" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeIndex}-${activeMessage.title}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
              >
                <p className="font-display text-sm font-bold text-white">{activeMessage.title}</p>
                <p className="mt-0.5 text-xs text-white/70">{activeMessage.message}</p>
                {activeMessage.link && (
                  <a
                    href={activeMessage.link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1.5 inline-block text-xs font-semibold text-utpl-gold underline underline-offset-2 hover:text-white"
                  >
                    {activeMessage.link.label}
                  </a>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
