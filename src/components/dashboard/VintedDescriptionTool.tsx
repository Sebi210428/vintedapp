"use client";

import { useEffect, useMemo, useState } from "react";

type Result = {
  short: string;
  selling: string;
  seo: string;
};

type ScoreResult = {
  score: number;
  verdict: string;
  notes: string[];
};

type HistoryItem = {
  id: string;
  createdAt: string;
  productType: string;
  brand: string;
  size: string;
  condition: string;
  style: string | null;
  details: string | null;
  tone: string | null;
  language: string | null;
  short: string;
  selling: string;
  seo: string;
};

type Props = {
  initialHistory?: HistoryItem[];
};

const productTypes = [
  "Tricou",
  "Camasa",
  "Rochie",
  "Pantaloni",
  "Fusta",
  "Jacheta",
  "Hanorac",
  "Pulover",
  "Jeans",
  "Pantofi",
  "Geanta",
  "Accesorii",
  "Altul",
];

const conditions = ["nou", "foarte bun", "bun", "ok"];
const tonePresets = [
  { value: "premium", label: "Premium minimalist" },
  { value: "casual", label: "Casual friendly" },
  { value: "fast-sale", label: "Fast sale" },
  { value: "luxury", label: "Luxury" },
];
const languages = [
  { value: "ro", label: "Romana" },
  { value: "en", label: "Engleza" },
];

function countLeft(value: string) {
  return 200 - value.length;
}

export default function VintedDescriptionTool({ initialHistory = [] }: Props) {
  const [productType, setProductType] = useState(productTypes[0] ?? "");
  const [brand, setBrand] = useState("");
  const [size, setSize] = useState("");
  const [condition, setCondition] = useState(conditions[1] ?? "foarte bun");
  const [style, setStyle] = useState("");
  const [details, setDetails] = useState("");
  const [tone, setTone] = useState("premium");
  const [language, setLanguage] = useState("ro");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>(initialHistory);
  const [analysisText, setAnalysisText] = useState("");
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ScoreResult | null>(null);

  const canSubmit = useMemo(() => {
    return Boolean(productType && brand.trim() && size.trim() && condition && !loading);
  }, [productType, brand, size, condition, loading]);

  useEffect(() => {
    const storedTone = window.localStorage.getItem("vinted-tone");
    const storedLanguage = window.localStorage.getItem("vinted-language");
    if (storedTone && tonePresets.some((preset) => preset.value === storedTone)) {
      setTone(storedTone);
    }
    if (storedLanguage && languages.some((item) => item.value === storedLanguage)) {
      setLanguage(storedLanguage);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("vinted-tone", tone);
  }, [tone]);

  useEffect(() => {
    window.localStorage.setItem("vinted-language", language);
  }, [language]);

  async function onSubmit() {
    setError(null);
    setResult(null);

    setLoading(true);
    try {
      const response = await fetch("/api/vinted-description", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          productType,
          brand,
          size,
          condition,
          style: style || undefined,
          details: details || undefined,
          tone,
          language,
        }),
      });
      const body = (await response.json().catch(() => null)) as
        | ({ ok: true } & Result & { history?: HistoryItem | null })
        | { ok?: boolean; error?: string; details?: string }
        | null;

      if (!response.ok || !body || !body.ok) {
        const detail = body?.details ? ` (${body.details})` : "";
        setError(`${body?.error ?? "Nu am putut genera descrierea."}${detail}`);
        return;
      }
      setResult({ short: body.short, selling: body.selling, seo: body.seo });
      if (body.history) {
        setHistory((prev) => [body.history as HistoryItem, ...prev].slice(0, 10));
      }
    } catch {
      setError("Nu am putut genera descrierea.");
    } finally {
      setLoading(false);
    }
  }

  async function onCopy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      setError("Nu am putut copia textul.");
    }
  }

  async function onCopyAll() {
    if (!result) return;
    const combined = [
      "Short:",
      result.short,
      "",
      "Selling:",
      result.selling,
      "",
      "SEO:",
      result.seo,
    ].join("\n");
    await onCopy(combined);
  }

  async function onAnalyze() {
    setAnalysisError(null);
    setAnalysisResult(null);

    const value = analysisText.trim();
    if (!value) {
      setAnalysisError("Scrie o descriere mai intai.");
      return;
    }

    setAnalysisLoading(true);
    try {
      const response = await fetch("/api/vinted-description/score", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ description: value }),
      });
      const body = (await response.json().catch(() => null)) as
        | ({ ok: true } & ScoreResult)
        | { ok?: boolean; error?: string }
        | null;

      if (!response.ok || !body || !body.ok) {
        setAnalysisError(body?.error ?? "Nu am putut analiza descrierea.");
        return;
      }
      setAnalysisResult({ score: body.score, verdict: body.verdict, notes: body.notes ?? [] });
    } catch {
      setAnalysisError("Nu am putut analiza descrierea.");
    } finally {
      setAnalysisLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="glass-panel rounded-2xl border border-white/5 p-5 sm:p-7">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h2 className="text-lg sm:text-2xl font-bold text-white">
              Generate Vinted Description
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Completeaza campurile esentiale si obtine 3 variante de descriere.
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Ton</label>
            <select
              className="h-11 w-full rounded-xl border border-white/10 bg-[#0b1121] px-3 text-sm text-white"
              onChange={(event) => setTone(event.target.value)}
              value={tone}
            >
              {tonePresets.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Limba</label>
            <select
              className="h-11 w-full rounded-xl border border-white/10 bg-[#0b1121] px-3 text-sm text-white"
              onChange={(event) => setLanguage(event.target.value)}
              value={language}
            >
              {languages.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Tip produs</label>
            <select
              className="h-11 w-full rounded-xl border border-white/10 bg-[#0b1121] px-3 text-sm text-white"
              onChange={(event) => setProductType(event.target.value)}
              value={productType}
            >
              {productTypes.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Brand</label>
            <input
              className="h-11 w-full rounded-xl border border-white/10 bg-[#0b1121] px-3 text-sm text-white"
              maxLength={200}
              onChange={(event) => setBrand(event.target.value)}
              placeholder="ex: Zara"
              type="text"
              value={brand}
            />
            <div className="text-[10px] text-slate-500">{countLeft(brand)} caractere</div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Marime</label>
            <input
              className="h-11 w-full rounded-xl border border-white/10 bg-[#0b1121] px-3 text-sm text-white"
              maxLength={200}
              onChange={(event) => setSize(event.target.value)}
              placeholder="ex: M / 38"
              type="text"
              value={size}
            />
            <div className="text-[10px] text-slate-500">{countLeft(size)} caractere</div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Stare</label>
            <select
              className="h-11 w-full rounded-xl border border-white/10 bg-[#0b1121] px-3 text-sm text-white"
              onChange={(event) => setCondition(event.target.value)}
              value={condition}
            >
              {conditions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-semibold text-slate-300">
              Stil (optional)
            </label>
            <input
              className="h-11 w-full rounded-xl border border-white/10 bg-[#0b1121] px-3 text-sm text-white"
              maxLength={200}
              onChange={(event) => setStyle(event.target.value)}
              placeholder="ex: casual, office, streetwear"
              type="text"
              value={style}
            />
            <div className="text-[10px] text-slate-500">{countLeft(style)} caractere</div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-semibold text-slate-300">
              Detalii (optional)
            </label>
            <textarea
              className="min-h-[100px] w-full rounded-xl border border-white/10 bg-[#0b1121] px-3 py-2 text-sm text-white"
              maxLength={200}
              onChange={(event) => setDetails(event.target.value)}
              placeholder="ex: material, fit, defecte mici"
              value={details}
            />
            <div className="text-[10px] text-slate-500">{countLeft(details)} caractere</div>
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <button
          className="mt-5 flex h-11 w-full items-center justify-center rounded-xl bg-accent-primary text-sm font-semibold text-white shadow-[0_0_24px_rgba(13,93,242,0.4)] transition-all hover:bg-accent-blue disabled:cursor-not-allowed disabled:opacity-60"
          disabled={!canSubmit}
          onClick={onSubmit}
          type="button"
        >
          {loading ? "Se genereaza..." : "Genereaza descriere"}
        </button>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-[#05080f]/60 p-6">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h3 className="text-lg font-bold text-white">Description Check</h3>
              <p className="mt-2 text-sm text-slate-400">
                Lipeste descrierea ta si primesti un scor + recomandari.
              </p>
            </div>
          </div>

          <div className="mt-4">
            <textarea
              className="min-h-[140px] w-full rounded-xl border border-white/10 bg-[#0b1121] px-3 py-3 text-sm text-white"
              maxLength={2000}
              onChange={(event) => setAnalysisText(event.target.value)}
              placeholder="Ex: Rochie Zara, marimea M, stare foarte buna. Purtata de 2 ori..."
              value={analysisText}
            />
            <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
              <span>{analysisText.length}/2000 caractere</span>
              <span>Scor estimativ, nu final.</span>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              className="rounded-xl bg-accent-primary px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-accent-blue disabled:opacity-60"
              disabled={analysisLoading}
              onClick={() => void onAnalyze()}
              type="button"
            >
              {analysisLoading ? "Analizez..." : "Analizeaza"}
            </button>
            {analysisError ? (
              <span className="text-xs text-red-300">{analysisError}</span>
            ) : null}
          </div>

          {analysisResult ? (
            <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-widest text-slate-400">
                    Scor
                  </div>
                  <div className="text-3xl font-bold text-white">
                    {analysisResult.score}%
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs uppercase tracking-widest text-slate-400">
                    Verdict
                  </div>
                  <div className="text-sm font-semibold text-emerald-300">
                    {analysisResult.verdict}
                  </div>
                </div>
              </div>
              {analysisResult.notes.length ? (
                <ul className="mt-3 list-disc pl-4 text-xs text-slate-300 space-y-1">
                  {analysisResult.notes.map((note, index) => (
                    <li key={`${note}-${index}`}>{note}</li>
                  ))}
                </ul>
              ) : (
                <div className="mt-3 text-xs text-slate-300">
                  Arata foarte bine. Doar rafineaza stilul daca vrei un plus.
                </div>
              )}
            </div>
          ) : null}
        </div>
        {result ? (
          <>
            <div className="flex items-center justify-end">
              <button
                className="text-[11px] font-semibold text-accent-blue hover:text-white"
                onClick={onCopyAll}
                type="button"
              >
                Copy all
              </button>
            </div>
            {([
              { key: "short", label: "Short", value: result.short },
              { key: "selling", label: "Selling", value: result.selling },
              { key: "seo", label: "SEO", value: result.seo },
            ] as const).map((item) => (
              <div
                className="rounded-2xl border border-white/5 bg-white/[0.02] p-5"
                key={item.key}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                    {item.label}
                  </div>
                  <button
                    className="text-xs font-semibold text-accent-blue hover:text-white"
                    onClick={() => onCopy(item.value)}
                    type="button"
                  >
                    Copy
                  </button>
                </div>
                <pre className="mt-3 whitespace-pre-wrap text-sm text-slate-200 font-sans">
                  {item.value}
                </pre>
              </div>
            ))}
          </>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-[#05080f]/60 p-6 text-sm text-slate-400">
            Completeaza formularul pentru a vedea rezultatele.
          </div>
        )}

        {history.length ? (
          <div className="rounded-2xl border border-white/10 bg-[#05080f]/60 p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                History
              </div>
              <div className="text-[11px] text-slate-500">Ultimele {history.length}</div>
            </div>
            <div className="mt-4 space-y-4">
              {history.map((item) => {
                const label = [item.productType, item.brand, item.size]
                  .filter(Boolean)
                  .join(" ú ");
                return (
                  <div
                    className="rounded-xl border border-white/5 bg-white/[0.02] p-4"
                    key={item.id}
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-semibold text-white">{label}</div>
                        <div className="text-[10px] text-slate-500">
                          {new Date(item.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {item.condition}
                        {item.style ? ` ú ${item.style}` : ""}
                        {item.details ? ` ú ${item.details}` : ""}
                        {item.language ? ` ú ${item.language.toUpperCase()}` : ""}
                        {item.tone ? ` ú ${item.tone}` : ""}
                      </div>
                      <div className="flex flex-wrap gap-2 text-[11px]">
                        <button
                          className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-slate-200 hover:text-white"
                          onClick={() => onCopy(item.short)}
                          type="button"
                        >
                          Copy Short
                        </button>
                        <button
                          className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-slate-200 hover:text-white"
                          onClick={() => onCopy(item.selling)}
                          type="button"
                        >
                          Copy Selling
                        </button>
                        <button
                          className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-slate-200 hover:text-white"
                          onClick={() => onCopy(item.seo)}
                          type="button"
                        >
                          Copy SEO
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
