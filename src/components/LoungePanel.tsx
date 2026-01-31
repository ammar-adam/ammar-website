"use client";

import { motion } from "framer-motion";
import { loungeContent } from "@/data/lounge";

export function LoungePanel() {
  return (
    <section className="py-12 sm:py-16 px-4">
      <div className="mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl sm:text-3xl font-light text-neutral-900 mb-6">
            {loungeContent.headline}
          </h1>
          <p className="text-neutral-600 leading-relaxed mb-10">
            {loungeContent.blurb}
          </p>

          <h2 className="text-sm font-medium text-neutral-900 uppercase tracking-wider mb-4">
            Interests
          </h2>
          <ul className="flex flex-wrap gap-2">
            {loungeContent.interests.map((interest, i) => (
              <motion.li
                key={interest}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 * i }}
              >
                <span className="inline-block px-3 py-1.5 text-sm text-neutral-600 bg-neutral-100 rounded-full">
                  {interest}
                </span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
