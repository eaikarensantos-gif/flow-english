"use client";

import { useEffect, useRef } from "react";

export function useAutoScroll(activeIndex: number, containerRef: React.RefObject<HTMLElement | null>) {
  const lastScrollByUser = useRef(0);
  const lastActiveIndex = useRef(-1);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onScroll = () => {
      lastScrollByUser.current = Date.now();
    };

    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, [containerRef]);

  useEffect(() => {
    if (activeIndex < 0 || activeIndex === lastActiveIndex.current) return;
    lastActiveIndex.current = activeIndex;

    const userScrolledRecently = Date.now() - lastScrollByUser.current < 2000;
    if (userScrolledRecently) return;

    const container = containerRef.current;
    const activeEl = container?.querySelector(`[data-line-index="${activeIndex}"]`);
    activeEl?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeIndex, containerRef]);
}
