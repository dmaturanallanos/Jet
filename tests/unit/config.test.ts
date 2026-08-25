import { describe, expect, it } from "vitest";
import { appConfig, meetingPointStatuses, profileRoles, taskPriorities } from "@/config/app";

describe("central app config", () => {
  it("keeps Jet Scooter timezone centralized", () => {
    expect(appConfig.timezone).toBe("America/Santiago");
  });

  it("defines extensible operational values", () => {
    expect(meetingPointStatuses).toContain("review");
    expect(taskPriorities).toContain("urgent");
    expect(profileRoles).toEqual(["admin", "moderator", "scout"]);
  });
});
