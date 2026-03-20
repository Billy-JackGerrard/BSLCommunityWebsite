import type { ContactType } from "./types";

export const CONTACT_TYPES: ContactType[] = ["general", "enquiry", "bug", "suggestion"];

export const CONTACT_TYPE_LABELS: Record<ContactType, string> = {
  general: "General",
  enquiry: "Enquiry",
  bug: "Bug Report",
  suggestion: "Suggestion",
};

export const CONTACT_TYPE_PLACEHOLDERS: Record<ContactType, string> = {
  general: "Anything you'd like to share…",
  enquiry: "What would you like to know?",
  bug: "What happened? What did you expect to happen? Any steps to reproduce…",
  suggestion: "What would you like to see on the site?",
};

export const CONTACT_TYPE_ICONS: Record<ContactType, string> = {
  general: "✉",
  enquiry: "?",
  bug: "🐛",
  suggestion: "💡",
};
