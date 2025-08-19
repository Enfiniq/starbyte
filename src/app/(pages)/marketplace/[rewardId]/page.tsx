"use client";

import MaxWidthWrapper from "@/components/shared/MaxWidthWrapper";
import {
  getRewardById,
  purchaseReward,
  type RewardSummary,
  type PurchaseRewardResult,
} from "@/supabase/rpc/client";
import { Check, Shield } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import ProfileButton from "@/components/profile/ProfileButton";
import useStar from "@/hooks/useStar";
import Loader from "@/components/loader";
import {
  resolveDelivery,
  type ResolveResponse,
} from "@/lib/rewards/resolveDelivery";
import { toast } from "sonner";

const BREADCRUMBS = [
  { id: 1, name: "Home", href: "/" },
  { id: 2, name: "Marketplace", href: "/marketplace" },
];

export default function RewardPage() {
  const params = useParams<{ rewardId?: string }>();
  const rewardId = params?.rewardId as string | undefined;
  const { star, loading: starLoading } = useStar();
  const buyerId = star?.id ?? null;
  const [reward, setReward] = useState<RewardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [result, setResult] = useState<PurchaseRewardResult | null>(null);
  const [resolved, setResolved] = useState<ResolveResponse | null>(null);

  const refresh = async () => {
    if (!rewardId) return;
    setLoading(true);
    const res = await getRewardById(rewardId);
    if (!res.success || !res.reward) {
      setError(res.error || "Failed to load reward");
      setReward(null);
    } else {
      setReward(res.reward);
      setError(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rewardId]);

  const outOfStock = useMemo(() => {
    if (!reward) return false;
    return (reward.used_total ?? 0) >= (reward.stock_total ?? 0);
  }, [reward]);

  const onPurchase = async () => {
    if (!buyerId || !rewardId) return;
    setPurchasing(true);
    const res = await purchaseReward(buyerId, rewardId);
    if (!res.success) {
      const msg = res.error || "Failed to purchase";
      setError(msg);
      if (/insufficient/i.test(msg)) toast("Insufficient stardust");
      else toast(msg);
      setPurchasing(false);
      return;
    }
    setResult(res);
    const purchasePayload =
      res.type === "code"
        ? ({
            success: true,
            type: "code",
            data: { code: res.data.code },
            receipt_id: res.receipt_id,
          } as const)
        : res.type === "link"
        ? ({
            success: true,
            type: "link",
            data: { link: res.data.link },
            receipt_id: res.receipt_id,
          } as const)
        : ({
            success: true,
            type: "fetch",
            data: { fetch: res.data.fetch },
            receipt_id: res.receipt_id,
          } as const);

    const resolvedRes = await resolveDelivery({
      purchase: purchasePayload,
      star: {
        starName: star?.starName,
        displayName: star?.displayName,
        email: star?.email,
        avatar: star?.avatar,
        bio: star?.bio,
      },
      reward: reward
        ? {
            id: reward.id,
            title: reward.title,
            description: reward.description,
            image_url: reward.image_url,
            delivery_instructions: reward.delivery_instructions,
            price: reward.price,
          }
        : undefined,
    });
    setResolved(resolvedRes);
    if (resolvedRes.ok) toast("Purchased successfully");
    else toast(resolvedRes.message || "Failed to resolve reward");
    await refresh();
    setPurchasing(false);
  };

  return (
    <MaxWidthWrapper className="bg-white">
      {(loading || starLoading) && <Loader />}
      <div className="bg-white">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:grid lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8">
          <div className="lg:max-w-lg lg:self-end">
            <ol className="flex items-center space-x-2">
              {BREADCRUMBS.map((breadcrumb, i) => (
                <li key={breadcrumb.href}>
                  <div className="flex items-center text-sm">
                    <Link
                      href={breadcrumb.href}
                      className="font-medium text-sm text-muted-foreground hover:text-gray-900"
                    >
                      {breadcrumb.name}
                    </Link>
                    {i !== BREADCRUMBS.length - 1 ? (
                      <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                        className="ml-2 h-5 w-5 flex-shrink-0 text-gray-300"
                      >
                        <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                      </svg>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-4">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                {loading ? "Loading..." : reward?.title ?? "Not found"}
              </h1>
            </div>

            <div className="mt-3">
              <p className="text-base text-muted-foreground">
                {reward?.description}
              </p>
            </div>

            <section className="mt-4">
              <div className="flex items-center">
                <p className="font-medium text-gray-900">
                  {reward ? `${reward.price} Stardust` : "-"}
                </p>

                <div className="ml-4 border-l text-muted-foreground border-gray-300 pl-4">
                  {reward?.type}
                </div>
              </div>

              <div className="mt-2 text-sm text-muted-foreground">
                {reward ? (
                  <span>
                    Used {reward.used_total} / {reward.stock_total}
                  </span>
                ) : null}
              </div>

              {reward && (
                <div className="mt-6 space-y-2">
                  <div className="flex items-center">
                    <Check
                      aria-hidden="true"
                      className={`h-5 w-5 flex-shrink-0 ${
                        reward.is_active ? "text-green-500" : "text-gray-400"
                      }`}
                    />
                    <p className="ml-2 text-sm text-muted-foreground">
                      {reward.is_active ? "Active" : "Inactive"}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <Check
                      aria-hidden="true"
                      className="h-5 w-5 flex-shrink-0 text-green-500"
                    />
                    <p className="ml-2 text-sm text-muted-foreground">
                      {reward.usage_type === "single_use"
                        ? "Single-use"
                        : "Multiple-use"}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <Check
                      aria-hidden="true"
                      className="h-5 w-5 flex-shrink-0 text-green-500"
                    />
                    <p className="ml-2 text-sm text-muted-foreground">
                      {reward.delivery_type === "code"
                        ? "Instant code delivery"
                        : reward.delivery_type === "link"
                        ? "Instant link delivery"
                        : "Delivery via fetch"}
                    </p>
                  </div>
                </div>
              )}

              {error ? (
                <p className="mt-3 text-sm text-red-600">{error}</p>
              ) : null}
            </section>
          </div>

          <div className="mt-10 lg:col-start-2 lg:row-span-2 lg:mt-0 lg:self-center">
            <div className="aspect-square rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center">
              {reward?.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={reward.image_url}
                  alt={reward.title}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="text-muted-foreground">No image</div>
              )}
            </div>
          </div>

          <div className="mt-10 lg:col-start-1 lg:row-start-2 lg:max-w-lg lg:self-start">
            <div>
              <div className="mt-10">
                <ProfileButton
                  title={
                    outOfStock
                      ? "Out of stock"
                      : purchasing
                      ? "Purchasing..."
                      : "Purchase"
                  }
                  onClick={onPurchase}
                  disabled={loading || purchasing || outOfStock || !buyerId}
                  size="md"
                  containerClass="w-full justify-center"
                />
              </div>
              {result && result.success ? (
                <div className="mt-4 rounded-md border p-4 text-sm">
                  <p className="font-medium mb-2">Your reward:</p>
                  {resolved?.ok && resolved.type === "code" && (
                    <div className="flex items-center gap-2">
                      <span>Code:</span>
                      <button
                        onClick={() =>
                          navigator.clipboard.writeText(resolved.code)
                        }
                        className="font-mono underline"
                        title="Click to copy"
                      >
                        {resolved.code}
                      </button>
                    </div>
                  )}
                  {resolved?.ok && resolved.type === "link" && (
                    <div>
                      Link:{" "}
                      <a
                        href={resolved.link}
                        target="_blank"
                        className="text-blue-600 underline break-all"
                        rel="noreferrer"
                      >
                        {resolved.link}
                      </a>
                    </div>
                  )}
                  {resolved?.ok && resolved.type === "fetch" && (
                    <div className="text-muted-foreground">
                      Fetch processed.
                    </div>
                  )}
                </div>
              ) : null}
              <div className="mt-6 text-center">
                <div className="group inline-flex text-sm text-medium">
                  <Shield
                    aria-hidden="true"
                    className="mr-2 h-5 w-5 flex-shrink-0 text-gray-400"
                  />
                  <span className="text-muted-foreground hover:text-gray-700">
                    {reward?.delivery_instructions
                      ? reward.delivery_instructions
                      : reward?.delivery_type === "code" ||
                        reward?.delivery_type === "link"
                      ? "Instant delivery for codes/links"
                      : "Delivery via fetch provider"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MaxWidthWrapper>
  );
}
