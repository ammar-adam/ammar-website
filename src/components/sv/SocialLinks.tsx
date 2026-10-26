import { siteConfig } from "@/data/site";
import "./social-links.css";

const icons = [
  { name: "LinkedIn", href: siteConfig.socialLinks.linkedin, path: "M5.2 7.8H1.8V22h3.4V7.8ZM3.5 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM22 13.9c0-4.2-2.2-6.2-5.1-6.2a4.4 4.4 0 0 0-4 2.2V7.8H9.5V22h3.4v-7.5c0-2 .4-3.9 2.8-3.9s2.9 2.2 2.9 4V22H22v-8.1Z" },
  { name: "X", href: siteConfig.socialLinks.x, path: "M18.9 2H22l-6.8 7.8L23.2 22h-6.3L12 14.6 5.5 22H2.3l8.2-9.4L.8 2h6.5l4.5 6.8L18.9 2Zm-1.1 18h1.7L6.4 3.9H4.6L17.8 20Z" },
  { name: "GitHub", href: siteConfig.socialLinks.github, path: "M12 .8a11.2 11.2 0 0 0-3.5 21.8c.6.1.8-.2.8-.5v-2.1c-3.3.7-4-1.4-4-1.4-.5-1.3-1.3-1.6-1.3-1.6-1.1-.8.1-.8.1-.8 1.2.1 1.8 1.2 1.8 1.2 1.1 1.9 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.6 0-1.2.4-2.2 1.2-3-.1-.3-.5-1.5.1-3 0 0 1-.3 3.1 1.2a10.7 10.7 0 0 1 5.7 0c2.1-1.5 3.1-1.2 3.1-1.2.6 1.5.2 2.7.1 3 .8.8 1.2 1.8 1.2 3 0 4.3-2.8 5.3-5.5 5.6.4.4.8 1.1.8 2.2v3.1c0 .3.2.7.8.5A11.2 11.2 0 0 0 12 .8Z" },
];

export function SocialLinks() {
  return <div className="social-icons" role="group" aria-label="Social and contact links">
    {icons.map(icon => <a key={icon.name} href={icon.href} aria-label={icon.name} title={icon.name} target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={icon.path} /></svg></a>)}
    <a href={siteConfig.socialLinks.email} aria-label="Email Ammar" title="Email Ammar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2.5" y="4.5" width="19" height="15" rx="2" /><path d="m3 6 9 7 9-7" /></svg></a>
  </div>;
}
