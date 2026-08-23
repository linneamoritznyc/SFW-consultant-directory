"use client";

import dynamic from "next/dynamic";
import type { Practitioner } from "@/lib/types";

// Client wrapper so the server-rendered profile page can lazy-load the
// map without SSR (maplibre needs the DOM).
const ProfileMap = dynamic(() => import("./ProfileMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[300px] items-center justify-center rounded-xl border border-soil-200 bg-soil-100 text-sm text-soil-500">
      Loading map…
    </div>
  ),
});

export default function ProfileMapSection({ practitioner }: { practitioner: Practitioner }) {
  return <ProfileMap practitioner={practitioner} />;
}
