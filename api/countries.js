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

function normalizeFields(value) {
  const requested = String(value || "")
    .split(",")
    .map(field => field.trim())
    .filter(Boolean);

  const fields = requested.filter(field => ALLOWED_FIELDS.has(field));
  const uniqueFields = [...new Set(fields.length ? fields : [...ALLOWED_FIELDS])].sort();
  return uniqueFields.join(",");
}

export default async function handler(request, response) {
  const fields = normalizeFields(request.query?.fields);
  const upstreamUrl = `${REST_COUNTRIES_URL}?fields=${encodeURIComponent(fields)}`;

  try {
    const upstreamResponse = await fetch(upstreamUrl, {
      headers: { Accept: "application/json" },
    });

    const body = await upstreamResponse.text();
    response.setHeader("Content-Type", upstreamResponse.headers.get("content-type") || "application/json");
    response.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=604800");
    response.status(upstreamResponse.status).send(body);
  } catch (error) {
    response.status(502).json({
      error: "No se pudo consultar Rest Countries.",
      detail: error instanceof Error ? error.message : String(error),
    });
  }
}
