import IntakeForm from "@/components/IntakeForm";

export const metadata = { title: "Get matched - Soil Food Web Directory" };

export default function IntakePage() {
  return (
    <div className="mx-auto w-full max-w-xl px-4 py-10">
      <IntakeForm />
    </div>
  );
}
