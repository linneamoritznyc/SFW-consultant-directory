import { Suspense } from "react";
import DirectoryClient from "@/components/DirectoryClient";
import { PRACTITIONERS } from "@/lib/data";

export const metadata = { title: "Browse practitioners — Soil Food Web Directory" };

export default function DirectoryPage() {
  // Server component hands the dataset to the client shell. In production this
  // becomes a filtered Postgres query driven by searchParams; at demo scale the
  // client filters locally, which also gives instant facet counts.
  return (
    <Suspense>
      <DirectoryClient practitioners={PRACTITIONERS} />
    </Suspense>
  );
}
