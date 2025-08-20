"use client";
import React, { Dispatch, SetStateAction } from "react";
import BytesListing from "@/components/home/BytesListing";
import { HomepageBytesData, ByteCard } from "@/supabase/rpc/client";
import "swiper/css";

type BytesHomepageProps = {
  setCategories: Dispatch<SetStateAction<string[]>>;
  categories: string[];
  data?: HomepageBytesData | null;
};

const BytesHomepage: React.FC<BytesHomepageProps> = ({ data }) => {
  return (
    <div className="bytes-homepage">
      {!data?.success ? null : (
        <>
          {data.bytes && data.bytes.length > 0 && (
            <section className="py-8">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {data.bytes.map((bytes: ByteCard, i: number) => (
                  <BytesListing
                    key={`mixed-${bytes.id}-${i}`}
                    bytes={bytes}
                    index={i}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default BytesHomepage;
