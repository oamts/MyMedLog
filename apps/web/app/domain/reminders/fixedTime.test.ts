import { describe, expect, it } from "vitest";
import type { Medicine } from "@mymedlog/contracts";
import { getNextFixedReminderAt, getUpcomingFixedReminders } from "@/domain/reminders/fixedTime";

function buildMedicine(times: string[]): Medicine {
  return {
    id: crypto.randomUUID(),
    name: "Dipirona",
    expiresOn: undefined,
    notes: undefined,
    expirationAlert: {
      enabled: false,
      mode: "single",
      daysBefore: [30],
      includeOnExpirationDay: true
    },
    reminder: {
      type: "fixed_time",
      times
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

describe("getNextFixedReminderAt", () => {
  it("returns next reminder on same day", () => {
    const medicine = buildMedicine(["08:00", "20:00"]);
    const now = new Date(2026, 4, 8, 7, 0, 0, 0);

    const next = getNextFixedReminderAt(medicine, now);

    expect(next).not.toBeNull();
    expect(next?.getHours()).toBe(8);
    expect(next?.getMinutes()).toBe(0);
    expect(next?.getDate()).toBe(now.getDate());
  });

  it("rolls over to next day after last reminder", () => {
    const medicine = buildMedicine(["08:00", "20:00"]);
    const now = new Date(2026, 4, 8, 22, 0, 0, 0);

    const next = getNextFixedReminderAt(medicine, now);

    expect(next).not.toBeNull();
    expect(next?.getHours()).toBe(8);
    expect(next?.getDate()).toBe(now.getDate() + 1);
  });

  it("returns null when no valid fixed times exist", () => {
    const medicine = buildMedicine(["99:00"]);

    const next = getNextFixedReminderAt(medicine);

    expect(next).toBeNull();
  });
});

describe("getUpcomingFixedReminders", () => {
  it("returns sorted reminders by next timestamp", () => {
    const now = new Date(2026, 4, 8, 7, 30, 0, 0);
    const first = buildMedicine(["08:00"]);
    const second = buildMedicine(["09:00"]);

    const result = getUpcomingFixedReminders([second, first], now);

    expect(result[0]?.medicineId).toBe(first.id);
    expect(result[1]?.medicineId).toBe(second.id);
  });
});
