"use client";

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  Autoplay,
  Keyboard,
  Mousewheel,
  Navigation,
  Pagination,
} from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { getRewards, RewardListItem } from "@/supabase/rpc/client";
import Image from "next/image";

export default function RewardsBanner() {
  const [rewards, setRewards] = useState<RewardListItem[]>([]);

  useEffect(() => {
    (async () => {
      const res = await getRewards({ limit: 12, onlyActive: true });
      if (res.success) setRewards(res.items);
    })();
  }, []);

  if (!rewards.length) return null;

  return (
    <div className="w-full flex justify-center items-center">
      <Swiper
        autoplay={{ delay: 7000, disableOnInteraction: false }}
        direction="horizontal"
        loop
        speed={900}
        watchSlidesProgress
        parallax
        mousewheel={{ forceToAxis: true, releaseOnEdges: false }}
        keyboard={{ enabled: true }}
        modules={[Pagination, Navigation, Autoplay, Mousewheel, Keyboard]}
        scrollbar={{ draggable: true }}
      >
        {rewards.map((r) => {
          const bg =
            r.image_url && r.image_url.length
              ? r.image_url[0]!
              : "/og-image.png";
          return (
            <SwiperSlide key={r.id}>
              <div
                className="relative w-full flex items-center justify-center"
                style={{ aspectRatio: "16/9" }}
              >
                <Image
                  src={bg}
                  alt={r.title}
                  fill
                  className="object-cover"
                  priority
                />

                <div className="relative z-10 bg-white/95 dark:bg-neutral-900/95 shadow-xl ring-1 ring-black/10 dark:ring-white/10 rounded-2xl p-4 sm:p-6 md:p-8 text-center max-w-md w-[90%]">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 line-clamp-2">
                    {r.title}
                  </h3>
                  <p className="mt-2 inline-flex items-center justify-center gap-2 text-sm sm:text-base font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/40 px-3 py-1 rounded-full">
                    <span>{r.price.toLocaleString()}</span>
                    <span>Stardust</span>
                  </p>
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}
