import { useState } from "react";

export default function ImageWithPlaceholder({ src, alt, className }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gray-100">
      {!loaded && (
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-500" />
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${loaded ? "opacity-100" : "opacity-0"} transition-opacity duration-500`}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
