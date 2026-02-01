"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BoardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBoard: (slug: string) => void;
  city: string;
  slug: string;
}

export function BoardingModal({
  isOpen,
  onClose,
  onBoard,
  city,
  slug,
}: BoardingModalProps) {
  const focusTrapRef = useRef<HTMLDivElement>(null);

  const handleContinue = useCallback(() => {
    onClose();
    onBoard(slug);
  }, [onClose, onBoard, slug]);

  const handleSkip = useCallback(() => {
    onClose();
    onBoard(slug);
  }, [onClose, onBoard, slug]);

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
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            ref={focusTrapRef}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative bg-[var(--bg-elevated)] rounded-xl shadow-2xl p-6 sm:p-8 max-w-md w-full border border-[var(--border-subtle)]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="boarding-modal-title"
              className="text-lg font-medium text-[var(--text-primary)] mb-2"
            >
              You&apos;re boarding a flight to {city}.
            </h2>
            <p className="text-[var(--text-secondary)] text-sm mb-6">
              Ready to take off?
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleContinue}
                className="px-4 py-2.5 text-sm font-medium text-[var(--bg-dark)] bg-[var(--accent-amber)] hover:bg-[#fbbf24] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent-amber)] focus:ring-offset-2 focus:ring-offset-[var(--bg-dark)]"
              >
                Continue
              </button>
              <button
                onClick={handleSkip}
                className="px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent-amber)] focus:ring-offset-2 focus:ring-offset-[var(--bg-dark)]"
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
