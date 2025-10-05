export const fmtKWD = (n?: number) =>
  typeof n === "number"
    ? new Intl.NumberFormat("en-KW", {
        style: "currency",
        currency: "KWD",
        minimumFractionDigits: 2,
      }).format(n)
    : "—";
