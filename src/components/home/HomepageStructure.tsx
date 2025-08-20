"use client";

import BytesRenderer from "@/components/home/BytesRenderer";
import { useCallback, useEffect, useState } from "react";
import { Target, Dumbbell, MonitorPlay } from "lucide-react";
import FilterOptions from "@/components/home/FilterOptions";
import BannerSlide from "@/components/home/BannerSlide";
import {
  getHomepageBytes,
  HomepageBytesData,
  RewardListItem,
} from "@/supabase/rpc/client";
import Loader from "../loader";

export interface FilterOption {
  id: number;
  name: string;
  bgColor: string;
  textColor: string;
  icon: React.ReactNode;
  value: string;
}

export const filterOpts: FilterOption[] = [
  {
    id: 1,
    name: "All",
    bgColor: "#4f7cff",
    textColor: "#FFFFFF",
    icon: <Target className="w-4 h-4" />,
    value: "all",
  },
  {
    id: 2,
    name: "Physical",
    bgColor: "#4f7cff",
    textColor: "#FFFFFF",
    icon: <Dumbbell className="w-4 h-4" />,
    value: "physical",
  },
  {
    id: 3,
    name: "Digital",
    bgColor: "#4f7cff",
    textColor: "#FFFFFF",
    icon: <MonitorPlay className="w-4 h-4" />,
    value: "digital",
  },
];

export default function HomepageStructure() {
  const [categories, setCategories] = useState<string[]>([]);
  const [type, setType] = useState<string>("all");
  const [rewards, setRewards] = useState<RewardListItem[]>([]);
  const [bytesData, setBytesData] = useState<HomepageBytesData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const handleActiveOptionChange = useCallback((value: string) => {
    const index = filterOpts.findIndex((category) => category.value === value);
    if (index !== -1) {
      setType(value);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    (async () => {
      try {
        const bytes = await getHomepageBytes({
          type: type as "all" | "physical" | "digital",
        });
        if (cancelled) return;
        console.log("Bytes", bytes);
        setBytesData(bytes);
        if (bytes?.success && Array.isArray(bytes.rewards))
          setRewards(bytes.rewards);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [type]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <div className="mb-8">
        <BannerSlide rewards={rewards} />
      </div>
      <div className="trending_bx gap-20">
        <FilterOptions
          handleActiveOptionChange={handleActiveOptionChange}
          activeOption={filterOpts.find((opt) => opt.value === type)?.id || 1}
        />
      </div>

      <BytesRenderer
        setCategories={setCategories}
        categories={categories}
        data={bytesData}
      />
    </>
  );
}
