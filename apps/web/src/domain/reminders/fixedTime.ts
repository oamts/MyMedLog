import type { Medicine } from "@mymedlog/contracts";

function parseHHmm(value: string): { hours: number; minutes: number } | null {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
  if (!match) {
    return null;
  }

  return {
    hours: Number(match[1]),
    minutes: Number(match[2])
  };
}

function atLocalTime(base: Date, hours: number, minutes: number, dayOffset = 0): Date {
  return new Date(
    base.getFullYear(),
    base.getMonth(),
    base.getDate() + dayOffset,
    hours,
    minutes,
    0,
    0
  );
}

export function getNextFixedReminderAt(medicine: Medicine, now: Date = new Date()): Date | null {
  if (medicine.reminder.type !== "fixed_time") {
    return null;
  }

  const candidates = medicine.reminder.times
    .map(parseHHmm)
    .filter((value): value is NonNullable<typeof value> => value !== null)
    .map(({ hours, minutes }) => atLocalTime(now, hours, minutes));

  if (candidates.length === 0) {
    return null;
  }

  candidates.sort((a, b) => a.getTime() - b.getTime());

  const nextToday = candidates.find((candidate) => candidate.getTime() > now.getTime());
  if (nextToday) {
    return nextToday;
  }

  const firstCandidate = candidates[0];
  return atLocalTime(now, firstCandidate.getHours(), firstCandidate.getMinutes(), 1);
}

export function getUpcomingFixedReminders(
  medicines: Medicine[],
  now: Date = new Date()
): Array<{ medicineId: string; medicineName: string; nextAt: string }> {
  return medicines
    .map((medicine) => {
      const next = getNextFixedReminderAt(medicine, now);
      if (!next) {
        return null;
      }

      return {
        medicineId: medicine.id,
        medicineName: medicine.name,
        nextAt: next.toISOString()
      };
    })
    .filter((value): value is NonNullable<typeof value> => value !== null)
    .sort((a, b) => a.nextAt.localeCompare(b.nextAt));
}
