import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/sendEmail";

type FetchInfo =
  | string
  | {
      url: string;
      method?: string;
      headers?: Record<string, string>;
    };

type PurchaseRewardResult =
  | { success: true; type: "code"; data: { code: string }; receipt_id?: string }
  | { success: true; type: "link"; data: { link: string }; receipt_id?: string }
  | {
      success: true;
      type: "fetch";
      data: { fetch: FetchInfo };
      receipt_id?: string;
    }
  | { success: false; error?: string };

type StarLite = {
  starName?: string | null;
  displayName?: string | null;
  email?: string | null;
  avatar?: string | null;
  bio?: string | null;
};

type Resolved =
  | { ok: true; type: "code"; code: string }
  | { ok: true; type: "link"; link: string }
  | { ok: true; type: "fetch"; message?: string }
  | { ok: false; message: string };

async function resolveFetch(
  fetchInfo: FetchInfo,
  star: StarLite
): Promise<Resolved> {
  try {
    const url: string =
      typeof fetchInfo === "string" ? fetchInfo : fetchInfo.url || "";
    if (!url) return { ok: false, message: "No fetch URL provided" };

    const method: string =
      typeof fetchInfo === "string"
        ? "POST"
        : (fetchInfo.method || "POST").toUpperCase();
    const headers: Record<string, string> =
      typeof fetchInfo === "string"
        ? { "Content-Type": "application/json" }
        : { "Content-Type": "application/json", ...(fetchInfo.headers || {}) };
    const payload = {
      starName: star.starName ?? star.displayName ?? null,
      email: star.email ?? null,
      avatar: star.avatar ?? null,
      bio: star.bio ?? null,
    };

    const resp = await fetch(url, {
      method,
      headers,
      body: method === "GET" ? undefined : JSON.stringify(payload),
    });

    const data = await resp
      .json()
      .catch(() => ({ ok: resp.ok, status: resp.status }));

    const link = data?.data?.link ?? data?.link;
    const code = data?.data?.code ?? data?.code;
    if (typeof code === "string" && code.length) {
      return { ok: true, type: "code", code };
    }
    if (typeof link === "string" && link.length) {
      return { ok: true, type: "link", link };
    }
    return { ok: true, type: "fetch", message: "Fetch processed" };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Fetch failed";
    return { ok: false, message: msg };
  }
}

async function buildResolved(
  purchase: PurchaseRewardResult,
  star: StarLite
): Promise<Resolved> {
  if (!purchase.success)
    return { ok: false, message: purchase.error || "Invalid purchase" };
  if (purchase.type === "code")
    return { ok: true, type: "code", code: purchase.data.code };
  if (purchase.type === "link")
    return { ok: true, type: "link", link: purchase.data.link };
  return resolveFetch(purchase.data.fetch, star);
}

export async function POST(req: Request) {
  try {
    const { purchase, star, reward } = (await req.json()) as {
      purchase: PurchaseRewardResult;
      star: StarLite;
      reward?: {
        id: string;
        title: string;
        description?: string | null;
        image_url?: string | null;
        delivery_instructions?: string | null;
        price?: number;
      };
    };

    if (!purchase?.success)
      return NextResponse.json(
        { ok: false, message: purchase?.error || "Invalid purchase" },
        { status: 400 }
      );

    const resolved = await buildResolved(purchase, star);

    if (!resolved.ok) return NextResponse.json(resolved, { status: 500 });

    if (star?.email && purchase.success) {
      const detail =
        resolved.ok && resolved.type === "code"
          ? { code: resolved.code }
          : resolved.ok && resolved.type === "link"
          ? { link: resolved.link }
          : undefined;

      await sendEmail(
        star.email,
        star.displayName ?? star.starName ?? undefined,
        undefined,
        "purchased",
        {
          purchase: {
            orderId: purchase.receipt_id ?? "",
            total: reward?.price ?? 0,
            products: [
              {
                title: reward?.title || "Reward",
                description: reward?.description || null,
                price: reward?.price ?? 0,
                image_url: reward?.image_url || null,
                delivery_instructions: reward?.delivery_instructions || null,
                reward_detail: detail,
              },
            ],
          },
        }
      );
    }

    return NextResponse.json(resolved, { status: 200 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to resolve purchase";
    return NextResponse.json({ ok: false, message: msg }, { status: 500 });
  }
}
