// SPDX-License-Identifier: Proprietary (code) + DPCGL (SRD content)
// This code is original work by the project author.
// Game rules referenced from the Daggerheart SRD are used under the
// Darrington Press Community Gaming License.
// Full license: https://darringtonpress.com/license/
// SRD reference: https://daggerheartsrd.com/
export const APP_ROUTES = {
  home: "/",
  characters: "/characters",
  builder: "/builder",
  // DPCGL compliance: keep the legal attribution page reachable through app routing.
  legal: "/legal",
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
