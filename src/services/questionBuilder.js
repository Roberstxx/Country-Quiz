// src/services/questionBuilder.js
import { shuffle } from "/src/utils/shuffle.js";

let qid = 0;
const id = () => ++qid;
const pickN = (arr, n) => shuffle(arr).slice(0, n);

export function buildByType(countries, type, amount = 10) {
  switch (type) {
    case "flag":     return buildFlagQuestions(countries, amount);
    case "capital":  return buildCapitalQuestions(countries, amount);
    case "region":   return buildRegionQuestions(countries, amount);
    case "currency": return buildCurrencyQuestions(countries, amount);
    case "language": return buildLanguageQuestions(countries, amount);
    default:         return buildFlagQuestions(countries, amount);
  }
}

// ---------- Tipos ----------

// FLAG
function buildFlagQuestions(countries, amount) {
  const pool = countries
    .filter(c => c.name && c.flagUrl);
  const names = pool.map(c => c.name);
  const picked = pickN(pool, Math.min(amount, pool.length));
  return picked.map((c) => ({
    id: id(),
    type: "flag",
    prompt: "¿A qué país pertenece esta bandera?",
    flagUrl: c.flagUrl,
    options: shuffle([c.name, ...pickN(names.filter(n => n !== c.name), 3)]),
    answer: c.name
  }));
}

// CAPITAL
function buildCapitalQuestions(countries, amount) {
  const pool = countries.filter(c => c.name && c.capital);
  const capitals = pool.map(c => c.capital);
  const picked = pickN(pool, Math.min(amount, pool.length));
  return picked.map(c => ({
    id: id(),
    type: "capital",
    prompt: `¿Cuál es la capital de ${c.name}?`,
    options: shuffle([c.capital, ...pickN(capitals.filter(x => x !== c.capital), 3)]),
    answer: c.capital
  }));
}

// REGION
function buildRegionQuestions(countries, amount) {
  const pool = countries.filter(c => c.name && c.region);
  const regions = [...new Set(pool.map(c => c.region))];
  const picked = pickN(pool, Math.min(amount, pool.length));
  return picked.map(c => ({
    id: id(),
    type: "region",
    prompt: `¿En qué región se encuentra ${c.name}?`,
    options: shuffle([c.region, ...pickN(regions.filter(r => r !== c.region), 3)]),
    answer: c.region
  }));
}

// CURRENCY
function buildCurrencyQuestions(countries, amount) {
  const withCur = countries
    .map(c => ({...c, firstCur: c.currencies?.[0] || null}))
    .filter(c => c.name && c.firstCur);
  const all = [...new Set(withCur.map(c => c.firstCur))];
  const picked = pickN(withCur, Math.min(amount, withCur.length));
  return picked.map(c => ({
    id: id(),
    type: "currency",
    prompt: `¿Cuál es una moneda usada en ${c.name}?`,
    options: shuffle([c.firstCur, ...pickN(all.filter(x => x !== c.firstCur), 3)]),
    answer: c.firstCur
  }));
}

// LANGUAGE
function buildLanguageQuestions(countries, amount) {
  const withLang = countries
    .map(c => ({...c, firstLang: c.languages?.[0] || null}))
    .filter(c => c.name && c.firstLang);
  const all = [...new Set(withLang.map(c => c.firstLang))];
  const picked = pickN(withLang, Math.min(amount, withLang.length));
  return picked.map(c => ({
    id: id(),
    type: "language",
    prompt: `¿Cuál es un idioma hablado en ${c.name}?`,
    options: shuffle([c.firstLang, ...pickN(all.filter(x => x !== c.firstLang), 3)]),
    answer: c.firstLang
  }));
}
