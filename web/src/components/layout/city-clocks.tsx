"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface CityProps {
  code: string;
  /** IANA timezone */
  tz: string;
}

function formatTime(tz: string) {
  try {
    return new Intl.DateTimeFormat("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: tz,
    }).format(new Date());
  } catch {
    return "—";
  }
}

function CityClock({ code, tz }: CityProps) {
  const [time, setTime] = useState(() => formatTime(tz));

  useEffect(() => {
    setTime(formatTime(tz));
    const id = setInterval(() => setTime(formatTime(tz)), 30_000);
    return () => clearInterval(id);
  }, [tz]);

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-1 text-muted-foreground">
        <Clock
          className="h-2.5 w-2.5"
          strokeWidth={2.25}
          aria-hidden
        />
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest">
          {code}
        </span>
      </div>
      <span className="font-mono text-[11px] tabular-nums text-foreground/70">
        {time}
      </span>
    </div>
  );
}

const LEFT_CITIES: CityProps[] = [
  { code: "İST", tz: "Europe/Istanbul" },
  { code: "LON", tz: "Europe/London" },
  { code: "NYC", tz: "America/New_York" },
];
const RIGHT_CITIES: CityProps[] = [
  { code: "SF", tz: "America/Los_Angeles" },
  { code: "DXB", tz: "Asia/Dubai" },
  { code: "TYO", tz: "Asia/Tokyo" },
];

export function CityClocks({ side }: { side: "left" | "right" }) {
  const cities = side === "left" ? LEFT_CITIES : RIGHT_CITIES;
  return (
    <div className="hidden items-center gap-5 lg:flex">
      {cities.map((c) => (
        <CityClock key={c.code} {...c} />
      ))}
    </div>
  );
}
