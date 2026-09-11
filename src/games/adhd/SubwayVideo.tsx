import { useEffect, useState } from "react";

const BASE = import.meta.env.BASE_URL;

/** Видео геймплея Subway Surfers в углу (muted autoplay loop, вертикальный клип). */
export function SubwayVideo() {
  const [reduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    // при reduced-motion не автоплеить, показать первый кадр
    if (reduced) return;
    const v = document.querySelector<HTMLVideoElement>("[data-subway-video]");
    v?.play().catch(() => {});
  }, [reduced]);

  return (
    <video
      data-subway-video
      src={BASE + "subway.mp4"}
      muted
      loop
      playsInline
      preload="auto"
      autoPlay={!reduced}
      className="block h-[300px] w-[139px] rounded-tds-btn border border-tds-border bg-black object-cover"
      aria-label="Геймплей Subway Surfers"
    />
  );
}
