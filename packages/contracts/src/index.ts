import { z } from "zod";

export type HealthResponse = {
  status: "ok";
  service: "api";
  timestamp: string;
};

export const doseUnitSchema = z.enum([
  "mg",
  "mcg",
  "g",
  "ml",
  "unit",
  "drop",
  "tablet",
  "capsule"
]);

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

const medicineBaseSchema = z.object({
  name: z.string().trim().min(2).max(120),
  dosageAmount: z.number().positive().max(100000),
  dosageUnit: doseUnitSchema,
  notes: z.string().trim().max(1000).optional(),
  startsOn: z.string().date(),
  endsOn: z.string().date().optional(),
  expiresOn: z.string().date().optional(),
  reminder: reminderSchema,
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional()
});

const validateMedicineDates = (
  value: z.infer<typeof medicineBaseSchema>,
  ctx: z.RefinementCtx
) => {
    if (value.endsOn && value.endsOn < value.startsOn) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endsOn"],
        message: "endsOn must be on or after startsOn"
      });
    }

    if (value.expiresOn && value.expiresOn < value.startsOn) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["expiresOn"],
        message: "expiresOn must be on or after startsOn"
      });
    }
  };

export const medicineInputSchema = medicineBaseSchema.superRefine(validateMedicineDates);

export const medicineSchema = medicineBaseSchema
  .extend({ id: z.string().uuid() })
  .superRefine(validateMedicineDates);

export type DoseUnit = z.infer<typeof doseUnitSchema>;
export type ReminderType = z.infer<typeof reminderTypeSchema>;
export type FixedTimeReminder = z.infer<typeof fixedTimeReminderSchema>;
export type IntervalReminder = z.infer<typeof intervalReminderSchema>;
export type Reminder = z.infer<typeof reminderSchema>;
export type MedicineInput = z.infer<typeof medicineInputSchema>;
export type Medicine = z.infer<typeof medicineSchema>;

export type CreateMedicineRequest = MedicineInput;
export type CreateMedicineResponse = Medicine;
