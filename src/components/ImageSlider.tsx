"use client";
/* eslint-disable @next/next/no-img-element */
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import type SwiperType from "swiper";
import { useEffect, useMemo, useState } from "react";
import { Pagination } from "swiper/modules";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageSliderProps {
  urls: string[];
  aspectRatio?: "square" | "video" | "auto";
}

const ImageSlider = ({ urls, aspectRatio = "square" }: ImageSliderProps) => {
  const safeUrls = useMemo(
    () => (Array.isArray(urls) ? urls.filter(Boolean) : []),
    [urls]
  );

  // Get aspect ratio class based on prop
  const getAspectClass = () => {
    switch (aspectRatio) {
      case "video":
        return "aspect-video";
      case "square":
        return "aspect-square";
      case "auto":
        return "h-full w-full";
      default:
        return "aspect-square";
    }
  };
  const normalizeUrl = (u: string) => {
    if (!u) return u;
    const trimmed = u.trim();
    if (
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://") ||
      trimmed.startsWith("data:")
    )
      return trimmed;
    if (trimmed.startsWith("//")) return `https:${trimmed}`;
    if (trimmed.startsWith("/")) return trimmed;
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const bucket = process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_BUCKET;
    if (base) {
      const root = base.replace(/\/$/, "");
      let path = trimmed.replace(/^\/+/, "");
      if (bucket && !path.startsWith(`${bucket}/`)) {
        path = `${bucket}/${path}`;
      }
      return `${root}/storage/v1/object/public/${path}`;
    }
    return `/${trimmed}`;
  };
  const [swiper, setSwiper] = useState<null | SwiperType>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const [slideConfig, setSlideConfig] = useState({
    isBeginning: true,
    isEnd: activeIndex === (safeUrls.length ?? 0) - 1,
  });

  useEffect(() => {
    swiper?.on("slideChange", ({ activeIndex }) => {
      setActiveIndex(activeIndex);
      setSlideConfig({
        isBeginning: activeIndex === 0,
        isEnd: activeIndex === (safeUrls.length ?? 0) - 1,
      });
    });
  }, [swiper, safeUrls]);

  const activeStyles =
    "active:scale-[0.97] grid opacity-100 hover:scale-105 absolute top-1/2 -translate-y-1/2 aspect-square h-8 w-8 z-50 place-items-center rounded-full border-2 bg-white dark:bg-black border-zinc-300";
  const inactiveStyles = "hidden text-gray-400";

  if (safeUrls.length === 0) {
    return (
      <div
        className={`group relative bg-zinc-100 dark:bg-zinc-900 ${getAspectClass()} overflow-hidden rounded-xl grid place-items-center text-xs text-zinc-500 dark:text-zinc-400`}
      >
        No image
      </div>
    );
  }

  return (
    <div
      className={`group relative bg-zinc-100 dark:bg-zinc-900 ${getAspectClass()} overflow-hidden rounded-xl`}
    >
      <div className="absolute z-10 inset-0 opacity-0 group-hover:opacity-100 transition">
        <button
          onClick={(e) => {
            e.preventDefault();
            swiper?.slideNext();
          }}
          className={cn(activeStyles, "right-3 transition cursor-pointer", {
            [inactiveStyles]: slideConfig.isEnd,
            "opacity-100": !slideConfig.isEnd,
          })}
          aria-label="next image"
        >
          <ChevronRight className="h-4 w-4 text-zinc-700 dark:text-zinc-200" />{" "}
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            swiper?.slidePrev();
          }}
          className={cn(activeStyles, "left-3 transition cursor-pointer", {
            [inactiveStyles]: slideConfig.isBeginning,
            "opacity-100": !slideConfig.isBeginning,
          })}
          aria-label="previous image"
        >
          <ChevronLeft className="h-4 w-4 text-zinc-700 dark:text-zinc-200" />{" "}
        </button>
      </div>

      <Swiper
        pagination={{
          renderBullet: (_, className) => {
            return `<span class="rounded-full transition ${className}"></span>`;
          },
        }}
        onSwiper={(swiper) => setSwiper(swiper)}
        spaceBetween={50}
        modules={[Pagination]}
        slidesPerView={1}
        className="h-full w-full"
      >
        {safeUrls.map((url, i) => (
          <SwiperSlide key={i} className="relative h-full w-full">
            <img
              loading="eager"
              className="h-full w-full object-cover object-center"
              src={normalizeUrl(url)}
              alt="Product image"
              referrerPolicy="no-referrer"
              onError={(e) => {
                if (e.currentTarget.src !== "/og-image.png") {
                  e.currentTarget.src = "/og-image.png";
                }
              }}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ImageSlider;
