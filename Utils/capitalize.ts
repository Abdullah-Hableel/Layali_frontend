export const capitalizeWords = (str?: string) =>
  typeof str === "string"
    ? str.replace(/\b\w/g, (char) => char.toUpperCase())
    : "";
