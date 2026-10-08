"use client";

import { useState } from "react";
import { motion } from "motion/react";
import type { IconType } from "react-icons";

import { cn } from "@/lib/utils";

export type DockItem = {
  label: string;
  href: string;
  icon: IconType;
};

type SocialDockProps = {
  items: DockItem[];
  className?: string;
};

export default function SocialDock({ items, className }: SocialDockProps) {
  const [active, setActive] = useState<number | null>(null);

  return (
    <ul
      onMouseLeave={() => setActive(null)}
      className={cn(
        "flex items-center gap-5 rounded-full bg-ink/45 px-6 py-3.5 backdrop-blur-md md:gap-6",
        className
      )}
    >
      {items.map(({ label, href, icon: Icon }, i) => {
        const external = href.startsWith("http");
        const distance = active === null ? null : Math.abs(active - i);
        const scale = distance === 0 ? 1.5 : distance === 1 ? 1.2 : 1;

        return (
          <li key={label}>
            <motion.a
              href={href}
              aria-label={label}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              animate={{ scale, y: distance === 0 ? -4 : 0 }}
              whileTap={{ scale: 0.9 }}
              transition={{
                type: "spring",
                stiffness: 380,
                damping: 22,
                mass: 0.6,
              }}
              className={cn(
                "block origin-bottom text-bone/70 transition-colors duration-300 focus-visible:outline-none",
                distance === 0 && "text-accent"
              )}
            >
              <Icon size={22} />
            </motion.a>
          </li>
        );
      })}
    </ul>
  );
}