"use client";

import { useContext } from "react";
import { StarContext } from "@/context/StarContext";

const useStar = () => {
  const context = useContext(StarContext);
  if (!context) {
    throw new Error("useStar must be used within a StarProvider");
  }
  return context;
};

export default useStar;
