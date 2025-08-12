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
 * Build authentication headers.
 * IMPORTANT: Make sure process.env.* variables are set in your environment (Vercel).
 * Do NOT include any label text (e.g. "CF-Access-Client-Id: ") in the env var values.
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
 * - attempts to parse JSON only when content-type indicates JSON,
 * - on non-OK or non-JSON responses returns `null` (caller decides),
 * - logs minimal debugging information (no secrets).
 */
async function safeFetch<T = any>(url: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, init);

    // Read raw text first (so we can safely inspect body on error)
    const text = await res.text();

    // If not OK, log snippet and return null
    if (!res.ok) {
      console.error("[safeFetch] non-ok response", {
        url,
        status: res.status,
        statusText: res.statusText,
        // include only first 200 chars of body snippet for debugging
        bodySnippet: text?.slice?.(0, 200),
      });
      return null;
    }

    // Check content-type header to decide whether to parse JSON
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("application/json") && !ct.includes("application/ld+json")) {
      // The endpoint returned HTML or something else — avoid JSON.parse crash
      console.error("[safeFetch] unexpected content-type", { url, contentType: ct, bodySnippet: text?.slice?.(0, 200) });
      return null;
    }

    // parse JSON
    try {
      const parsed = JSON.parse(text);
      return parsed as T;
    } catch (err) {
      console.error("[safeFetch] json parse failed", { url, error: (err as Error).message, bodySnippet: text?.slice?.(0, 200) });
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

  // If the upstream returned an HTML error page or any non-JSON, safeFetch returns null
  if (!data || !Array.isArray(data)) {
    return [];
  }

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

  if (!data || !Array.isArray(data) || data.length === 0) {
    return null;
  }
  return data[0];
}
