import { describe, it, expect } from "vitest";
import {
  PERMISSIONS,
  ROLES,
  permissionsForRole,
  roleHasPermission,
} from "./index";

describe("permissions", () => {
  it("super-administrator has every permission", () => {
    const all = Object.values(PERMISSIONS);
    const granted = permissionsForRole("super-administrator");
    for (const p of all) expect(granted).toContain(p);
  });

  it("menu-editor can edit menus but not manage admin", () => {
    expect(roleHasPermission("menu-editor", PERMISSIONS.MENU_EDIT)).toBe(true);
    expect(roleHasPermission("menu-editor", PERMISSIONS.ADMIN_MANAGE)).toBe(false);
  });

  it("analyst can view analytics but not edit restaurants", () => {
    expect(roleHasPermission("analyst", PERMISSIONS.ANALYTICS_VIEW)).toBe(true);
    expect(roleHasPermission("analyst", PERMISSIONS.RESTAURANT_EDIT)).toBe(false);
  });

  it("every role resolves to an array", () => {
    for (const role of ROLES) {
      expect(Array.isArray(permissionsForRole(role))).toBe(true);
    }
  });
});
