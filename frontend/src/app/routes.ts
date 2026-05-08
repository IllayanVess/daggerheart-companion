export const APP_ROUTES = {
  home: "/",
  characters: "/characters",
  builder: "/builder",
  gmHub: "/gm-tools",
  gmAdversaries: "/gm-tools/adversaries",
  gmNpcs: "/gm-tools/npcs",
  gmEnvironments: "/gm-tools/environments",
  gmDice: "/gm-tools/dice",
  gmSessionTracker: "/gm-tools/session-tracker",
  gmEncounterBoard: "/gm-tools/encounter-board",
} as const;

export type AppRoute = (typeof APP_ROUTES)[keyof typeof APP_ROUTES];

const KNOWN_ROUTES = new Set<string>(Object.values(APP_ROUTES));

export function normalizeRoute(route: string): AppRoute {
  const trimmedRoute = route.trim() || APP_ROUTES.home;
  const normalizedRoute = trimmedRoute.startsWith("/") ? trimmedRoute : `/${trimmedRoute}`;
  return KNOWN_ROUTES.has(normalizedRoute) ? (normalizedRoute as AppRoute) : APP_ROUTES.home;
}

export function navigateTo(route: AppRoute) {
  window.location.hash = route;
}
