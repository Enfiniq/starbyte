"use client";

import { StarProvider } from "@/context/StarContext";
import { SessionProvider as _SessionProvider } from "next-auth/react";

export default function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <_SessionProvider>
      <StarProvider>{children}</StarProvider>
    </_SessionProvider>
  );
}
