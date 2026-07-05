'use client';

import { useEffect, useState } from 'react';

import type { BannerAnnouncement } from '@/types/banner';

export function useBannerAnnouncements() {
  const [messages, setMessages] = useState<BannerAnnouncement[]>([]);
  const [rotationIntervalMs, setRotationIntervalMs] = useState(15_000);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch('/api/avisos', { cache: 'no-store' });
        if (!response.ok) return;

        const data = (await response.json()) as {
          messages?: BannerAnnouncement[];
          rotationIntervalMs?: number;
        };

        if (cancelled) return;

        setMessages(Array.isArray(data.messages) ? data.messages : []);
        if (typeof data.rotationIntervalMs === 'number') {
          setRotationIntervalMs(data.rotationIntervalMs);
        }
      } catch {
        if (!cancelled) setMessages([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { messages, rotationIntervalMs, isLoading };
}
