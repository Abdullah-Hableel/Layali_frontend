export const formatMMDDYYYY = (d: Date): string =>
  `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(
    2,
    "0"
  )}-${d.getFullYear()}`;

export const todayAtMidnight = (): Date => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export const isTodayOrFuture = (dateStr?: string): boolean => {
  if (!dateStr) return false;
  const eventDate = new Date(dateStr);
  eventDate.setHours(0, 0, 0, 0);
  return eventDate.getTime() >= todayAtMidnight().getTime();
};

export const toGBDate = (iso?: string): string =>
  iso
    ? new Date(iso).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "—";
