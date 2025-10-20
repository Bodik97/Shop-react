/* /api/np.js */
/* eslint-env node */

export default async function handler(req, res) {
  // ---------- CORS ----------
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET")
    return res.status(405).json({ ok: false, error: "Only GET" });

  // ---------- ENV ----------
  const KEY = process.env.NP_API_KEY || process.env.NOVA_POSHTA_API_KEY;
  if (!KEY)
    return res.status(500).json({ ok: false, error: "NP_API_KEY is missing" });

  // ---------- QUERY ----------
  const { op = "", areaRef = "", cityRef = "" } = req.query || {};
  const NP_URL = "https://api.novaposhta.ua/v2.0/json/";

  // ---------- helper: Nova Poshta call ----------
  const callNP = async (body) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000); // timeout 5s

    try {
      const r = await fetch(NP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: KEY, ...body }),
        signal: controller.signal,
      });

      clearTimeout(timer);
      const j = await r.json().catch(() => null);

      if (!j || j.success !== true) {
        const msg =
          Array.isArray(j?.errors) && j.errors.length
            ? j.errors.join(", ")
            : "Nova Poshta API error";
        throw new Error(msg);
      }
      return Array.isArray(j.data) ? j.data : [];
    } catch (err) {
      clearTimeout(timer);
      console.error("[NP]", err?.message || err);
      throw new Error(
        err?.name === "AbortError"
          ? "Nova Poshta timeout (5s)"
          : err?.message || "Nova Poshta fetch error"
      );
    }
  };

  try {
    // ---------- get areas ----------
    if (op === "areas") {
      const data = await callNP({
        modelName: "Address",
        calledMethod: "getAreas",
        methodProperties: {},
      });
      const out = data.map((a) => ({ ref: a.Ref, name: a.Description }));
      res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate");
      return res.status(200).json({ ok: true, data: out });
    }

    // ---------- get cities ----------
    if (op === "cities") {
      if (!areaRef) return res.status(200).json({ ok: true, data: [] });

      const data = await callNP({
        modelName: "Address",
        calledMethod: "getCities",
        methodProperties: { AreaRef: String(areaRef) },
      });

      const out = data.map((c) => ({ ref: c.Ref, name: c.Description }));
      res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
      return res.status(200).json({ ok: true, data: out });
    }

    // ---------- get warehouses ----------
    if (op === "warehouses") {
      const cr = String(cityRef || "").trim();
      if (!cr) return res.status(200).json({ ok: true, data: [] });

      const data = await callNP({
        modelName: "AddressGeneral",
        calledMethod: "getWarehouses",
        methodProperties: {
          CityRef: cr,
          Page: 1,
          Limit: 300,
          Language: "UA",
        },
      });

      const out = data.map((w) => ({
        ref: w.Ref,
        number: w.Number,
        name: w.Description,
      }));
      res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate");
      return res.status(200).json({ ok: true, data: out });
    }

    // ---------- invalid operation ----------
    return res.status(400).json({ ok: false, error: "Bad op" });
  } catch (e) {
    console.error("[NP] Error:", e?.message || e);
    return res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
}
