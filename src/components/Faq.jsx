// src/components/Faq.jsx
export default function Faq({ q, a }) {
  return (
    <details className="group py-4 cursor-pointer transition">
      <summary className="flex items-center justify-between text-[15px] sm:text-base font-semibold text-gray-900">
        <span>{q}</span>
        <span
          className="ml-3 flex h-6 w-6 items-center justify-center rounded-full
                     bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs
                     group-open:rotate-180 transition-transform duration-300"
        >
          ▾
        </span>
      </summary>
      <p
        className="mt-3 text-gray-600 text-[14px] sm:text-[15px] leading-relaxed
                   group-open:animate-fadeIn"
      >
        {a}
      </p>
    </details>
  );
}
