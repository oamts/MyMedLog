import { listMedicinesLocal } from "./db";
import { getUpcomingFixedReminders } from "../domain/reminders/fixedTime";
import { getUpcomingIntervalReminders } from "../domain/reminders/interval";

export async function getLocalFixedReminderSchedule(now: Date = new Date()) {
  const medicines = await listMedicinesLocal();
  return getUpcomingFixedReminders(medicines, now);
}

export async function getLocalIntervalReminderSchedule(now: Date = new Date()) {
  const medicines = await listMedicinesLocal();
  return getUpcomingIntervalReminders(medicines, now);
}

export async function getLocalReminderSchedule(now: Date = new Date()) {
  const medicines = await listMedicinesLocal();
  const fixed = getUpcomingFixedReminders(medicines, now).map((item) => ({
    ...item,
    mode: "fixed_time" as const
  }));
  const interval = getUpcomingIntervalReminders(medicines, now).map((item) => ({
    ...item,
    mode: "interval_hours" as const
  }));

  return [...fixed, ...interval].sort((a, b) => a.nextAt.localeCompare(b.nextAt));
}
