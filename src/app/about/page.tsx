import Link from "next/link";

export const metadata = { title: "More information - Soil Food Web Directory" };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold text-soil-900">{title}</h2>
      <div className="mt-3 space-y-3 leading-relaxed text-soil-700">{children}</div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-semibold text-soil-900">More information</h1>
      <p className="mt-2 text-soil-600">
        What the roles mean, how matching works, and how your data is handled.
      </p>

      <Section title="Lab-tech or consultant - which do I need?">
        <p>
          <strong className="text-soil-900">Lab-techs</strong> are certified in
          soil microscopy and biological assessment. They look at your soil
          under a microscope and tell you what is living in it: which
          organisms are present, in what balance, and what that means for your
          crop. An assessment is the most affordable way to engage with the
          network - many lab-techs analyse shipped samples, so you do not need
          one nearby.
        </p>
        <p>
          <strong className="text-soil-900">Consultants</strong> are certified
          to design and guide a full biological management programme:
          interpreting assessments, building compost and extract protocols,
          planning a transition away from synthetic inputs, and following your
          land across seasons. A consulting engagement is a bigger commitment
          than an assessment.
        </p>
        <p>
          A common path: start with a lab-tech assessment to understand where
          your soil stands, then bring in a consultant if the results call for
          a programme. Some practitioners hold both certifications and can
          take you through the whole journey.
        </p>
        <p>
          If you are unsure, the{" "}
          <Link href="/intake" className="text-leaf-700 hover:underline">
            guided matching
          </Link>{" "}
          takes your problem into account - diagnostic questions steer towards
          lab-techs first, programme-level problems towards consultants.
        </p>
      </Section>

      <Section title="How matching works">
        <p>
          Every profile carries structured fields - crops worked, soil types,
          languages with proficiency, practices, availability, and service
          area. When you describe your situation, we score practitioners on
          ecological similarity to your region (30%), crop experience (25%),
          shared language (20%), whether they are taking clients (15%), and
          whether they can reach you on-site or remotely (10%).
        </p>
        <p>
          Every match comes with a plain-language explanation of why that
          person was suggested. We never rank by seniority: a newly certified
          practitioner with the right experience outranks a veteran with the
          wrong one.
        </p>
      </Section>

      <Section title="Why ecoregions instead of countries?">
        <p>
          Political borders say little about soil biology. A grower in
          southern Spain and a practitioner in coastal California share a
          Mediterranean biome - similar rainfall pattern, similar soil
          challenges - despite being 9,000 km apart. Two farms 300 km apart in
          Chile can have nothing transferable between them.
        </p>
        <p>
          We use the RESOLVE Ecoregions 2017 classification (846 ecoregions in
          14 biomes) to match you with practitioners who work in ecologically
          similar places, wherever they are. One honest caveat: ecoregion is a
          biodiversity classification, not a soil map - treat it as a strong
          hint, not a guarantee of identical soils.
        </p>
      </Section>

      <Section title="Your privacy, and theirs">
        <p>
          Practitioner email addresses and phone numbers are never published.
          Enquiries go through a relay form and land directly in the
          practitioner&apos;s inbox; they reply to you from there. Practitioners
          choose whether to be publicly listed, and can withdraw at any time.
        </p>
      </Section>

      <p className="mt-12 text-sm text-soil-500">
        Ready?{" "}
        <Link href="/directory" className="text-leaf-700 hover:underline">
          Browse the directory
        </Link>{" "}
        or{" "}
        <Link href="/intake" className="text-leaf-700 hover:underline">
          get matched in seven questions
        </Link>
        .
      </p>
    </div>
  );
}
