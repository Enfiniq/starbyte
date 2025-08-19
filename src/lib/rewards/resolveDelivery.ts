export type ResolveResponse =
  | { ok: true; type: "code"; code: string }
  | { ok: true; type: "link"; link: string }
  | { ok: true; type: "fetch"; message?: string }
  | { ok: false; message: string };

export async function resolveDelivery(payload: {
  purchase:
    | ({ success: true; type: "code"; data: { code: string } } & {
        receipt_id?: string;
      })
    | ({ success: true; type: "link"; data: { link: string } } & {
        receipt_id?: string;
      })
    | ({ success: true; type: "fetch"; data: { fetch: unknown } } & {
        receipt_id?: string;
      });
  star: {
    starName?: string | null;
    displayName?: string | null;
    email?: string | null;
    avatar?: string | null;
    bio?: string | null;
  };
  reward?: {
    id: string;
    title: string;
    description?: string | null;
    image_url?: string[] | null;
    delivery_instructions?: string | null;
    price?: number;
  };
}): Promise<ResolveResponse> {
  const res = await fetch("/api/rewards/resolve", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return (await res.json()) as ResolveResponse;
}
