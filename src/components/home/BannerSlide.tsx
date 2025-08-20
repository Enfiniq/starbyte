"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/scrollbar";
import {
  Pagination,
  Navigation,
  Autoplay,
  Mousewheel,
  Keyboard,
  Scrollbar,
} from "swiper/modules";
import Image from "next/image";
import Link from "next/link";
import type { RewardListItem } from "@/supabase/rpc/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star as StarIcon } from "lucide-react";
// import { RiVercelFill } from "react-icons/ri";

type BannerSlideProps = { rewards: RewardListItem[] };

function BannerSlide({ rewards }: BannerSlideProps) {
  const normalizeUrl = (u?: string | null) => {
    if (!u) return undefined;
    const trimmed = u.trim();
    if (!trimmed) return undefined;
    if (
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://") ||
      trimmed.startsWith("data:")
    )
      return trimmed;
    if (trimmed.startsWith("//")) return `https:${trimmed}`;
    if (trimmed.startsWith("/")) return trimmed; // served by our app/public
    // Assume supabase storage key; build a public URL
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const bucket = process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_BUCKET;
    if (base) {
      const root = base.replace(/\/$/, "");
      let path = trimmed.replace(/^\/+/, "");
      if (bucket && !path.startsWith(`${bucket}/`)) path = `${bucket}/${path}`;
      return `${root}/storage/v1/object/public/${path}`;
    }
    return undefined;
  };
  const count = Array.isArray(rewards) ? rewards.length : 0;
  return (
    <>
      <div className="w-full flex justify-center items-center">
        <Swiper
          className={`banner-swiper w-full slides-1`}
          style={{ width: "100%" }}
          key={`rewards-${Array.isArray(rewards) ? rewards.length : 0}`}
          autoplay={{
            delay: 8000,
            disableOnInteraction: false,
          }}
          direction="horizontal"
          loop={count > 1}
          speed={1200}
          slidesPerView={1}
          centeredSlides={false}
          spaceBetween={0}
          breakpoints={{
            0: { slidesPerView: 1, centeredSlides: false, spaceBetween: 0 },
            1000: { slidesPerView: 1, centeredSlides: false, spaceBetween: 0 },
          }}
          mousewheel={{
            forceToAxis: true,
            releaseOnEdges: false,
          }}
          // navigation={true}
          keyboard={{
            enabled: true,
          }}
          pagination={{ clickable: true }}
          scrollbar={{ draggable: true }}
          modules={[
            Pagination,
            Navigation,
            Autoplay,
            Mousewheel,
            Keyboard,
            Scrollbar,
          ]}
        >
          {Array.isArray(rewards) && rewards.length > 0 ? (
            rewards.map((reward, index) => {
              type DisplayReward = RewardListItem & {
                description?: string | null;
                type?: string | null;
                delivery_type?: string | null;
                delivery_data?: Array<{
                  stock?: number | null;
                  used?: number | null;
                } | null> | null;
                lister_avatar_url?: string | null;
                lister_display_name?: string | null;
                lister_star_name?: string | null;
                is_active?: boolean | null;
              };
              const r = reward as DisplayReward;
              const src =
                normalizeUrl(
                  Array.isArray(r.image_url) ? r.image_url?.[0] : undefined
                ) || "/og-image.png";
              const totals = (r.delivery_data ?? []).reduce<{
                stock: number;
                used: number;
              }>(
                (acc, entry) => {
                  if (!entry) return acc;
                  acc.stock += Math.max(0, entry.stock ?? 0);
                  acc.used += Math.max(0, entry.used ?? 0);
                  return acc;
                },
                { stock: 0, used: 0 }
              );
              return (
                <SwiperSlide key={`${reward.title}-${reward.id}-${index}`}>
                  <div className="banner-card w-full overflow-hidden rounded-xl ring-1 ring-black/5 dark:ring-white/10 bg-white dark:bg-zinc-900">
                    <div className="flex flex-col min-[1000px]:flex-row h-full">
                      <Link
                        href={`/marketplace/${r.id}`}
                        className="relative w-full min-[1000px]:w-1/2 bg-zinc-100 dark:bg-zinc-900"
                        aria-label={r.title}
                      >
                        <div className="relative w-full aspect-[16/9]">
                          <Image
                            src={src}
                            alt={r.title}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                          <div className="absolute top-3 right-3 sm:top-4 sm:right-5">
                            <span
                              className={`inline-block h-4 w-4 rounded-full border-4 ${
                                r.is_active
                                  ? "border-primary"
                                  : "border-zinc-400 dark:border-zinc-600"
                              } bg-transparent`}
                              title={r.is_active ? "Active" : "Inactive"}
                            />
                          </div>
                          {r.delivery_type ? (
                            <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-5">
                              <span className="inline-flex items-center gap-2 rounded-full px-2 py-[0.5] text-[10px] sm:text-xs font-normal transition-all uppercase border border-transparent text-white bg-gradient-to-r from-[#4f7cff] to-blue-400">
                                {r.delivery_type}
                              </span>
                            </div>
                          ) : null}
                        </div>
                      </Link>
                      <div className="w-full min-[1000px]:w-1/2 p-4 sm:p-6 pr-8 min-[1000px]:pr-12 pb-4 flex flex-col gap-3">
                        <div className="flex items-start gap-3">
                          <Link href={`/star/${r.lister_star_name ?? ""}`}>
                            <Avatar className="h-11 w-11 sm:h-12 sm:w-12">
                              <AvatarImage
                                src={r.lister_avatar_url ?? undefined}
                                alt={
                                  r.lister_display_name ??
                                  r.lister_star_name ??
                                  "Lister"
                                }
                              />
                              <AvatarFallback>
                                {(
                                  r.lister_display_name ||
                                  r.lister_star_name ||
                                  r.title ||
                                  "?"
                                )
                                  .slice(0, 1)
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          </Link>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="font-medium leading-tight text-zinc-900 dark:text-zinc-100 line-clamp-1">
                                  {r.lister_display_name ??
                                    r.lister_star_name ??
                                    "Lister"}
                                </p>
                                {r.lister_display_name || r.lister_star_name ? (
                                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                                    @
                                    {r.lister_star_name ??
                                      r.lister_display_name}
                                  </p>
                                ) : null}
                              </div>
                              <span className="shrink-0 font-medium inline-flex items-center gap-1 text-zinc-900 dark:text-zinc-100 pr-3 sm:pr-4">
                                <StarIcon
                                  className="h-4 w-4 text-primary"
                                  aria-hidden="true"
                                />
                                {r.price.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2">
                          {r.title}
                        </h3>
                        {r.description ? (
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {r.description}
                          </p>
                        ) : null}
                        <div className="mt-auto flex items-center justify-between pt-1">
                          <div className="flex items-center gap-2">
                            {r.type ? (
                              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] sm:text-xs font-normal border border-[#4f7cff] text-[#4f7cff] bg-[#4f7cff]/5 uppercase dark:border-[#6f8cff] dark:text-[#9bb0ff] dark:bg-[#6f8cff]/10">
                                {r.type}
                              </span>
                            ) : null}
                          </div>
                          <span className="text-xs text-muted-foreground mr-3 sm:mr-4">
                            Used {totals.used} / {totals.stock}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })
          ) : null}
        </Swiper>
        <style jsx global>{`
          .banner-swiper .swiper-slide {
            transition: transform 300ms ease;
          }
          .banner-swiper .swiper-slide .banner-card {
            transform: scale(0.94);
            transition: transform 300ms ease;
          }
          .banner-swiper .swiper-slide-active .banner-card {
            transform: scale(1.05);
          }
          /* Always use full width for a single visible slide */
          .banner-swiper.slides-1 .swiper-wrapper {
            justify-content: stretch;
          }
          .banner-swiper.slides-1 .swiper-slide {
            width: 100% !important;
          }
        `}</style>
      </div>
    </>
  );
}

export default BannerSlide;
