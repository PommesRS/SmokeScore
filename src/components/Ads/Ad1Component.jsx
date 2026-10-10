import { useEffect, useRef, useState } from "react";

export default function AdSense({ adSlot = "4101159974" }) {
  const adRef = useRef(null);
  const [ready, setReady] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    const checkWidth = () => {
      if (adRef.current?.offsetWidth > 0) {
        setReady(true);
      }
    };

    checkWidth();

    const observer = new ResizeObserver(checkWidth);

    if (adRef.current) {
      observer.observe(adRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!ready || initialized.current) return;

    initialized.current = true;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.error("AdSense error:", error);
    }
  }, [ready]);

  return (
    <div style={{ width: "100%", minWidth: 1 }}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{
          display: "block",
          width: "100%",
        }}
        data-ad-client="ca-pub-1989865456870851"
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}