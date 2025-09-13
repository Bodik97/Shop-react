/* /api/np.js */
/* eslint-env node */

export default async function handler(req, res) {
    // CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(204).end();
    if (req.method !== "GET") return res.status(405).json({ ok: false, error: "Only GET" });
  
    const KEY = process.env.NP_API_KEY || process.env.NOVA_POSHTA_API_KEY;
    if (!KEY) return res.status(500).json({ ok: false, error: "NP_API_KEY is missing" });
  
    const { op = "", q = "", areaRef = "", cityRef = "", city = "" } = req.query || {};
    const NP_URL = "https://api.novaposhta.ua/v2.0/json/";
  
    const callNP = async (body) => {
      const r = await fetch(NP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: KEY, ...body }),
      });
      const j = await r.json().catch(() => null);
      if (!j || j.success !== true) {
        const msg = Array.isArray(j?.errors) && j.errors.length ? j.errors.join(", ") : "Nova Poshta API error";
        throw new Error(msg);
      }
      return Array.isArray(j.data) ? j.data : [];
    };
  
    try {
      // 1) Області
      if (op === "areas") {
        const data = await callNP({
          modelName: "Address",
          calledMethod: "getAreas",
          methodProperties: {},
        });
        const out = data.map(a => ({ ref: a.Ref, name: a.Description }));
        return res.status(200).json({ ok: true, data: out });
      }
  
      // 2) Міста в області
      if (op === "cities") {
        if (!areaRef) return res.status(200).json({ ok: true, data: [] });
        const props = { AreaRef: String(areaRef), Page: 1, Limit: 200, Language: "UA" };
        if (q) props.FindByString = String(q);
        const data = await callNP({
          modelName: "AddressGeneral",
          calledMethod: "getSettlements",
          methodProperties: props,
        });
        const out = data.map(s => ({
          ref: s.Ref || s.SettlementRef || s.DeliveryCity,
          name: s.Present || s.Description,
          area: s.AreaDescription || s.Area,
        }));
        return res.status(200).json({ ok: true, data: out });
      }
  
      // 3) Відділення міста
      if (op === "warehouses") {
        let cr = String(cityRef || "").trim();
        if (!cr && city) {
          const found = await callNP({
            modelName: "AddressGeneral",
            calledMethod: "getSettlements",
            methodProperties: { FindByString: String(city).trim(), Page: 1, Limit: 1, Language: "UA" },
          });
          cr = found?.[0]?.DeliveryCity || found?.[0]?.Ref || "";
        }
        if (!cr) return res.status(200).json({ ok: true, data: [] });
  
        const data = await callNP({
          modelName: "AddressGeneral",
          calledMethod: "getWarehouses",
          methodProperties: { CityRef: cr, Page: 1, Limit: 200, Language: "UA" },
        });
        const out = data.map(w => ({ ref: w.Ref, number: w.Number, name: w.Description }));
        return res.status(200).json({ ok: true, data: out });
      }
  
      return res.status(400).json({ ok: false, error: "Bad op" });
    } catch (e) {
      return res.status(500).json({ ok: false, error: String(e?.message || e) });
    }
  }
  