import { useEffect } from "react";
import { useForm } from "react-hook-form";
import "./style.css";

export type MedicineFormValues = {
  name: string;
  expiresOn: string;
  time: string;
  notes: string;
  expirationAlertEnabled: boolean;
  expirationAlertMode: "single" | "multiple";
  expirationDaysBefore: string;
  includeOnExpirationDay: boolean;
};

type MedicineFormProps = {
  initialValues: MedicineFormValues;
  isSubmitting: boolean;
  isEditing: boolean;
  onSubmit: (values: MedicineFormValues) => void | Promise<void>;
};

export function MedicineForm({
  initialValues,
  isSubmitting,
  isEditing,
  onSubmit
}: MedicineFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<MedicineFormValues>({
    defaultValues: initialValues
  });

  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="medicine-form">
      <input
        placeholder="Nome do medicamento"
        {...register("name", {
          required: "Nome e obrigatorio",
          minLength: { value: 2, message: "Nome deve ter ao menos 2 caracteres" }
        })}
      />
      {errors.name && <p className="medicine-form__field-error">{errors.name.message}</p>}
      <input type="date" {...register("expiresOn")} />
      <input
        type="time"
        {...register("time", {
          required: "Horario e obrigatorio",
          pattern: {
            value: /^([01]\d|2[0-3]):[0-5]\d$/,
            message: "Horario invalido"
          }
        })}
      />
      {errors.time && <p className="medicine-form__field-error">{errors.time.message}</p>}
      <input placeholder="Observacoes (opcional)" {...register("notes")} />
      <label className="medicine-form__inline-label">
        <input type="checkbox" {...register("expirationAlertEnabled")} />
        Alerta de validade ativo
      </label>
      <select {...register("expirationAlertMode")}>
        <option value="single">Unico</option>
        <option value="multiple">Multiplo</option>
      </select>
      <input
        placeholder="Dias antes (ex: 30 ou 30,7,1)"
        {...register("expirationDaysBefore", {
          required: "Informe pelo menos um dia"
        })}
      />
      <label className="medicine-form__inline-label">
        <input type="checkbox" {...register("includeOnExpirationDay")} />
        Incluir no dia da validade
      </label>
      {errors.expirationDaysBefore && (
        <p className="medicine-form__field-error">{errors.expirationDaysBefore.message}</p>
      )}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Salvando..." : isEditing ? "Atualizar medicamento" : "Salvar medicamento"}
      </button>
    </form>
  );
}
