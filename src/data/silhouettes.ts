/**
 * Background silhouette images from /pictures folder.
 * Update paths to match your actual filenames.
 */

const pics = (name: string) => `/pictures/${encodeURIComponent(name)}`;

export const silhouetteImages = {
  checkin: [pics("WhatsApp Image 2026-02-01 at 2.29.58 PM (1).jpeg"), pics("WhatsApp Image 2026-02-01 at 2.29.58 PM (2).jpeg")],
  terminal: [pics("WhatsApp Image 2026-02-01 at 2.29.58 PM (3).jpeg"), pics("WhatsApp Image 2026-02-01 at 2.29.59 PM (1).jpeg")],
  departures: [pics("WhatsApp Image 2026-02-01 at 2.29.59 PM (10).jpeg"), pics("WhatsApp Image 2026-02-01 at 2.29.59 PM (11).jpeg")],
  arrivals: [pics("WhatsApp Image 2026-02-01 at 2.29.59 PM (12).jpeg"), pics("WhatsApp Image 2026-02-01 at 2.29.59 PM (13).jpeg")],
  lounge: [
    pics("WhatsApp Image 2026-02-01 at 2.29.59 PM (14).jpeg"),
    pics("WhatsApp Image 2026-02-01 at 2.29.59 PM (15).jpeg"),
    pics("WhatsApp Image 2026-02-01 at 2.29.59 PM (16).jpeg"),
  ],
} as const;
