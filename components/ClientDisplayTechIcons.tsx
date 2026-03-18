"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { cn, getTechLogos } from "@/lib/utils";

export default function ClientDisplayTechIcons({ techStack }: { techStack: string[] }) {
  const [techIcons, setTechIcons] = useState<{ tech: string; url: string }[]>([]);

  useEffect(() => {
    let isMounted = true;
    if (techStack && techStack.length > 0) {
      getTechLogos(techStack).then((logos) => {
        if (isMounted) {
          setTechIcons(logos);
        }
      });
    }
    return () => { isMounted = false; };
  }, [techStack]);

  if (!techIcons || techIcons.length === 0) return null;

  return (
    <div className="flex flex-row">
      {techIcons.slice(0, 3).map(({ tech, url }, index) => (
        <div
          key={tech}
          className={cn(
            "relative group bg-dark-300 rounded-full p-2 flex flex-center",
            index >= 1 && "-ml-3"
          )}
        >
          <span className="tech-tooltip">{tech}</span>

          <Image
            src={url}
            alt={tech}
            width={100}
            height={100}
            className="size-5"
          />
        </div>
      ))}
    </div>
  );
}
