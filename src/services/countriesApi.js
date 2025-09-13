// src/services/countriesApi.js

/**
 * Rest Countries base:
 * https://restcountries.com/v3.1/all?fields=...
 *
 * Nota:
 * - Usa "fields" para reducir payload.
 * - Preferimos SVG para banderas (mejor calidad); si no hay, caemos a PNG.
 */

const DEFAULT_FIELDS = [
  "name",
  "cca2",
  "flags",
  "capital",
  "region",
  "subregion",
  "currencies",
  "languages",
];

const LIGHT_FIELDS = ["name", "flags"]; // para el quiz de banderas

/**
 * Construye la URL con fields.
 */
function buildUrl(fields) {
  const f = Array.isArray(fields) && fields.length ? fields : DEFAULT_FIELDS;
  // Evita espacios, duplicados y ordena para cachés más consistentes
  const unique = [...new Set(f.map((s) => String(s).trim()))].sort();
  return `https://restcountries.com/v3.1/all?fields=${unique.join(",")}`;
}

/**
 * Fetch con timeout (AbortController) y manejo de errores.
 */
async function fetchJson(url, { timeoutMs = 12000 } = {}) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} al consultar ${url}`);
    }
    return await res.json();
  } finally {
    clearTimeout(id);
  }
}

/**
 * Normaliza un país a un shape estable para el quiz.
 */
function normalizeCountry(c) {
  try {
    const nameCommon =
      c?.name?.common ??
      (typeof c?.name === "string" ? c.name : "") ??
      "";

    const capital =
      Array.isArray(c?.capital) && c.capital.length
        ? c.capital[0]
        : c?.capital || "";

    const flagSvg = c?.flags?.svg || "";
    const flagPng = c?.flags?.png || "";
    const flagUrl = flagSvg || flagPng || "";

    const currencies =
      c?.currencies
        ? Object.values(c.currencies)
            .map((x) => (x?.name ? String(x.name) : ""))
            .filter(Boolean)
        : [];

    const languages =
      c?.languages
        ? Object.values(c.languages)
            .map((x) => (x ? String(x) : ""))
            .filter(Boolean)
        : [];

    return {
      id: c?.cca2 ?? nameCommon, // fallback si no hay cca2
      name: nameCommon,
      capital,
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

/**
 * Quita nulos y duplicados (por id).
 */
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

/**
 * API pública:
 * - fetchCountries(): completo (para capital/moneda/idioma/region/flag).
 * - fetchCountriesLight(): ligero (solo nombre + bandera), ideal para quiz de banderas.
 */

export async function fetchCountries() {
  const url = buildUrl(DEFAULT_FIELDS);
  const raw = await fetchJson(url);
  return dedupeAndClean(raw.map(normalizeCountry));
}

export async function fetchCountriesLight() {
  const url = buildUrl(LIGHT_FIELDS);
  const raw = await fetchJson(url);
  // Aunque pedimos light, normalizamos igual para que el shape sea uniforme
  return dedupeAndClean(
    raw.map((c) =>
      normalizeCountry({
        // construimos un objeto mínimo compatible con normalizeCountry
        name: c?.name,
        flags: c?.flags,
        cca2: c?.cca2,
      })
    )
  );
}

/**
 * Utilidad opcional: obtiene N países aleatorios del listado dado.
 */
export function pickRandomCountries(countries, n = 10) {
  const a = [...countries];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, Math.max(0, Math.min(n, a.length)));
}
