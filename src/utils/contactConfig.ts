import type { ContactType } from "./types";

export const CONTACT_TYPES: ContactType[] = ["general", "enquiry", "bug", "suggestion", "misinformation"];

export const CONTACT_TYPE_LABELS: Record<ContactType, string> = {
  general: "General",
  enquiry: "Enquiry",
  bug: "Bug",
  suggestion: "Suggestion",
  misinformation: "Misinformation",
};

export const CONTACT_TYPE_PLACEHOLDERS: Record<ContactType, string> = {
  general: "Anything you'd like to share…",
  enquiry: "What would you like to know?",
  bug: "What happened? What did you expect to happen? Any steps to reproduce…",
  suggestion: "What would you like to see on the site?",
  misinformation: "What incorrect information would you like to report?",
};
 
export const CONTACT_TYPE_ICONS: Record<ContactType, string> = {
  general: "✉",
  enquiry: "?",
  bug: "🐛",
  suggestion: "💡",
  misinformation: "⚠",
};

export const CONTACT_TYPE_BADGE_STYLES: Record<ContactType, { background: string; color: string; borderColor: string }> = {
  general:    { background: "var(--badge-general-bg)",    color: "var(--badge-general-color)",    borderColor: "var(--badge-general-border)" },
  enquiry:    { background: "var(--badge-enquiry-bg)",    color: "var(--badge-enquiry-color)",    borderColor: "var(--badge-enquiry-border)" },
  bug:        { background: "var(--badge-bug-bg)",        color: "var(--badge-bug-color)",        borderColor: "var(--badge-bug-border)" },
  suggestion: { background: "var(--badge-suggestion-bg)", color: "var(--badge-suggestion-color)", borderColor: "var(--badge-suggestion-border)" },
  misinformation: { background: "var(--badge-misinformation-bg)", color: "var(--badge-misinformation-color)", borderColor: "var(--badge-misinformation-border)" },

};
