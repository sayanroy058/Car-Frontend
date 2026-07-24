import { useEffect } from "react";

interface SeoMeta {
  title: string;
  description?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
}

const BASE_TITLE = "DriveHub — Premium Used Cars, Inspected & Refurbished";
const BASE_DESCRIPTION =
  "Buy and sell certified pre-owned cars. 200-point inspection, refurbished by experts, financing in minutes.";

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export function setMeta(meta: SeoMeta) {
  if (typeof document === "undefined") return;
  document.title = meta.title;
  const desc = meta.description ?? BASE_DESCRIPTION;
  upsertMeta("name", "description", desc);
  upsertMeta("property", "og:title", meta.ogTitle ?? meta.title);
  upsertMeta("property", "og:description", meta.ogDescription ?? desc);
  upsertMeta("name", "twitter:title", meta.ogTitle ?? meta.title);
  upsertMeta("name", "twitter:description", meta.ogDescription ?? desc);
  if (meta.canonical) upsertCanonical(meta.canonical);
}

export function resetMeta() {
  setMeta({ title: BASE_TITLE, description: BASE_DESCRIPTION });
}

export function Seo({ title, description, canonical, ogTitle, ogDescription }: SeoMeta) {
  useEffect(() => {
    setMeta({ title, description, canonical, ogTitle, ogDescription });
    return () => {
      setMeta({ title: BASE_TITLE, description: BASE_DESCRIPTION });
    };
  }, [title, description, canonical, ogTitle, ogDescription]);
  return null;
}
