import { useEffect } from "react";
import { useForm } from "react-hook-form";

export type MedicineFormValues = {
  name: string;
  expiresOn: string;
  time: string;
  notes: string;
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
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: "grid", gap: "0.75rem" }}>
      <input
        placeholder="Nome do medicamento"
        {...register("name", {
          required: "Nome e obrigatorio",
          minLength: { value: 2, message: "Nome deve ter ao menos 2 caracteres" }
        })}
      />
      {errors.name && <p style={{ margin: 0, color: "#b91c1c" }}>{errors.name.message}</p>}
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
      {errors.time && <p style={{ margin: 0, color: "#b91c1c" }}>{errors.time.message}</p>}
      <input placeholder="Observacoes (opcional)" {...register("notes")} />
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Salvando..." : isEditing ? "Atualizar medicamento" : "Salvar medicamento"}
      </button>
    </form>
  );
}
