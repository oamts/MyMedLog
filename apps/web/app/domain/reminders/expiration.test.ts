import { getUpcomingExpirationAlerts } from "@/domain/reminders/expiration";
import type { Medicine } from "@mymedlog/contracts";
import { describe, expect, it } from "vitest";

function buildMedicine(overrides: Partial<Medicine>): Medicine {
  return {
    id: crypto.randomUUID(),
    name: "Amoxicilina",
    reminder: { type: "fixed_time", times: ["08:00"] },
    expirationAlert: {
      enabled: false,
      mode: "single",
      daysBefore: [30],
      includeOnExpirationDay: true
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  };
}

describe("getUpcomingExpirationAlerts", () => {
  it("returns no alerts when disabled", () => {
    const result = getUpcomingExpirationAlerts(
      [buildMedicine({ expiresOn: "2026-06-10" })],
      new Date("2026-05-01T10:00:00")
    );
    expect(result).toHaveLength(0);
  });

  it("returns single mode alert date", () => {
    const medicine = buildMedicine({
      expiresOn: "2026-06-10",
      expirationAlert: {
        enabled: true,
        mode: "single",
        daysBefore: [7],
        includeOnExpirationDay: false
      }
    });
    const result = getUpcomingExpirationAlerts([medicine], new Date("2026-05-01T10:00:00"));
    expect(result).toHaveLength(1);
    expect(result[0]?.targetDate).toBe("2026-06-03");
  });

  it("returns multiple mode including expiration day", () => {
    const medicine = buildMedicine({
      expiresOn: "2026-06-10",
      expirationAlert: {
        enabled: true,
        mode: "multiple",
        daysBefore: [30, 7, 1],
        includeOnExpirationDay: true
      }
    });
    const result = getUpcomingExpirationAlerts([medicine], new Date("2026-05-01T10:00:00"));
    expect(result.map((x) => x.targetDate)).toEqual([
      "2026-05-11",
      "2026-06-03",
      "2026-06-09",
      "2026-06-10"
    ]);
  });
});
