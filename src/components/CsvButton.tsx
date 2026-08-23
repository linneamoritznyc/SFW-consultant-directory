"use client";

export default function CsvButton({
  filename,
  header,
  rows,
}: {
  filename: string;
  header: string[];
  rows: (string | number)[][];
}) {
  const download = () => {
    const esc = (v: string | number) => {
      const s = String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = [header, ...rows].map((r) => r.map(esc).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={download}
      className="rounded-lg border border-soil-300 bg-white px-3 py-1.5 text-xs font-medium text-soil-700 hover:bg-soil-100"
    >
      Export CSV
    </button>
  );
}
