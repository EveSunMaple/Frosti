import type { CollectionEntry } from "astro:content";
import { getCollection } from "astro:content";
import fs from "node:fs";
import { SITE_TAB, USER_AVATAR, USER_NAME } from "@config";
import type { APIContext, GetStaticPaths } from "astro";
import satori from "satori";

import sharp from "sharp";

type Weight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
type FontStyle = "normal" | "italic";
interface FontOptions {
  data: Buffer | ArrayBuffer;
  name: string;
  weight?: Weight;
  style?: FontStyle;
  lang?: string;
}
export const prerender = true;

type FontCache = { regular: Buffer | null; bold: Buffer | null };
type OgFonts = FontOptions[];

export const getStaticPaths: GetStaticPaths = async () => {
  const allPosts = await getCollection("blog");
  const publishedPosts = allPosts.filter(
    (post: CollectionEntry<"blog">) => !post.data.draft,
  );

  return publishedPosts.map((post: CollectionEntry<"blog">) => ({
    params: { slug: post.slug },
    props: { post },
  }));
};

let fontCache: FontCache | null = null;
let fontCachePromise: Promise<FontCache> | null = null;

function validateSlug(slug: unknown): slug is string {
  if (typeof slug !== "string") return false;
  if (slug.length === 0 || slug.length > 200) return false;
  if (slug.includes("..") || slug.includes("\\")) return false;
  if (slug.startsWith("/")) return false;
  return /^[a-z0-9\-/]+$/i.test(slug);
}

function createTimeoutSignal(timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  return { signal: controller.signal, clear: () => clearTimeout(timeout) };
}

async function fetchWithTimeout(input: RequestInfo | URL, timeoutMs: number) {
  const { signal, clear } = createTimeoutSignal(timeoutMs);
  try {
    return await fetch(input, { signal });
  } finally {
    clear();
  }
}

async function buildAvatarDataUri(): Promise<string> {
  const avatarBuffer = await fs.promises.readFile(`./public/${USER_AVATAR}`);
  return `data:image/png;base64,${avatarBuffer.toString("base64")}`;
}

function buildFonts(
  fontRegular: Buffer | null,
  fontBold: Buffer | null,
): OgFonts {
  const fonts: FontOptions[] = [];
  if (fontRegular) {
    fonts.push({
      name: "Noto Sans SC",
      data: fontRegular,
      weight: 400,
      style: "normal",
    });
  }
  if (fontBold) {
    fonts.push({
      name: "Noto Sans SC",
      data: fontBold,
      weight: 700,
      style: "normal",
    });
  }
  return fonts;
}

function buildOgTemplate({
  post,
  avatarBase64,
}: {
  post: CollectionEntry<"blog">;
  avatarBase64: string;
}) {
  const primaryColor = "#4F46E5";
  const textColor = "#1E293B";
  const subtleTextColor = "#64748B";
  const backgroundColor = "#FFFFFF";

  const pubDate = post.data.pubDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const description = post.data.description;

  return {
    type: "div",
    props: {
      style: {
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor,
        fontFamily:
          '"Noto Sans SC", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        padding: "60px",
        paddingTop: "60px",
        paddingBottom: "80px",
      },
      children: [
        {
          type: "div",
          props: {
            style: {
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "20px",
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    fontSize: "36px",
                    fontWeight: 600,
                    color: subtleTextColor,
                  },
                  children: SITE_TAB,
                },
              },
            ],
          },
        },
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              flexGrow: 1,
              gap: "20px",
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    alignItems: "flex-start",
                  },
                  children: [
                    {
                      type: "div",
                      props: {
                        style: {
                          width: "10px",
                          height: "68px",
                          backgroundColor: primaryColor,
                          borderRadius: "6px",
                          marginTop: "14px",
                        },
                      },
                    },
                    {
                      type: "div",
                      props: {
                        style: {
                          fontSize: "72px",
                          fontWeight: 700,
                          lineHeight: 1.2,
                          color: textColor,
                          marginLeft: "25px",
                          display: "-webkit-box",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          lineClamp: 3,
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                        },
                        children: post.data.title,
                      },
                    },
                  ],
                },
              },
              description && {
                type: "div",
                props: {
                  style: {
                    fontSize: "32px",
                    lineHeight: 1.5,
                    color: subtleTextColor,
                    paddingLeft: "35px",
                    display: "-webkit-box",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    lineClamp: 2,
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  },
                  children: description,
                },
              },
            ],
          },
        },
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    gap: "20px",
                  },
                  children: [
                    {
                      type: "img",
                      props: {
                        src: avatarBase64,
                        width: 60,
                        height: 60,
                        style: { borderRadius: "50%" },
                      },
                    },
                    {
                      type: "div",
                      props: {
                        style: {
                          fontSize: "28px",
                          fontWeight: 600,
                          color: textColor,
                        },
                        children: USER_NAME,
                      },
                    },
                  ],
                },
              },
              {
                type: "div",
                props: {
                  style: { fontSize: "28px", color: subtleTextColor },
                  children: pubDate,
                },
              },
            ],
          },
        },
      ],
    },
  };
}

async function generateOgPng({
  template,
  fonts,
}: {
  template: any;
  fonts: OgFonts;
}): Promise<Buffer> {
  const svg = await satori(template, {
    width: 1200,
    height: 630,
    fonts,
  });
  return await sharp(Buffer.from(svg)).png().toBuffer();
}

async function generateFallbackPng(): Promise<Buffer> {
  return await sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .png()
    .toBuffer();
}

async function fetchNotoSansSCFonts(): Promise<FontCache> {
  if (fontCache) return fontCache;
  if (fontCachePromise) return await fontCachePromise;

  fontCachePromise = (async () => {
    try {
      const cssResp = await fetchWithTimeout(
        "https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700&display=swap",
        5000,
      );
      if (!cssResp.ok) throw new Error("Failed to fetch Google Fonts CSS");
      const cssText = await cssResp.text();

      const getUrlForWeight = (weight: number) => {
        const blockRe = new RegExp(
          String.raw`@font-face\s*{[^}]*font-weight:\s*${weight}[^}]*}`,
          "g",
        );
        const match = blockRe.exec(cssText);
        if (!match) return null;
        const urlMatch = /url\((https:[^)]+)\)/.exec(match[0]);
        return urlMatch ? urlMatch[1] : null;
      };

      const regularUrl = getUrlForWeight(400);
      const boldUrl = getUrlForWeight(700);

      if (!regularUrl || !boldUrl) {
        const result = { regular: null, bold: null };
        fontCache = result;
        return result;
      }

      const [rResp, bResp] = await Promise.all([
        fetchWithTimeout(regularUrl, 5000),
        fetchWithTimeout(boldUrl, 5000),
      ]);

      if (!rResp.ok || !bResp.ok) {
        const result = { regular: null, bold: null };
        fontCache = result;
        return result;
      }

      const rBuf = Buffer.from(await rResp.arrayBuffer());
      const bBuf = Buffer.from(await bResp.arrayBuffer());

      const result = { regular: rBuf, bold: bBuf };
      fontCache = result;
      return result;
    } catch (err) {
      console.error("[og] font fetch failed", err);
      const result = { regular: null, bold: null };
      fontCache = result;
      return result;
    } finally {
      fontCachePromise = null;
    }
  })();

  return await fontCachePromise;
}

export async function GET({
  params,
  props,
}: APIContext<{ post: CollectionEntry<"blog"> }>) {
  if (!validateSlug(params?.slug)) {
    const png = await generateFallbackPng();
    return new Response(new Uint8Array(png), {
      status: 400,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store",
      },
    });
  }

  try {
    const { post } = props;

    const [{ regular: fontRegular, bold: fontBold }, avatarBase64] =
      await Promise.all([fetchNotoSansSCFonts(), buildAvatarDataUri()]);

    const template = buildOgTemplate({ post, avatarBase64 });
    const fonts = buildFonts(fontRegular, fontBold);
    const png = await generateOgPng({ template, fonts });

    return new Response(new Uint8Array(png), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    console.error("[og] image generation failed", { slug: params?.slug, err });
    const png = await generateFallbackPng();
    return new Response(new Uint8Array(png), {
      status: 500,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store",
      },
    });
  }
}
