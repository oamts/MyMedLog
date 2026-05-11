import { z } from "zod";

export type HealthResponse = {
  status: "ok";
  service: "api";
  timestamp: string;
};

export const reminderTypeSchema = z.enum(["fixed_time", "interval_hours"]);

export const fixedTimeReminderSchema = z.object({
  type: z.literal("fixed_time"),
  times: z
    .array(z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:mm format"))
    .min(1)
    .max(12)
});

export const intervalReminderSchema = z.object({
  type: z.literal("interval_hours"),
  everyHours: z.union([z.literal(6), z.literal(8), z.literal(12)]),
  startsAt: z.string().datetime()
});

export const reminderSchema = z.discriminatedUnion("type", [
  fixedTimeReminderSchema,
  intervalReminderSchema
]);

export const expirationAlertModeSchema = z.enum(["single", "multiple"]);

export const expirationAlertSchema = z
  .object({
    enabled: z.boolean(),
    mode: expirationAlertModeSchema,
    daysBefore: z.array(z.number().int().min(0)).min(1).max(10),
    includeOnExpirationDay: z.boolean()
  })
  .superRefine((value, ctx) => {
    const unique = new Set(value.daysBefore);
    if (unique.size !== value.daysBefore.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["daysBefore"],
        message: "daysBefore must not contain duplicates"
      });
    }

    if (value.mode === "single" && value.daysBefore.length !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["daysBefore"],
        message: "single mode requires exactly one daysBefore value"
      });
    }
  });

const medicineBaseSchema = z.object({
  name: z.string().trim().min(2).max(120),
  notes: z.string().trim().max(1000).optional(),
  expiresOn: z.string().date().optional(),
  reminder: reminderSchema,
  expirationAlert: expirationAlertSchema,
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional()
});
export const medicineInputSchema = medicineBaseSchema;

export const medicineSchema = medicineBaseSchema
  .extend({ id: z.string().uuid() });

export type ReminderType = z.infer<typeof reminderTypeSchema>;
export type ExpirationAlertMode = z.infer<typeof expirationAlertModeSchema>;
export type FixedTimeReminder = z.infer<typeof fixedTimeReminderSchema>;
export type IntervalReminder = z.infer<typeof intervalReminderSchema>;
export type Reminder = z.infer<typeof reminderSchema>;
export type ExpirationAlert = z.infer<typeof expirationAlertSchema>;
export type MedicineInput = z.infer<typeof medicineInputSchema>;
export type Medicine = z.infer<typeof medicineSchema>;

export type CreateMedicineRequest = MedicineInput;
export type CreateMedicineResponse = Medicine;

export const medicinesSnapshotSchema = z.array(medicineSchema);

export type MedicinesSnapshotRequest = Medicine[];
export type MedicinesSnapshotResponse = {
  status: "ok";
  total: number;
};
