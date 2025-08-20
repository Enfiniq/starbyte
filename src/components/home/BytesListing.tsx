"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ImageSlider from "@/components/ImageSlider";
import { Card, CardContent } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import VerificationBadge from "@/components/shared/VerificationBadge";
import { dateFromNow } from "../../lib/formattedDate";
import type { ByteCard } from "@/supabase/rpc/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { BytesPlaceholder } from "./Placeholders";

interface BytesListingProps {
  url?: string;
  bytes: ByteCard | null;
  index: number;
}

const StatusBadge = ({
  bytes,
  children,
}: {
  bytes: ByteCard;
  children?: React.ReactNode;
}) => {
  const participants = bytes.current_participants ?? 0;
  const stardust = bytes?.stardust_reward ?? 0;
  const createdAt = bytes?.created_at;

  let badgeText = "";

  if (participants >= 20) {
    badgeText = "Hot";
  } else if (stardust >= 100) {
    badgeText = "Rich";
  } else if (createdAt) {
    const isNew =
      new Date(createdAt) > new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
    if (isNew) {
      badgeText = "New";
    }
  }

  if (!badgeText) return null;

  return (
    <div className="top-0 left-0 p-2 absolute z-[2] flex items-center gap-2">
      <span aria-label={`${badgeText} post`} className="block">
        <span className="bg-primary text-white rounded py-[1px] px-1 flex flex-row items-center text-[0.8rem] leading-[1.4rem] font-medium transition-opacity duration-200 opacity-100 group-hover:opacity-0">
          <div className="block">{badgeText}</div>
        </span>
      </span>
      {children}
    </div>
  );
};

const MetaLine = ({ bytes }: { bytes: ByteCard }) => {
  const current = bytes.current_participants ?? 0;
  const max = bytes.max_participants;
  const maxDisplay = typeof max === "number" ? String(max) : "∞";
  return (
    <h6 className="flex flex-row items-center gap-2">
      <span className="text-sm text-[#606060] dark:text-[#9f9f9f]">
        {current} / {maxDisplay} participants
      </span>
      <span className="text-md rounded-full text-[#606060] dark:text-[#9f9f9f]">
        &middot;
      </span>
      <span className="text-sm text-[#606060] dark:text-[#9f9f9f]">
        {bytes?.stardust_reward ?? 0} Stardust
      </span>
      <span className="text-md rounded-full text-[#606060] dark:text-[#9f9f9f]">
        &middot;
      </span>
      <span className="text-sm text-[#606060] dark:text-[#9f9f9f]">
        {bytes?.created_at
          ? dateFromNow(bytes.created_at)?.replace(/^about\s*/i, "")
          : ""}
      </span>
    </h6>
  );
};

function buildChips(): string[] {
  const chips: string[] = [];
  return chips;
}

function buildTexts(bytes?: ByteCard | null): string[] {
  const texts: string[] = [];
  if (!bytes) return texts;
  if (typeof bytes.estimated_duration_minutes === "number")
    texts.push(`~${bytes.estimated_duration_minutes} min`);
  if (typeof bytes.duration_days === "number" && bytes.duration_days > 0)
    texts.push(`${bytes.duration_days} days`);
  const completions =
    typeof bytes.completions_count === "number"
      ? bytes.completions_count
      : null;
  if (typeof completions === "number") texts.push(`${completions} completed`);

  return texts;
}

const ExtraMeta = ({ bytes }: { bytes: ByteCard }) => {
  const chips = buildChips();
  const texts = buildTexts(bytes);
  return (
    <div className="mt-1 flex flex-wrap items-center gap-2">
      {chips.map((c, i) => (
        <span
          key={i}
          className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
        >
          {c}
        </span>
      ))}
      {texts.length > 0 && (
        <span className="text-xs text-[#606060] dark:text-[#9f9f9f]">
          {texts.join(" · ")}
        </span>
      )}
    </div>
  );
};

const BytesListing = ({ url, bytes, index }: BytesListingProps) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, index * 75);

    return () => clearTimeout(timer);
  }, [index]);

  if (!bytes || !isVisible) return <BytesPlaceholder />;

  const validUrls: string[] = Array.isArray(bytes?.preview_image_url)
    ? bytes.preview_image_url.filter(Boolean)
    : bytes?.preview_image_url
    ? [bytes.preview_image_url]
    : [];

  const isActive = bytes.is_active ?? undefined;
  const byteDifficulty = bytes.byte_difficulty ?? undefined;
  const recurrence = bytes.recurrence_type ?? null;
  const customRecurrenceDays = bytes.custom_recurrence_days ?? null;
  const desc = bytes.description ?? undefined;

  const recurrenceDisplay = (() => {
    if (!recurrence) return null;
    if (recurrence === "custom" && customRecurrenceDays) {
      return `Every ${customRecurrenceDays} days`;
    }
    return recurrence;
  })();

  const difficultyBorder = (() => {
    const d = (byteDifficulty || "").toLowerCase();
    switch (d) {
      case "easy":
        return "border-emerald-500";
      case "medium":
        return "border-amber-500";
      case "hard":
        return "border-rose-500";
      case "insane":
      case "extreme":
        return "border-fuchsia-500";
      default:
        return "border-primary";
    }
  })();

  if (isVisible && bytes) {
    return (
      <>
        <Card className="relative group bg-transparent rounded-none shadow-none border-none">
          <Link
            href={url ? url : `/bytes/${bytes?.id}`}
            className="relative group"
            aria-label={bytes?.title}
          >
            <div className="relative w-full aspect-video bg-zinc-100 dark:bg-zinc-900 overflow-hidden rounded-md">
              {validUrls.length > 0 ? (
                <ImageSlider urls={validUrls} aspectRatio="auto" />
              ) : (
                <div className="absolute inset-0 grid place-items-center text-xs text-zinc-500 dark:text-zinc-400">
                  No image
                </div>
              )}
              <div className="z-10 absolute top-2 right-2">
                <span
                  className={`inline-block h-4 w-4 rounded-full border-4 ${difficultyBorder} bg-transparent`}
                  title={
                    isActive === false
                      ? "Inactive"
                      : byteDifficulty
                      ? `Active • ${byteDifficulty}`
                      : "Active"
                  }
                />
              </div>
              {recurrenceDisplay ? (
                <div className="z-10 absolute bottom-2 right-2">
                  <span className="inline-flex items-center gap-2 rounded-full px-2 py-[0.5] text-[10px] sm:text-xs font-normal transition-all uppercase border border-transparent text-white bg-gradient-to-r from-[#4f7cff] to-blue-400">
                    {recurrenceDisplay}
                  </span>
                </div>
              ) : null}

              <StatusBadge bytes={bytes} />
            </div>
          </Link>
          <CardContent className="py-1 px-2">
            <div className="w-full h-full flex flex-row gap-3">
              <Link href={`/star/${bytes?.star_name}`}>
                <Avatar>
                  <AvatarImage
                    src={bytes?.avatar ?? undefined}
                    alt={
                      (bytes?.display_name || bytes?.star_name) + "'s Avatar"
                    }
                  ></AvatarImage>
                  <AvatarFallback>
                    {(bytes?.display_name || bytes?.star_name || "?")
                      .toString()
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div className="w-full flex flex-row">
                <div className="flex justify-center flex-col w-full">
                  <div className="flex items-start justify-between">
                    <h5 className="text-base font-medium line-clamp-2 text-[#0f0f0f] dark:text-[#f0f0f0] pr-2">
                      {bytes?.title}
                    </h5>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 flex-shrink-0 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors cursor-pointer"
                        >
                          <Info className="h-3 w-3 text-[#4f7cff]" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col">
                        <DialogHeader className="flex-shrink-0">
                          <DialogTitle>Challenge Details</DialogTitle>
                          <DialogDescription>
                            More info about requirements and approvals.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex-1 overflow-y-auto pr-2">
                          <Accordion
                            type="multiple"
                            defaultValue={["general", "proof", "instructions"]}
                            className="w-full"
                          >
                            <AccordionItem value="general">
                              <AccordionTrigger>
                                General Information
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-2 text-sm">
                                  <div className="flex items-center justify-between">
                                    <span className="text-zinc-600 dark:text-zinc-300">
                                      Auto-approve
                                    </span>
                                    <span className="font-medium">
                                      {bytes.auto_approve ? "Yes" : "No"}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-zinc-600 dark:text-zinc-300">
                                      Expires
                                    </span>
                                    <span className="font-medium">
                                      {(() => {
                                        if (!bytes?.expires_at) return "Never";
                                        const expiresDate = new Date(
                                          bytes.expires_at
                                        );
                                        const now = new Date();
                                        const diffTime =
                                          expiresDate.getTime() - now.getTime();
                                        const diffDays = Math.ceil(
                                          diffTime / (1000 * 60 * 60 * 24)
                                        );

                                        if (diffDays < 0) return "Expired";
                                        if (diffDays === 0) return "Today";
                                        if (diffDays === 1) return "1 day left";
                                        return `${diffDays} days left`;
                                      })()}
                                    </span>
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="proof">
                              <AccordionTrigger>
                                Proof Requirements
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-2 text-sm">
                                  <div className="flex items-center justify-between">
                                    <span className="text-zinc-600 dark:text-zinc-300">
                                      Requires proof
                                    </span>
                                    <span className="font-medium">
                                      {bytes.requires_proof ? "Yes" : "No"}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-zinc-600 dark:text-zinc-300">
                                      Required proofs
                                    </span>
                                    <span className="font-medium">
                                      {bytes?.required_proofs_count ?? 0}
                                    </span>
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="instructions">
                              <AccordionTrigger>
                                Proof Instructions
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="text-sm">
                                  <div className="whitespace-pre-wrap">
                                    {bytes.proof_instructions || "—"}
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  {desc ? (
                    <p className="mt-1 text-sm text-muted-foreground dark:text-zinc-300 leading-snug line-clamp-2">
                      {desc}
                    </p>
                  ) : null}
                  <h5 className="mt-1 text-sm line-clamp-1 text-[#606060] dark:text-[#9f9f9f]">
                    <VerificationBadge
                      star={{
                        starName: bytes?.star_name,
                        displayName: bytes?.display_name ?? undefined,
                        level: bytes?.level ?? 0,
                        isPremium: bytes?.is_premium ?? false,
                      }}
                      size="14px"
                      sizeOfLogo={10}
                      tooltip={true}
                    />
                  </h5>
                  <div>
                    <MetaLine bytes={bytes} />
                    <ExtraMeta bytes={bytes} />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }
};

export default BytesListing;
