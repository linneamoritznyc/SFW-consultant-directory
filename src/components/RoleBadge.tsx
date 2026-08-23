import type { Role } from "@/lib/types";

export const ROLE_COLORS: Record<Role, string> = {
  consultant: "#406d37", // leaf-600
  lab_tech: "#b3592f", // clay-500
};

export default function RoleBadge({ role }: { role: Role }) {
  const isConsultant = role === "consultant";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
        isConsultant ? "bg-leaf-100 text-leaf-800" : "bg-orange-100 text-clay-600"
      }`}
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{ background: ROLE_COLORS[role] }}
      />
      {isConsultant ? "Consultant" : "Lab-tech"}
    </span>
  );
}
