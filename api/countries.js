import { fallbackCountries } from "./fallbackCountries.js";

const REST_COUNTRIES_URL = "https://restcountries.com/v3.1/all";
const ALLOWED_FIELDS = new Set([
  "name",
  "cca2",
  "flags",
  "capital",
  "region",
  "subregion",
  "currencies",
  "languages",
]);

function filterCountryFields(country, fields) {
  return fields.reduce((filtered, field) => {
    if (field in country) filtered[field] = country[field];
    return filtered;
  }, {});
}

function sendFallback(response, fields, reason) {
  response.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
  response.setHeader("X-Countries-Source", "fallback");
  response.setHeader("X-Countries-Fallback-Reason", reason);
  response.status(200).json(fallbackCountries.map(country => filterCountryFields(country, fields)));
}

function normalizeFields(value) {
  const requested = String(value || "")
    .split(",")
    .map(field => field.trim())
    .filter(Boolean);

  const fields = requested.filter(field => ALLOWED_FIELDS.has(field));
  const uniqueFields = [...new Set(fields.length ? fields : [...ALLOWED_FIELDS])].sort();
  return uniqueFields;
}

export default async function handler(request, response) {
  const fields = normalizeFields(request.query?.fields);
  const fieldList = fields.join(",");
  const upstreamUrl = `${REST_COUNTRIES_URL}?fields=${fieldList}`;

  try {
    const upstreamResponse = await fetch(upstreamUrl, {
      headers: { Accept: "application/json" },
    });

    const data = await upstreamResponse.json();

    if (!upstreamResponse.ok || !Array.isArray(data)) {
      sendFallback(response, fields, `upstream-${upstreamResponse.status}`);
      return;
    }

    response.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=604800");
    response.status(200).json(data);
  } catch {
    sendFallback(response, fields, "upstream-fetch-failed");
  }
}
