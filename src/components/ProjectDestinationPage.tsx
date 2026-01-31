"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Project } from "@/data/departures";

interface ProjectDestinationPageProps {
  project: Project;
}

const tabs = ["Overview", "Build", "Links"] as const;

export function ProjectDestinationPage({ project }: ProjectDestinationPageProps) {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Overview");

  return (
    <article className="py-12 sm:py-16 px-4">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            href="/departures"
            className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            ← Departures
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="relative aspect-video w-full overflow-hidden rounded-xl bg-neutral-100 mb-8"
        >
          <Image
            src={project.screenshot}
            alt={`Screenshot of ${project.routeName}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 672px"
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA3MCA0OCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNzAiIGhlaWdodD0iNDgiIGZpbGw9IiNlNWU1ZTUiLz48L3N2Zz4="
          />
        </motion.div>

        <motion.header
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <p className="text-xs text-neutral-500 uppercase tracking-wider">
            {project.city}
          </p>
          <h1 className="text-2xl sm:text-3xl font-light text-neutral-900 mt-1">
            {project.routeName}
          </h1>
          <p className="text-neutral-600 mt-2">{project.shortDesc}</p>
        </motion.header>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          <div
            className="flex gap-1 border-b border-neutral-200"
            role="tablist"
            aria-label="Content sections"
          >
            {tabs.map((tab) => (
              <button
                key={tab}
                role="tab"
                aria-selected={activeTab === tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 rounded-t ${
                  activeTab === tab
                    ? "text-neutral-900 border-b-2 border-neutral-900 -mb-px"
                    : "text-neutral-500 hover:text-neutral-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="py-6">
            {activeTab === "Overview" && (
              <div className="text-neutral-600 text-sm leading-relaxed">
                {project.overview}
              </div>
            )}
            {activeTab === "Build" && (
              <div className="text-neutral-600 text-sm leading-relaxed">
                {project.build}
              </div>
            )}
            {activeTab === "Links" && (
              <ul className="space-y-2">
                {project.links.map((link) => (
                  <li key={link.url}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-neutral-900 hover:underline underline-offset-4"
                    >
                      {link.label} →
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </motion.div>
      </div>
    </article>
  );
}
