// src/services/countriesApi.js

/**
 * Rest Countries v3 (EN por defecto en name.common)
 * https://restcountries.com/v3.1/all?fields=...
 *
 * Claves del enfoque:
 * - NO pedimos `translations` (así evitamos que salgan nombres localizados).
 * - Usamos SIEMPRE `name.common` (viene en inglés).
 * - Forzamos header "Accept-Language: en" por robustez (aunque no es estrictamente necesario).
 * - cache: "no-store" + &v=3 para evitar cachés viejos.
 */

const DEFAULT_FIELDS = [
  "name",        // name.common -> EN
  "cca2",
  "flags",
  "capital",
  "region",
  "subregion",
  "currencies",
  "languages",
];

const LIGHT_FIELDS = [
  "name",        // EN
  "flags",
  "cca2",
];

/** Construye URL con fields + cache-bust */
function buildUrl(fields) {
  const f = Array.isArray(fields) && fields.length ? fields : DEFAULT_FIELDS;
  const unique = [...new Set(f.map(s => String(s).trim()))].sort();
  // v=3: evita respuestas cacheadas anteriores
  return `https://restcountries.com/v3.1/all?fields=${unique.join(",")}&v=3`;
}

/** Fetch con timeout, EN forzado y sin caché */
async function fetchJson(url, { timeoutMs = 12000 } = {}) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { "Accept-Language": "en,en-US;q=0.9" }, // robustez
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} al consultar ${url}`);
    return await res.json();
  } finally {
    clearTimeout(id);
  }
}

/** Normaliza un país (en inglés) */
function normalizeCountry(c) {
  try {
    const nameCommon =
      c?.name?.common ??
      (typeof c?.name === "string" ? c.name : "") ??
      "";

    const capital = Array.isArray(c?.capital) && c.capital.length
      ? c.capital[0]
      : (c?.capital || "");

    const flagUrl = c?.flags?.svg || c?.flags?.png || "";

    const currencies = c?.currencies
      ? Object.values(c.currencies)
          .map(x => (x?.name ? String(x.name) : ""))
          .filter(Boolean)
      : [];

    const languages = c?.languages
      ? Object.values(c.languages)
          .map(x => (x ? String(x) : ""))
          .filter(Boolean)
      : [];

    return {
      id: c?.cca2 ?? nameCommon,
      name: nameCommon,   // ← EN
      capital,            // suele venir en EN también
      region: c?.region || "",
      subregion: c?.subregion || "",
      flagUrl,
      currencies,
      languages,
    };
  } catch {
    return null;
  }
}

/** Quita nulos y duplicados por id */
function dedupeAndClean(list) {
  const out = [];
  const seen = new Set();
  for (const item of list) {
    if (!item || !item.id || !item.name) continue;
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    out.push(item);
  }
  return out;
}

/** API pública */
export async function fetchCountries() {
  const url = buildUrl(DEFAULT_FIELDS);
  const raw = await fetchJson(url);
  return dedupeAndClean(raw.map(normalizeCountry));
}

export async function fetchCountriesLight() {
  const url = buildUrl(LIGHT_FIELDS);
  const raw = await fetchJson(url);
  return dedupeAndClean(
    raw.map(c =>
      normalizeCountry({
        name: c?.name,
        flags: c?.flags,
        cca2: c?.cca2,
      })
    )
  );
}

/** Utilidad: sample aleatorio */
export function pickRandomCountries(countries, n = 10) {
  const a = [...countries];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, Math.max(0, Math.min(n, a.length)));
}




