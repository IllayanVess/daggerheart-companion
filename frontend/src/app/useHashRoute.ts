// SPDX-License-Identifier: Proprietary (code) + DPCGL (SRD content)
// This code is original work by the project author.
// Game rules referenced from the Daggerheart SRD are used under the
// Darrington Press Community Gaming License.
// Full license: https://darringtonpress.com/license/
// SRD reference: https://daggerheartsrd.com/
import { useEffect, useState } from "react";

import { APP_ROUTES, normalizeRoute, type AppRoute } from "./routes";

function readHashRoute(): AppRoute {
  const hashValue = window.location.hash.replace(/^#/, "");
  return normalizeRoute(hashValue || APP_ROUTES.home);
}

export function useHashRoute(): AppRoute {
  const [route, setRoute] = useState<AppRoute>(readHashRoute);

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(readHashRoute());
    };

    window.addEventListener("hashchange", handleHashChange);
    handleHashChange();

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  return route;
}
