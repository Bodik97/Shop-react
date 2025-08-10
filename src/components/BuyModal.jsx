// src/components/BuyModal.jsx
import { useEffect, useState } from "react";

export default function BuyModal({ open, product, onClose, onSubmit }) {
  const [form, setForm] = useState({ name: "", phone: "", address: "", comment: "" });

  useEffect(() => {
    if (open) setForm({ name: "", phone: "", address: "", comment: "" });
  }, [open]);

  if (!open) return null;

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const submit = (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) return alert("Ім’я і телефон — обов’язково");
    onSubmit({ ...form, productId: product.id, productTitle: product.title });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      {/* modal */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-5">
        <h3 className="text-lg font-semibold">Купити: {product?.title}</h3>
        <form className="mt-4 space-y-3" onSubmit={submit}>
          <input
            name="name" value={form.name} onChange={handle} placeholder="Ваше ім’я"
            className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            name="phone" value={form.phone} onChange={handle} placeholder="Телефон"
            className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            name="address" value={form.address} onChange={handle} placeholder="Адреса (за потреби)"
            className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            name="comment" value={form.comment} onChange={handle} placeholder="Коментар"
            className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-lg border px-3 py-2 hover:bg-gray-50">Відмінити</button>
            <button type="submit"
              className="flex-1 rounded-lg bg-blue-600 text-white px-3 py-2 hover:bg-blue-700">Підтвердити</button>
          </div>
        </form>
      </div>
    </div>
  );
}
