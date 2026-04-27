import { useState } from "react";

export default function ImageWithPlaceholder({
  src,
  alt,
  className = "",
  width,
  height,
  loading = "lazy",
  decoding = "async",
  fetchPriority,
  sizes,
  srcSet,
  onLoad,
  ...rest
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gray-100">
      {!loaded && (
        <div
          aria-hidden="true"
          className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-500"
        />
      )}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        decoding={decoding}
        fetchpriority={fetchPriority}
        sizes={sizes}
        srcSet={srcSet}
        className={`${className} ${loaded ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}
        onLoad={(e) => {
          setLoaded(true);
          onLoad?.(e);
        }}
        {...rest}
      />
    </div>
  );
}
