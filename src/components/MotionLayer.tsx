"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Progressive enhancement: content stays visible without JS or motion. */
export function MotionLayer() {
  const path = usePathname();
  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const seen = new WeakSet<Element>();
    const animations = new Map<Element, Animation>();
    const reveal = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting || seen.has(target)) return;
        seen.add(target);
        reveal.unobserve(target);
        if (preference.matches) return;
        const index = Array.from(target.parentElement?.children ?? []).indexOf(target);
        const animation = target.animate(
          [{ opacity: 0, transform: "translateY(12px)" }, { opacity: 1, transform: "translateY(0)" }],
          { duration: 460, delay: Math.min(index, 3) * 45, easing: "cubic-bezier(.22,1,.36,1)" },
        );
        animations.set(target, animation);
        animation.onfinish = () => animations.delete(target);
      });
    }, { threshold: 0.08 });
    const ambient = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        target.classList.toggle("motion-in-view", isIntersecting);
      });
    });
    const scan = () => {
      document.querySelectorAll(".steps article, .workbench-card, .resource-note-card, .specialist-card, .section-heading, .resource-section-heading").forEach((node) => {
        if (!seen.has(node)) reveal.observe(node);
      });
      document.querySelectorAll(".resource-hero").forEach((node) => ambient.observe(node));
    };
    scan();
    const mutations = new MutationObserver((records) => {
      if (records.some((record) => Array.from(record.addedNodes).some((node) => node.nodeType === 1))) scan();
      const result = document.querySelector(".result-hero");
      if (!result || preference.matches || !records.some((record) => result.contains(record.target))) return;
      animations.get(result)?.cancel();
      animations.set(result, result.animate([{ opacity: .55 }, { opacity: 1 }], { duration: 180, easing: "ease-out" }));
    });
    mutations.observe(document.getElementById("content") ?? document.body, { childList: true, characterData: true, subtree: true });
    const reduce = () => {
      if (preference.matches) animations.forEach((animation) => animation.cancel());
    };
    preference.addEventListener("change", reduce);
    return () => {
      reveal.disconnect();
      ambient.disconnect();
      mutations.disconnect();
      preference.removeEventListener("change", reduce);
      animations.forEach((animation) => animation.cancel());
    };
  }, [path]);
  return null;
}
