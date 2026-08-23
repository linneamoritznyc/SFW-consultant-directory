import CompletenessDemo from "@/components/CompletenessDemo";

export const metadata = { title: "For practitioners - Soil Food Web Directory" };

export default function ForPractitionersPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-semibold text-soil-900">For practitioners</h1>
      <p className="mt-2 leading-relaxed text-soil-600">
        This directory works for you when your structured fields are complete:
        growers filter and match on those fields, not on your bio alone. There
        is no seniority ranking here - a newly certified practitioner with the
        right crops, soils, and languages filled in outranks a veteran with an
        empty profile. Below you can see exactly how visibility works.
      </p>

      <div className="mt-4 rounded-lg bg-soil-100 p-4 text-sm text-soil-600">
        In production you sign in with a magic link (no password) to edit your
        own profile, toggle availability in one tap, and see your enquiry
        statistics. This demo lets you preview the completeness meter against
        the sample profiles.
      </div>

      <CompletenessDemo />

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-soil-900">
          What ranking actually rewards
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-soil-700">
          <li>
            <strong className="text-soil-900">Being findable:</strong> every
            empty field is a filter that can never return you. No soil types
            listed means no grower filtering by soil ever sees you.
          </li>
          <li>
            <strong className="text-soil-900">Availability accuracy:</strong>{" "}
            &quot;accepting clients&quot; is worth 15% of the match score, and
            it is the field most likely to go stale - keep it honest, both
            ways.
          </li>
          <li>
            <strong className="text-soil-900">Remote and samples flags:</strong>{" "}
            remote-capable practitioners surface in searches far outside their
            travel radius. If you take shipped samples, say so - it is a
            distinct service growers explicitly look for.
          </li>
          <li>
            <strong className="text-soil-900">Never seniority:</strong>{" "}
            certification year is displayed but not ranked on, by design.
          </li>
        </ul>
      </section>

      <section className="mt-10 rounded-xl border border-soil-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-soil-900">Not certified yet?</h2>
        <p className="mt-2 text-soil-700">
          Listing here requires certification through the Soil Food Web
          School&apos;s consultant or lab-tech programmes.
        </p>
        <a
          href="https://soilfoodweb.com/"
          target="_blank"
          rel="noopener"
          className="mt-3 inline-block rounded-lg bg-leaf-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-leaf-700"
        >
          Explore courses at soilfoodweb.com ↗
        </a>
      </section>
    </div>
  );
}
