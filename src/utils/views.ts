/** All top-level views the app can route to. */
export type View =
  | "home" | "calendar" | "list" | "map" | "event"
  | "login" | "signup" | "account"
  | "add-event" | "edit-event" | "delete-event"
  | "admin-messages" | "admin-home"
  | "contact" | "privacy";

/** URL path for each navigable view. Views without an entry have no direct URL. */
export const VIEW_PATHS: Partial<Record<View, string>> = {
  calendar:          "/",
  list:              "/list",
  map:               "/map",
  home:              "/home",
  login:             "/login",
  signup:            "/signup",
  account:           "/account",
  contact:           "/contact",
  privacy:           "/privacy",
  "admin-messages":  "/admin-messages",
  "admin-home":      "/admin-home",
};

/** Derived reverse map: URL path → View. */
export const PATH_TO_VIEW: Record<string, View> = Object.fromEntries(
  Object.entries(VIEW_PATHS).map(([v, p]) => [p, v as View])
);

/** Browser tab title for each view. */
export const VIEW_TITLES: Partial<Record<View, string>> = {
  calendar:          "Calendar | BSL Calendar",
  list:              "Events | BSL Calendar",
  map:               "Map | BSL Calendar",
  home:              "Home | BSL Calendar",
  contact:           "Contact | BSL Calendar",
  privacy:           "Privacy Policy | BSL Calendar",
  login:             "Sign In | BSL Calendar",
  signup:            "Create Account | BSL Calendar",
  account:           "Account | BSL Calendar",
  "admin-messages":  "Messages | BSL Calendar",
  "admin-home":      "Edit Home | BSL Calendar",
};
