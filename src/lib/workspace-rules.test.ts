import { describe, expect, it } from "vitest";
import { canManageTeam, canUseDeveloperTools, checkMemberChange, slugify } from "./workspace-rules";

describe("workspace rules", () => {
  it("editors cannot open the developer console; owner/admin/developer can", () => {
    expect(canUseDeveloperTools("editor")).toBe(false);
    expect(canUseDeveloperTools("developer")).toBe(true);
    expect(canUseDeveloperTools("admin")).toBe(true);
    expect(canUseDeveloperTools("owner")).toBe(true);
  });

  it("only owners and admins manage the team", () => {
    expect(canManageTeam("developer")).toBe(false);
    expect(canManageTeam("editor")).toBe(false);
    expect(canManageTeam("admin")).toBe(true);
  });

  it("the last owner cannot be removed or demoted", () => {
    expect(checkMemberChange("owner", { kind: "remove", targetRole: "owner" }, 1)).not.toBeNull();
    expect(checkMemberChange("owner", { kind: "role", targetRole: "owner", nextRole: "admin" }, 1)).not.toBeNull();
    expect(checkMemberChange("owner", { kind: "remove", targetRole: "owner" }, 2)).toBeNull();
  });

  it("an admin cannot promote someone to owner", () => {
    expect(checkMemberChange("admin", { kind: "role", targetRole: "editor", nextRole: "owner" }, 1)).not.toBeNull();
    expect(checkMemberChange("admin", { kind: "role", targetRole: "editor", nextRole: "developer" }, 1)).toBeNull();
  });

  it("slugify makes url-safe names", () => {
    expect(slugify("Café Één BV")).toBe("cafe-een-bv");
  });
});

import { isValidWorkspaceSlug, workspaceSlug } from "./workspace-rules";
describe("workspace address rout.be/w/<name>", () => {
  it("ends in exactly 2 digits", () => expect(workspaceSlug("Acme Studio", 7)).toBe("acme-studio07"));
  it("is at least 6 characters for short names", () => expect(workspaceSlug("AB", 42).length).toBeGreaterThanOrEqual(6));
  it("rejects a slug without 2 trailing digits", () => expect(isValidWorkspaceSlug("acmeteam")).toBe(false));
  it("rejects slugs shorter than 6", () => expect(isValidWorkspaceSlug("ab12")).toBe(false));
  it("accepts a valid slug", () => expect(isValidWorkspaceSlug("acme42")).toBe(true));
});
