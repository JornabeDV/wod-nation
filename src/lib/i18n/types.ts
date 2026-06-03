export type Locale = "en" | "es";

export const LOCALES: Locale[] = ["en", "es"];
export const DEFAULT_LOCALE: Locale = "en";

export type Dictionary = typeof import("./dictionaries/en").dictionary;
