// src/components/BulletTrajectory.jsx
// Декоративна бренд-анімація хедера блогу: куля летить по пунктирній дузі
// від лейбла «Блог» (зверху-зліва) до цілі в правому нижньому куті й «влучає»
// (пульс-кільце). Чисто декоративна (aria-hidden, pointer-events-none);
// поважає prefers-reduced-motion.
import { useReducedMotion } from "framer-motion";

// Дуга від (зверху-зліва) до (правий нижній кут).
const PATH = "M 10 16 Q 102 22 190 48";
const TARGET = { x: 190, y: 48 };
const DUR = "2.6s";

export default function BulletTrajectory({ className = "inset-0" }) {
  const reduce = useReducedMotion();

  return (
    <div aria-hidden="true" className={`pointer-events-none absolute ${className}`}>
      {/* slice = масштаб «cover» з прив'язкою до правого-нижнього кута:
          ціль завжди в куті, кружечки не спотворюються. */}
      <svg viewBox="0 0 200 56" preserveAspectRatio="xMaxYMax slice" className="w-full h-full text-accent">
        {/* Пунктирна траєкторія */}
        <path d={PATH} fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="1.5 5" strokeLinecap="round" opacity="0.3" />

        {/* Ціль у правому нижньому куті */}
        <g>
          <circle cx={TARGET.x} cy={TARGET.y} r="5" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.35" />
          <circle cx={TARGET.x} cy={TARGET.y} r="1.4" fill="currentColor" opacity="0.55" />
          {!reduce && (
            <circle cx={TARGET.x} cy={TARGET.y} fill="none" stroke="currentColor" strokeWidth="1.2">
              <animate attributeName="r" values="2.5;2.5;11" keyTimes="0;0.85;1" dur={DUR} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0;0;0.5;0" keyTimes="0;0.82;0.9;1" dur={DUR} repeatCount="indefinite" />
            </circle>
          )}
        </g>

        {/* Куля */}
        <circle r="2.2" cx={reduce ? TARGET.x : 0} cy={reduce ? TARGET.y : 0} fill="currentColor">
          {!reduce && (
            <>
              <animateMotion path={PATH} dur={DUR} repeatCount="indefinite" calcMode="linear" />
              <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.05;0.9;1" dur={DUR} repeatCount="indefinite" />
            </>
          )}
        </circle>
      </svg>
    </div>
  );
}
