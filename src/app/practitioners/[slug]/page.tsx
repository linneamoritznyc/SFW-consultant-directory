import Link from "next/link";
import { notFound } from "next/navigation";
import { PRACTITIONERS, bySlug } from "@/lib/data";
import { label } from "@/lib/vocab";
import RoleBadge from "@/components/RoleBadge";
import ContactForm from "@/components/ContactForm";

export function generateStaticParams() {
  return PRACTITIONERS.map((p) => ({ slug: p.slug }));
}

export default function ProfilePage({ params }: { params: { slug: string } }) {
  const p = bySlug(params.slug);
  if (!p) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/directory" className="text-sm text-leaf-700 hover:underline">
        ← Back to directory
      </Link>

      {/* Header (PRD §6.4) */}
      <header className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold text-soil-900">{p.displayName}</h1>
          <p className="mt-1 text-soil-600">
            {p.city}, {p.adminArea} · {p.countryCode}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <div className="flex gap-1.5">
            {p.roles.map((r) => (
              <RoleBadge key={r} role={r} />
            ))}
          </div>
          <p className="text-xs text-soil-500">
            {p.certifications
              .map((c) => `${c.program} certified ${c.year}`)
              .join(" · ")}
          </p>
          {p.acceptingClients ? (
            <span className="rounded-full bg-leaf-100 px-2.5 py-0.5 text-xs font-medium text-leaf-800">
              Accepting clients
            </span>
          ) : (
            <span className="rounded-full bg-soil-100 px-2.5 py-0.5 text-xs text-soil-500">
              Not currently taking clients
            </span>
          )}
        </div>
      </header>

      {/* Structured summary */}
      <dl className="mt-6 grid grid-cols-1 gap-4 rounded-xl border border-soil-200 bg-white p-5 sm:grid-cols-2">
        <SummaryRow term="Crops & systems" detail={p.crops.map(label).join(", ")} />
        <SummaryRow term="Soil types" detail={p.soilTypes.map(label).join(", ")} />
        <SummaryRow
          term="Languages"
          detail={p.languages
            .map((l) => `${label(l.slug)} (${l.proficiency})`)
            .join(", ")}
        />
        <SummaryRow
          term="Practices"
          detail={p.practices.map(label).join(", ")}
        />
        <SummaryRow
          term="Ecoregion"
          detail={`${p.ecoregion} — ${p.biome} (${p.realm})`}
        />
        <SummaryRow
          term="Service area"
          detail={[
            p.travelRadiusKm ? `Travels up to ${p.travelRadiusKm} km` : null,
            p.servicesRemotely ? "Works remotely worldwide" : null,
          ]
            .filter(Boolean)
            .join(" · ") || "On-site only"}
        />
      </dl>
      <p className="mt-2 text-xs text-soil-500">
        Ecoregion follows RESOLVE Ecoregions 2017 — a coarse ecological
        similarity signal, not a statement of soil equivalence.
      </p>

      {/* The existing long-form bio, unabridged (PRD §6.4) */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-soil-900">About</h2>
        <p className="mt-2 whitespace-pre-line leading-relaxed text-soil-700">
          {p.bio}
        </p>
        {p.websiteUrl && (
          <p className="mt-3 text-sm">
            <a
              href={p.websiteUrl}
              className="text-leaf-700 hover:underline"
              rel="noopener noreferrer"
            >
              Website
            </a>
          </p>
        )}
      </section>

      {/* Contact via relay form; raw email never exposed (PRD §8.2) */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-soil-900">
          Contact {p.displayName.split(" ")[0]}
        </h2>
        <p className="mt-1 text-sm text-soil-600">
          Messages are relayed directly to the practitioner. Their contact
          details are never published.
        </p>
        <ContactForm practitionerSlug={p.slug} />
      </section>
    </div>
  );
}

function SummaryRow({ term, detail }: { term: string; detail: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-soil-500">
        {term}
      </dt>
      <dd className="mt-0.5 text-sm text-soil-800">{detail}</dd>
    </div>
  );
}
