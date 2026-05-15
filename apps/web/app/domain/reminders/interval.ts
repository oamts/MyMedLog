import type { Medicine } from "@mymedlog/contracts";

export function getNextIntervalReminderAt(medicine: Medicine, now: Date = new Date()): Date | null {
  if (medicine.reminder.type !== "interval_hours") {
    return null;
  }

  const startsAt = new Date(medicine.reminder.startsAt);
  if (Number.isNaN(startsAt.getTime())) {
    return null;
  }

  if (now.getTime() < startsAt.getTime()) {
    return startsAt;
  }

  const intervalMs = medicine.reminder.everyHours * 60 * 60 * 1000;
  const elapsedMs = now.getTime() - startsAt.getTime();
  const nextStep = Math.floor(elapsedMs / intervalMs) + 1;

  return new Date(startsAt.getTime() + nextStep * intervalMs);
}

export function getUpcomingIntervalReminders(
  medicines: Medicine[],
  now: Date = new Date()
): Array<{ medicineId: string; medicineName: string; nextAt: string }> {
  return medicines
    .map((medicine) => {
      const next = getNextIntervalReminderAt(medicine, now);
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
