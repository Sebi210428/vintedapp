import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

type Payload = {
  description?: string;
};

type LimitState = { count: number; resetAt: number };

const RATE_LIMIT_MAX = 40;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const limits = new Map<string, LimitState>();

function getClientIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }
  return request.headers.get("x-real-ip") ?? "unknown";
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

const SPAM_WORDS = [
  "gratis",
  "ieftin",
  "garantie",
  "100%",
  "urgent",
  "ultimul",
  "best",
  "original",
];

function scoreDescription(description: string) {
  const trimmed = description.trim();
  const length = trimmed.length;

  let score = 100;
  const notes: string[] = [];

  if (length < 80) {
    score -= 25;
    notes.push("Prea scurta: incearca 2-4 fraze cu detalii utile.");
  } else if (length < 140) {
    score -= 10;
    notes.push("Putin scurta: adauga detalii despre brand, marime, stare.");
  } else if (length > 600) {
    score -= 15;
    notes.push("Prea lunga: taie repetitiile, pastreaza esentialul.");
  }

  const hasEmoji = /[\u{1F300}-\u{1FAFF}]/u.test(trimmed);
  if (!hasEmoji) {
    score -= 5;
    notes.push("Poti adauga 1-3 emoji discrete pentru ritm.");
  }

  const upperRatio =
    trimmed.replace(/[^A-Z]/g, "").length / Math.max(1, trimmed.replace(/[^A-Za-z]/g, "").length);
  if (upperRatio > 0.5 && trimmed.length > 30) {
    score -= 20;
    notes.push("Evita CAPS LOCK: pare spam.");
  }

  const hasSize = /\b(xs|s|m|l|xl|xxl|\d{2,3})\b/i.test(trimmed);
  if (!hasSize) {
    score -= 10;
    notes.push("Lipseste marimea: e un detaliu esential.");
  }

  const hasCondition = /(nou|foarte bun|bun|ok|worn|like new|good|fair)/i.test(trimmed);
  if (!hasCondition) {
    score -= 10;
    notes.push("Lipseste starea produsului.");
  }

  const hasBrandHint = /(brand|marca|by|from)\s+\w+/i.test(trimmed);
  if (!hasBrandHint) {
    score -= 6;
    notes.push("Mentioneaza brandul daca exista.");
  }

  const hasMeasurements = /(cm|inch|lungime|bust|talie|sold)/i.test(trimmed);
  if (!hasMeasurements) {
    score -= 4;
    notes.push("Optional: masuratori pentru incredere (ex. bust, talie).");
  }

  const hasCta = /(scrie-mi|mesaj|pm|intreaba|discutam|message)/i.test(trimmed);
  if (!hasCta) {
    score -= 6;
    notes.push("Adauga un CTA scurt (ex. \"Scrie-mi pentru detalii\").");
  }

  const hasPrice = /(\b\d+\s?(lei|ron|€|eur|usd|\$)\b)/i.test(trimmed);
  if (hasPrice) {
    score -= 5;
    notes.push("Evita mentionarea pretului in descriere.");
  }

  const spamHits = SPAM_WORDS.filter((word) => trimmed.toLowerCase().includes(word));
  if (spamHits.length > 0) {
    score -= Math.min(15, spamHits.length * 5);
    notes.push("Evita termeni tip spam (ex. \"gratis\", \"urgent\").");
  }

  const sentences = trimmed.split(/[.!?]/).filter((s) => s.trim().length > 0);
  if (sentences.length < 2) {
    score -= 8;
    notes.push("Foloseste minimum 2 fraze pentru claritate.");
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  const verdict =
    score >= 85
      ? "Foarte buna"
      : score >= 70
        ? "Buna"
        : score >= 50
          ? "Ok"
          : "Slaba";

  return { score, verdict, notes };
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = checkRateLimit(ip);
  if (!limit.ok) {
    return NextResponse.json({ ok: false, error: "Rate limit exceeded." }, { status: 429 });
  }

  const body = (await request.json().catch(() => null)) as Payload | null;
  const description = body?.description;
  if (typeof description !== "string" || !description.trim()) {
    return NextResponse.json({ ok: false, error: "Descrierea este goala." }, { status: 400 });
  }
  if (description.length > 2000) {
    return NextResponse.json(
      { ok: false, error: "Descrierea e prea lunga (max 2000 caractere)." },
      { status: 400 },
    );
  }

  const result = scoreDescription(description);
  return NextResponse.json({ ok: true, ...result });
}
