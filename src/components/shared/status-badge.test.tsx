import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "./status-badge";
import { PermissionGate } from "./permission-gate";
import { PERMISSIONS } from "@/domain/permissions";
import type { AdminUser } from "@/domain/entities";

describe("StatusBadge", () => {
  it("renders the human label (not just a color)", () => {
    render(<StatusBadge group="publishing" value="published" />);
    expect(screen.getByText("Published")).toBeInTheDocument();
  });

  it("falls back gracefully for unknown values", () => {
    render(<StatusBadge group="publishing" value="mystery" />);
    expect(screen.getByText("mystery")).toBeInTheDocument();
  });
});

const user: AdminUser = {
  id: "u1",
  displayName: "T",
  email: "t@x.co",
  role: "menu-editor",
  status: "active",
  permissions: [PERMISSIONS.MENU_EDIT],
};

describe("PermissionGate", () => {
  it("renders children when permitted", () => {
    render(
      <PermissionGate user={user} permission={PERMISSIONS.MENU_EDIT}>
        <span>allowed</span>
      </PermissionGate>,
    );
    expect(screen.getByText("allowed")).toBeInTheDocument();
  });

  it("hides children when not permitted", () => {
    render(
      <PermissionGate user={user} permission={PERMISSIONS.ADMIN_MANAGE}>
        <span>secret</span>
      </PermissionGate>,
    );
    expect(screen.queryByText("secret")).not.toBeInTheDocument();
  });

  it("hides children for anonymous users", () => {
    render(
      <PermissionGate user={null} permission={PERMISSIONS.MENU_EDIT}>
        <span>secret</span>
      </PermissionGate>,
    );
    expect(screen.queryByText("secret")).not.toBeInTheDocument();
  });
});
