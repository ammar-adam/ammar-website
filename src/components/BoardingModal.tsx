"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface BoardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  city: string;
  slug: string;
}

export function BoardingModal({
  isOpen,
  onClose,
  city,
  slug,
}: BoardingModalProps) {
  const router = useRouter();
  const overlayRef = useRef<HTMLDivElement>(null);
  const focusTrapRef = useRef<HTMLDivElement>(null);

  const handleContinue = useCallback(() => {
    onClose();
    router.push(`/departures/${slug}`);
  }, [onClose, router, slug]);

  const handleSkip = useCallback(() => {
    onClose();
    router.push(`/departures/${slug}`);
  }, [onClose, router, slug]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab") {
        const focusable = focusTrapRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable?.length) return;
        const first = focusable[0] as HTMLElement;
        const last = focusable[focusable.length - 1] as HTMLElement;
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    const firstFocusable = focusTrapRef.current?.querySelector(
      'button, [href], [tabindex]:not([tabindex="-1"])'
    ) as HTMLElement | null;
    firstFocusable?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="boarding-modal-title"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-neutral-900/20 backdrop-blur-[1px]"
            onClick={onClose}
            onKeyDown={(e) => e.key === "Enter" && onClose()}
          />

          <motion.div
            ref={focusTrapRef}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative bg-white rounded-xl shadow-xl p-6 sm:p-8 max-w-md w-full border border-neutral-200/80"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="boarding-modal-title"
              className="text-lg font-medium text-neutral-900 mb-2"
            >
              You&apos;re boarding a flight to {city}.
            </h2>
            <p className="text-neutral-600 text-sm mb-6">
              Ready to take off?
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleContinue}
                className="px-4 py-2.5 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2"
              >
                Continue
              </button>
              <button
                onClick={handleSkip}
                className="px-4 py-2.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2"
              >
                Skip
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
