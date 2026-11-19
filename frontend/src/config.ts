export const SCHOOL_NAME = "Bright Star School";
export const API_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/+$/, "")
    : "http://localhost:4000/api");
