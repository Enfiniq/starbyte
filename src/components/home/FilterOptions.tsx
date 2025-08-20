import React from "react";
import { cn } from "@/lib/utils";
import { filterOpts } from "./HomepageStructure";

export function FilterOptions({
  handleActiveOptionChange,
  activeOption,
}: {
  handleActiveOptionChange: (value: string) => void;
  activeOption: number;
}) {
  return (
    <>
      <nav className="relative max-sm:w-full flex gap-5 py-2 z-30">
        {filterOpts.map((nav) => (
          <button
            key={nav.id}
            onClick={() => handleActiveOptionChange(nav?.value)}
            className={cn(
              "flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-all duration-500"
            )}
            style={{
              backgroundColor: activeOption === nav.id ? nav.bgColor : "",
              color: activeOption === nav.id ? nav.textColor : nav.bgColor,
            }}
          >
            {nav.icon}
            <span
              className="text-gray-800 dark:text-gray-300"
              style={{
                color: activeOption === nav.id ? nav.textColor : "",
              }}
            >
              {nav.name}
            </span>
          </button>
        ))}
      </nav>
    </>
  );
}

export default FilterOptions;
