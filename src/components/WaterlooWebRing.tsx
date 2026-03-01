"use client";

/**
 * uwaterloo.network webring link.
 * @see https://github.com/Shayaan-Azeem/waterloo.network
 */
const UW_NETWORK_URL = "https://uwaterloo.network";
const LION_ICON = "https://uwaterloo.network/icon.svg";

export function WaterlooWebRing() {
  return (
    <div className="webring-minimal" aria-label="uwaterloo.network">
      <div className="webring-inner">
        <a
          href={UW_NETWORK_URL}
          target="_blank"
          rel="noopener noreferrer"
          title="uwaterloo.network"
          className="webring-icon-link"
        >
          <img
            src={LION_ICON}
            alt="uwaterloo.network"
            width={24}
            height={24}
            className="webring-icon"
          />
        </a>
      </div>
    </div>
  );
}
