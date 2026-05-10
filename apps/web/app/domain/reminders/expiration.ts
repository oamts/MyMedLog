import type { Medicine } from "@mymedlog/contracts";

function startOfLocalDay(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate(), 0, 0, 0, 0);
}

function addDays(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount, 9, 0, 0, 0);
}

export function getUpcomingExpirationAlerts(
  medicines: Medicine[],
  now: Date = new Date()
): Array<{ medicineId: string; medicineName: string; nextAt: string; targetDate: string }> {
  const today = startOfLocalDay(now);

  return medicines
    .flatMap((medicine) => {
      if (!medicine.expirationAlert.enabled || !medicine.expiresOn) {
        return [];
      }

      const expirationDate = new Date(`${medicine.expiresOn}T00:00:00`);
      if (Number.isNaN(expirationDate.getTime())) {
        return [];
      }

      const offsets = medicine.expirationAlert.includeOnExpirationDay
        ? [...medicine.expirationAlert.daysBefore, 0]
        : [...medicine.expirationAlert.daysBefore];

      const uniqueOffsets = [...new Set(offsets)].sort((a, b) => b - a);

      return uniqueOffsets
        .map((daysBefore) => {
          const target = addDays(expirationDate, -daysBefore);
          if (target.getTime() < today.getTime()) {
            return null;
          }

          return {
            medicineId: medicine.id,
            medicineName: medicine.name,
            nextAt: target.toISOString(),
            targetDate: target.toISOString().slice(0, 10)
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);
    })
    .sort((a, b) => a.nextAt.localeCompare(b.nextAt));
}
