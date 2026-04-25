"use client";

export default function TodayDate() {
  return (
    <span>
      {new Date().toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })}
    </span>
  );
}
