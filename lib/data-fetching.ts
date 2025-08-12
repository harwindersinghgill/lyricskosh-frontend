// lib/data-fetching.ts
import "server-only";

/**
 * Edge-friendly base64 encoder (uses btoa in browser/edge, Buffer in Node).
 */
const encodeBase64 = (input: string): string => {
  if (typeof btoa !== "undefined") return btoa(input);
  if (typeof Buffer !== "undefined") return Buffer.from(input).toString("base64");
  throw new Error("No base64 encoder available in this runtime");
};

/**
 * Build headers for fetch requests.
 * NOTE: this function does not reveal secrets anywhere.
 */
function buildHeaders() {
  const WP_USER = process.env.WP_USER ?? "";
  const WP_PASSWORD = process.env.WP_PASSWORD ?? "";

  const basicAuth =
    WP_USER || WP_PASSWORD ? `Basic ${encodeBase64(`${WP_USER}:${WP_PASSWORD}`)}` : "";

  return {
    Authorization: basicAuth,
    "Content-Type": "application/json",
  } as Record<string, string>;
}

/**
 * Safe fetch that:
 * - reads text first so we can inspect non-JSON responses,
 * - only tries to parse JSON if content-type looks like JSON,
 * - returns null on non-OK or non-JSON responses (caller handles null),
 * - logs minimal debugging information (no secrets).
 */
async function safeFetch<T = any>(url: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, init);
    const text = await res.text();

    if (!res.ok) {
      console.error("[safeFetch] non-ok response", {
        url,
        status: res.status,
        statusText: res.statusText,
        bodySnippet: text?.slice?.(0, 200),
      });
      return null;
    }

    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("application/json") && !ct.includes("application/ld+json")) {
      console.error("[safeFetch] unexpected content-type", {
        url,
        contentType: ct,
        bodySnippet: text?.slice?.(0, 200),
      });
      return null;
    }

    try {
      const parsed = JSON.parse(text);
      return parsed as T;
    } catch (err) {
      console.error("[safeFetch] json parse failed", {
        url,
        error: (err as Error).message,
        bodySnippet: text?.slice?.(0, 200),
      });
      return null;
    }
  } catch (err) {
    console.error("[safeFetch] fetch failed", { url, error: (err as Error).message });
    return null;
  }
}

/**
 * Post type
 */
export type Post = {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  slug: string;
};

/**
 * Fetch all posts for homepage.
 * Returns an empty array on error so prerender won't fail.
 */
export async function getAllPosts(): Promise<Post[]> {
  const base = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;
  if (!base) {
    console.error("[getAllPosts] missing NEXT_PUBLIC_WORDPRESS_API_URL env var");
    return [];
  }

  const url = `${base.replace(/\/$/, "")}/wp/v2/posts?_fields=id,title,slug`;
  const headers = buildHeaders();
  const data = await safeFetch<Post[]>(url, { headers, next: { revalidate: 3600 } });

  if (!data || !Array.isArray(data)) return [];
  return data;
}

/**
 * Fetch single post by slug. Returns Post | null.
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  const base = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;
  if (!base) {
    console.error("[getPostBySlug] missing NEXT_PUBLIC_WORDPRESS_API_URL env var");
    return null;
  }

  const url = `${base.replace(/\/$/, "")}/wp/v2/posts?_fields=id,title,content&slug=${encodeURIComponent(slug)}`;
  const headers = buildHeaders();
  const data = await safeFetch<Post[]>(url, { headers, cache: "no-store" });

  if (!data || !Array.isArray(data) || data.length === 0) return null;
  return data[0];
}

/**
 * Debug helper used by the /api/_debug route.
 * Returns safe information (no secret values) about env presence and a test fetch result.
 */
export async function debugFetchPosts() {
  const base = process.env.NEXT_PUBLIC_WORDPRESS_API_URL ?? null;
  const envPresence = {
    NEXT_PUBLIC_WORDPRESS_API_URL: !!process.env.NEXT_PUBLIC_WORDPRESS_API_URL,
    WP_USER: !!process.env.WP_USER,
    WP_PASSWORD: !!process.env.WP_PASSWORD,
  };

  if (!base) {
    return { envPresence, error: "NEXT_PUBLIC_WORDPRESS_API_URL not set" };
  }

  const url = `${base.replace(/\/$/, "")}/wp/v2/posts?_fields=id,title,slug`;
  const headers = buildHeaders();

  try {
    const res = await fetch(url, { headers });
    const text = await res.text();
    const contentType = res.headers.get("content-type") ?? "";

    // Return safe, non-secret debug info
    return {
      envPresence,
      request: { url, headersSent: { Authorization: !!headers.Authorization, contentTypeRequested: headers["Content-Type"] } },
      response: {
        status: res.status,
        statusText: res.statusText,
        contentType,
        bodySnippet: text?.slice?.(0, 1000) ?? null, // first 1000 chars for debugging
      },
    };
  } catch (err) {
    return { envPresence, error: (err as Error).message };
  }
}
