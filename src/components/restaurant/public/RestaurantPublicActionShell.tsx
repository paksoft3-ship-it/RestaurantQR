"use client";

import type { RestaurantPublicActionData } from "@/lib/restaurant-actions/restaurantActionTypes";
import { RestaurantFixedActionBar } from "./RestaurantFixedActionBar";
import { RestaurantFloatingContactMenu } from "./RestaurantFloatingContactMenu";

/**
 * Mounts the public restaurant action UI once: the fixed four-action bottom bar
 * plus the floating contact speed-dial. Receives a minimal serialized view model
 * so the rest of the restaurant layout can stay a server component.
 */
export function RestaurantPublicActionShell({
  actions,
}: {
  actions: RestaurantPublicActionData;
}) {
  return (
    <>
      <RestaurantFixedActionBar actions={actions} />
      <RestaurantFloatingContactMenu actions={actions} />
    </>
  );
}
