import { listMedicinesLocal } from "./db";
import { getUpcomingFixedReminders } from "../domain/reminders/fixedTime";

export async function getLocalFixedReminderSchedule(now: Date = new Date()) {
  const medicines = await listMedicinesLocal();
  return getUpcomingFixedReminders(medicines, now);
}
