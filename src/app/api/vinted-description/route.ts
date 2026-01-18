import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getServerAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

type Payload = {
  productType: string;
  brand: string;
  size: string;
  condition: string;
  style?: string;
  details?: string;
  tone?: string;
  language?: string;
};

type LimitState = { count: number; resetAt: number };

const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const limits = new Map<string, LimitState>();

function getClientIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

function validateString(value: unknown, field: string, required = true) {
  if (typeof value !== "string") {
    if (required) {
      return { ok: false, error: `${field} must be a string.` } as const;
    }
    return { ok: true, value: "" } as const;
  }
  const trimmed = value.trim();
  if (required && !trimmed.length) {
    return { ok: false, error: `${field} is required.` } as const;
  }
  if (trimmed.length > 200) {
    return { ok: false, error: `${field} must be at most 200 characters.` } as const;
  }
  return { ok: true, value: trimmed } as const;
}

function checkRateLimit(ip: string) {
  const now = Date.now();
  const entry = limits.get(ip);
  if (!entry || now > entry.resetAt) {
    limits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { ok: true, remaining: RATE_LIMIT_MAX - 1 };
  }
  if (entry.count >= RATE_LIMIT_MAX) {
    return { ok: false, retryAfterMs: entry.resetAt - now };
  }
  entry.count += 1;
  return { ok: true, remaining: RATE_LIMIT_MAX - entry.count };
}

const TONE_PRESETS = {
  premium: {
    ro: "cu ton premium minimalist, elegant si aerisit",
    en: "with a premium minimalist tone, clean and elegant",
  },
  casual: {
    ro: "cu ton casual, prietenos si relaxat",
    en: "with a casual, friendly and relaxed tone",
  },
  "fast-sale": {
    ro: "cu ton orientat spre vanzare rapida, concis si direct",
    en: "with a fast-sale tone, concise and direct",
  },
  luxury: {
    ro: "cu ton luxury, rafinat si exclusivist",
    en: "with a luxury, refined and high-end tone",
  },
} as const;

const ALLOWED_LANGUAGES = new Set(["ro", "en"]);

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = checkRateLimit(ip);
  if (!limit.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: "Rate limit exceeded. Try again later.",
      },
      { status: 429 },
    );
  }

  const body = (await request.json().catch(() => null)) as Payload | null;
  if (!body) {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const productType = validateString(body.productType, "productType");
  if (!productType.ok) {
    return NextResponse.json({ ok: false, error: productType.error }, { status: 400 });
  }
  const brand = validateString(body.brand, "brand");
  if (!brand.ok) {
    return NextResponse.json({ ok: false, error: brand.error }, { status: 400 });
  }
  const size = validateString(body.size, "size");
  if (!size.ok) {
    return NextResponse.json({ ok: false, error: size.error }, { status: 400 });
  }
  const condition = validateString(body.condition, "condition");
  if (!condition.ok) {
    return NextResponse.json({ ok: false, error: condition.error }, { status: 400 });
  }
  const style = validateString(body.style, "style", false);
  if (!style.ok) {
    return NextResponse.json({ ok: false, error: style.error }, { status: 400 });
  }
  const details = validateString(body.details, "details", false);
  if (!details.ok) {
    return NextResponse.json({ ok: false, error: details.error }, { status: 400 });
  }
  const tone = validateString(body.tone, "tone", false);
  if (!tone.ok) {
    return NextResponse.json({ ok: false, error: tone.error }, { status: 400 });
  }
  const language = validateString(body.language, "language", false);
  if (!language.ok) {
    return NextResponse.json({ ok: false, error: language.error }, { status: 400 });
  }

  const allowedConditions = new Set(["nou", "foarte bun", "bun", "ok"]);
  if (!allowedConditions.has(condition.value.toLowerCase())) {
    return NextResponse.json(
      { ok: false, error: "condition must be one of: nou, foarte bun, bun, ok." },
      { status: 400 },
    );
  }

  const toneKeyRaw = tone.value ? tone.value.trim().toLowerCase() : "";
  const toneKey =
    toneKeyRaw && Object.prototype.hasOwnProperty.call(TONE_PRESETS, toneKeyRaw)
      ? (toneKeyRaw as keyof typeof TONE_PRESETS)
      : "premium";

  const languageKeyRaw = language.value ? language.value.trim().toLowerCase() : "";
  const languageKey = ALLOWED_LANGUAGES.has(languageKeyRaw) ? languageKeyRaw : "ro";

  const groqKey = process.env.GROQ_API_KEY;
  const apiKey = groqKey || process.env.OPENAI_API_KEY;
  const mockEnabled = process.env.MOCK_VINTED_DESCRIPTION === "true";
  if (mockEnabled) {
    const isEnglish = languageKey === "en";
    const base = isEnglish
      ? `${brand.value} ${productType.value}, size ${size.value}, condition ${condition.value}`
      : `${brand.value} ${productType.value}, marimea ${size.value}, stare ${condition.value}`;
    const styleLine = style.value
      ? isEnglish
        ? ` Style ${style.value}.`
        : ` Stil ${style.value}.`
      : "";
    const detailLine = details.value
      ? isEnglish
        ? ` Details: ${details.value}.`
        : ` Detalii: ${details.value}.`
      : "";
    return NextResponse.json({
      ok: true,
      short: isEnglish
        ? `${base}.${styleLine}${detailLine} Extra photos on request.`
        : `${base}.${styleLine}${detailLine} Pot trimite poze suplimentare la cerere.`,
      selling: isEnglish
        ? `Selling ${base}.${styleLine}${detailLine} Easy to style. Message me for details.`
        : `Vand ${base}.${styleLine}${detailLine} Ideal pentru garderoba de zi cu zi. Scrie-mi pentru detalii.`,
      seo: isEnglish
        ? `${brand.value} ${productType.value} size ${size.value}, condition ${condition.value}.${styleLine}${detailLine} Available now, message me.`
        : `${brand.value} ${productType.value} marimea ${size.value}, stare ${condition.value}.${styleLine}${detailLine} Disponibil imediat, astept mesaj.`,
    });
  }

  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: "AI API key is missing." },
      { status: 500 },
    );
  }

  const baseUrl = groqKey
    ? "https://api.groq.com/openai/v1"
    : process.env.AI_BASE_URL ?? "https://api.openai.com/v1";
  const model = process.env.AI_MODEL ?? (groqKey ? "llama3-8b-8192" : "gpt-4o-mini");

  const toneInstruction = TONE_PRESETS[toneKey][languageKey];
  const prompt =
    languageKey === "en"
      ? [
          `Generate 3 Vinted descriptions in English, ${toneInstruction}.`,
          "Return strictly one JSON object with EXACT root keys: short, selling, seo.",
          "Do not include other keys and do not nest objects.",
          "short = version A (short, clean, 2-3 emoji, elegant vocabulary).",
          "selling = version B (persuasive, benefits/occasions, 3-5 emoji, no cliches).",
          "seo = version C (premium aesthetic, bullet points, 4-6 emoji, airy layout).",
          "Fixed structure: short hook (1 line), key details (type/brand/size/condition/style), extra details if present, short CTA.",
          "Keep a clean rhythm: short sentences, no exaggeration, no slang, no repetition.",
          "Do NOT invent materials, measurements, flaws, authenticity or unspecified details.",
          "If fields are missing, omit them without mentioning the absence.",
          "If condition is 'ok' or 'bun', keep language honest and not overly polished.",
          "No links, no price, no hashtags, no ALL CAPS, no spammy terms.",
          "",
          `Product type: ${productType.value}`,
          `Brand: ${brand.value}`,
          `Size: ${size.value}`,
          `Condition: ${condition.value}`,
          `Style: ${style.value || "n/a"}`,
          `Details: ${details.value || "n/a"}`,
        ].join("\n")
      : [
          `Genereaza 3 variante de descriere pentru Vinted in romana, ${toneInstruction}.`,
          "Returneaza strict un singur JSON cu EXACT cheile la radacina: short, selling, seo.",
          "Nu include alte chei si nu cuibari obiecte.",
          "short = varianta A (scurta, clean, 2-3 emoji, vocabular elegant).",
          "selling = varianta B (persuasiva, beneficii/ocazii, 3-5 emoji, fara clisee).",
          "seo = varianta C (premium/aesthetic, structurata pe bullet points, 4-6 emoji, foarte aerisita).",
          "Structura fixa: hook scurt (1 linie), detalii cheie (tip/brand/marime/stare/stil), detalii suplimentare daca exista, CTA scurt.",
          "Pastrati un ritm curat: fraze scurte, fara exagerari, fara slang, fara repetitii.",
          "NU inventa materiale, masuratori, defecte, autenticitate sau alte detalii nespecificate.",
          "Daca lipsesc campuri, omite elegant fara a mentiona absenta lor.",
          "Daca starea e 'ok' sau 'bun', foloseste limbaj onest, fara cosmetizare excesiva.",
          "Fara linkuri, fara pret, fara hashtag-uri, fara caps lock, fara termeni spammy.",
          "",
          `Tip produs: ${productType.value}`,
          `Brand: ${brand.value}`,
          `Marime: ${size.value}`,
          `Stare: ${condition.value}`,
          `Stil: ${style.value || "n/a"}`,
          `Detalii: ${details.value || "n/a"}`,
        ].join("\n");

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.6,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You generate concise Vinted descriptions in the requested language following the user instructions.",
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    return NextResponse.json(
      {
        ok: false,
        error: "OpenAI request failed.",
        details: errorText.slice(0, 500),
      },
      { status: 502 },
    );
  }

  const data = (await response.json().catch(() => null)) as {
    choices?: { message?: { content?: string } }[];
  } | null;
  const content = data?.choices?.[0]?.message?.content ?? "";
  let parsed: { short?: string; selling?: string; seo?: string } | null = null;

  function normalizeParsed(value: {
    short?: string;
    selling?: string;
    seo?: string;
    varianta1?: { short?: string; selling?: string; seo?: string };
    variant1?: { short?: string; selling?: string; seo?: string };
  } | null) {
    if (!value) {
      return null;
    }
    if (value.short && value.selling && value.seo) {
      return value;
    }
    const fallback = value.varianta1 ?? value.variant1;
    if (fallback?.short && fallback?.selling && fallback?.seo) {
      return { short: fallback.short, selling: fallback.selling, seo: fallback.seo };
    }
    return null;
  }

  function tryParseJson(value: string) {
    try {
      return JSON.parse(value) as { short?: string; selling?: string; seo?: string };
    } catch {
      return null;
    }
  }

  parsed = tryParseJson(content);
  if (!parsed) {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsed = tryParseJson(jsonMatch[0]);
    }
  }

  if (!parsed) {
    const pick = (label: string) => {
      const re = new RegExp(`${label}\\s*[:\\-]\\s*([\\s\\S]+?)(?=\\n\\s*(short|selling|seo)\\s*[:\\-]|$)`, "i");
      const match = content.match(re);
      return match?.[1]?.trim() ?? "";
    };
    const short = pick("short");
    const selling = pick("selling");
    const seo = pick("seo");
    if (short && selling && seo) {
      parsed = { short, selling, seo };
    }
  }

  const normalized = normalizeParsed(parsed);
  const isProd = process.env.NODE_ENV === "production";
  if (!normalized) {
    return NextResponse.json(
      {
        ok: false,
        error: "Invalid AI response format.",
        ...(isProd ? null : { raw: content.slice(0, 2000) }),
      },
      { status: 502 },
    );
  }

  const session = await getServerAuthSession();
  const email = session?.user?.email?.toLowerCase() ?? null;
  const user = email ? await prisma.user.findUnique({ where: { email } }) : null;
  const history = user
    ? await prisma.vintedDescription.create({
        data: {
          userId: user.id,
          productType: productType.value,
          brand: brand.value,
          size: size.value,
          condition: condition.value,
          style: style.value || null,
          details: details.value || null,
          tone: toneKey,
          language: languageKey,
          short: normalized.short,
          selling: normalized.selling,
          seo: normalized.seo,
        },
      })
    : null;

  return NextResponse.json({
    ok: true,
    short: normalized.short,
    selling: normalized.selling,
    seo: normalized.seo,
    history: history
      ? {
          id: history.id,
          createdAt: history.createdAt.toISOString(),
          productType: history.productType,
          brand: history.brand,
          size: history.size,
          condition: history.condition,
          style: history.style,
          details: history.details,
          tone: history.tone,
          language: history.language,
          short: history.short,
          selling: history.selling,
          seo: history.seo,
        }
      : null,
  });
}
