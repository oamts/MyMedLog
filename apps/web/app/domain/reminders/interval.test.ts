import {
  getNextIntervalReminderAt,
  getUpcomingIntervalReminders
} from "@/domain/reminders/interval";
import type { Medicine } from "@mymedlog/contracts";
import { describe, expect, it } from "vitest";

function buildIntervalMedicine(everyHours: 6 | 8 | 12, startsAt: string): Medicine {
  return {
    id: crypto.randomUUID(),
    name: `Med ${everyHours}h`,
    expiresOn: undefined,
    notes: undefined,
    expirationAlert: {
      enabled: false,
      mode: "single",
      daysBefore: [30],
      includeOnExpirationDay: true
    },
    reminder: {
      type: "interval_hours",
      everyHours,
      startsAt
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

describe("getNextIntervalReminderAt", () => {
  it("returns start anchor when now is before startsAt", () => {
    const medicine = buildIntervalMedicine(6, "2026-05-08T12:00:00.000Z");
    const now = new Date("2026-05-08T10:00:00.000Z");

    const next = getNextIntervalReminderAt(medicine, now);

    expect(next?.toISOString()).toBe("2026-05-08T12:00:00.000Z");
  });

  it("returns next slot when now is between intervals", () => {
    const medicine = buildIntervalMedicine(8, "2026-05-08T00:00:00.000Z");
    const now = new Date("2026-05-08T09:30:00.000Z");

    const next = getNextIntervalReminderAt(medicine, now);

    expect(next?.toISOString()).toBe("2026-05-08T16:00:00.000Z");
  });

  it("moves to next interval when now is exactly on trigger", () => {
    const medicine = buildIntervalMedicine(6, "2026-05-08T00:00:00.000Z");
    const now = new Date("2026-05-08T12:00:00.000Z");

    const next = getNextIntervalReminderAt(medicine, now);

    expect(next?.toISOString()).toBe("2026-05-08T18:00:00.000Z");
  });

  it("returns null for invalid startsAt", () => {
    const invalid = buildIntervalMedicine(12, "invalid");

    const next = getNextIntervalReminderAt(invalid);

    expect(next).toBeNull();
  });
});

describe("getUpcomingIntervalReminders", () => {
  it("returns reminders sorted by nextAt", () => {
    const now = new Date("2026-05-08T10:00:00.000Z");
    const first = buildIntervalMedicine(6, "2026-05-08T06:00:00.000Z");
    const second = buildIntervalMedicine(8, "2026-05-08T08:00:00.000Z");

    const result = getUpcomingIntervalReminders([second, first], now);

    expect(result[0]?.medicineId).toBe(first.id);
    expect(result[1]?.medicineId).toBe(second.id);
  });
});
