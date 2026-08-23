"use client";

import { useState } from "react";
import { useLocale } from "./LocaleProvider";

export default function ContactForm({ practitionerSlug }: { practitionerSlug: string }) {
  const { t } = useLocale();
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          practitionerSlug,
          senderName: data.get("name"),
          senderEmail: data.get("email"),
          message: data.get("message"),
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <p className="mt-3 rounded-lg bg-leaf-50 p-4 text-sm text-leaf-800">
        {t("contact_sent")}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-3">
      <p className="text-xs text-soil-500">{t("contact_lang_note")}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          name="name"
          required
          placeholder={t("contact_name")}
          className="rounded-lg border border-soil-300 px-3 py-2 text-sm focus:border-leaf-500 focus:outline-none"
        />
        <input
          name="email"
          type="email"
          required
          placeholder={t("contact_email")}
          className="rounded-lg border border-soil-300 px-3 py-2 text-sm focus:border-leaf-500 focus:outline-none"
        />
      </div>
      <textarea
        name="message"
        required
        rows={4}
        placeholder={t("contact_msg")}
        className="w-full rounded-lg border border-soil-300 px-3 py-2 text-sm focus:border-leaf-500 focus:outline-none"
      />
      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded-lg bg-leaf-600 px-5 py-2 text-sm font-medium text-white hover:bg-leaf-700 disabled:opacity-50"
      >
        {status === "sending" ? t("contact_sending") : t("contact_send")}
      </button>
      {status === "error" && (
        <p className="text-sm text-clay-600">{t("contact_error")}</p>
      )}
    </form>
  );
}
