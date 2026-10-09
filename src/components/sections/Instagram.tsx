"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    instgrm?: {
      Embeds?: {
        process: () => void;
      };
    };
  }
}

/* Posts to feature - 3 max */
const posts = [
  "https://www.instagram.com/p/DXQmYEtDxLd/",
  "https://www.instagram.com/p/DdhxO6wAXOu/",
  "https://www.instagram.com/p/DbnEpcfMnu3/",
] as const;

export default function Instagram() {
  const [ready, setReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const SCRIPT_SRC = "https://www.instagram.com/embed.js";

    const process = () => {
      window.instgrm?.Embeds?.process();
      setReady(true);
    };

    if (window.instgrm?.Embeds?.process) {
      process();
      return;
    }

    let script = document.querySelector<HTMLScriptElement>(
      `script[src="${SCRIPT_SRC}"]`
    );

    if (!script) {
      script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }

    script.addEventListener("load", process);

    return () => {
      script?.removeEventListener("load", process);
    };
  }, []);

  return (
    <section
      id="instagram"
      aria-labelledby="instagram-heading"
      className="relative bg-ink py-16 text-bone md:py-24"
    >
      <div className="mx-auto w-full max-w-350 px-5 md:px-10">
        {/* Header */}
        <div className="flex flex-col items-start gap-3">
          <span className="inline-block rounded-full bg-bone px-5 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-ink">
            Instagram
          </span>
          <h2
            id="instagram-heading"
            className="text-[clamp(2.5rem,7vw,5rem)] leading-none text-bone"
          >
            Follow the <span className="text-accent">journey.</span>
          </h2>
        </div>

        {/* Posts */}
        <div
          ref={containerRef}
          className="mt-12 grid grid-cols-1 gap-6 md:mt-16 md:grid-cols-3 md:gap-6"
        >
          {posts.map((url, i) => (
            <div
              key={url}
              className={[
                "relative overflow-hidden rounded-3xl border border-bone/10 bg-bone/5",
                // Clip the empty space below the embed
                "h-[32rem] md:h-[34rem]",
                // Only card 1 on mobile, all three on desktop
                i > 0 ? "hidden md:block" : "",
              ].join(" ")}
            >
              {!ready && (
                <div className="absolute inset-0 animate-pulse bg-bone/5" />
              )}

              <blockquote
                className="instagram-media"
                data-instgrm-permalink={`${url}?utm_source=ig_embed&utm_campaign=loading`}
                data-instgrm-version="14"
                data-instgrm-captioned="true"
                style={{
                  background: "transparent",
                  border: 0,
                  borderRadius: 0,
                  boxShadow: "none",
                  margin: 0,
                  maxWidth: "100%",
                  minWidth: "auto",
                  padding: 0,
                  width: "100%",
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Global overrides - remove Instagram's outer chrome and clip the whitespace */}
      <style jsx global>{`
        .instagram-media {
          min-width: 0 !important;
          max-width: 100% !important;
          width: 100% !important;
          margin: 0 !important;
        }

        .instagram-media iframe {
          width: 100% !important;
          min-width: 0 !important;
          max-width: 100% !important;
          border-radius: 12px !important;
          overflow: hidden !important;
        }
      `}</style>
    </section>
  );
}