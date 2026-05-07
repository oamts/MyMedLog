import { useEffect, useState } from "react";
import {
  medicineInputSchema,
  type Medicine,
  type MedicineInput
} from "@mymedlog/contracts";
import { useCreateMedicineMutation, useGetHealthQuery } from "./services/api";
import { createMedicineLocal, listMedicinesLocal } from "./services/db";

export function App() {
  const { data, isLoading, isError } = useGetHealthQuery();
  const [createMedicine, createState] = useCreateMedicineMutation();
  const [validationError, setValidationError] = useState<string | null>(null);
  const [localSaveMessage, setLocalSaveMessage] = useState<string | null>(null);
  const [localMedicines, setLocalMedicines] = useState<Medicine[]>([]);

  useEffect(() => {
    void listMedicinesLocal().then(setLocalMedicines);
  }, []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError(null);

    const formData = new FormData(event.currentTarget);
    const payload: MedicineInput = {
      name: String(formData.get("name") ?? ""),
      dosageAmount: Number(formData.get("dosageAmount") ?? 0),
      dosageUnit: String(formData.get("dosageUnit") ?? "mg") as MedicineInput["dosageUnit"],
      startsOn: String(formData.get("startsOn") ?? ""),
      notes: String(formData.get("notes") ?? "") || undefined,
      reminder: {
        type: "fixed_time",
        times: [String(formData.get("time") ?? "08:00")]
      }
    };

    const parsed = medicineInputSchema.safeParse(payload);
    if (!parsed.success) {
      setValidationError(parsed.error.issues[0]?.message ?? "Dados invalidos");
      return;
    }

    try {
      const localMedicine = await createMedicineLocal(parsed.data);
      setLocalSaveMessage(`Salvo localmente: ${localMedicine.name}`);
      setLocalMedicines(await listMedicinesLocal());
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : "Erro ao salvar localmente");
      return;
    }

    await createMedicine(parsed.data).catch(() => null);
    event.currentTarget.reset();
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "2rem",
        background:
          "radial-gradient(circle at top, #d1fae5 0%, #f4efe6 35%, #efe7d8 100%)",
        color: "#1f2937",
        fontFamily: "'Source Sans 3', system-ui, sans-serif"
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "720px",
          background: "rgba(255, 255, 255, 0.82)",
          borderRadius: "16px",
          boxShadow: "0 8px 30px rgba(15, 118, 110, 0.12)",
          padding: "1.5rem"
        }}
      >
        <h1 style={{ marginTop: 0 }}>MyMedLog</h1>
        <p style={{ marginBottom: "1.25rem" }}>
          Scaffold inicial concluido. Frontend conectado ao endpoint de health da API.
        </p>
        {isLoading && <p>Verificando API...</p>}
        {isError && <p>API indisponivel no momento.</p>}
        {data && (
          <p>
            API status: <strong>{data.status}</strong> ({data.service}) em {data.timestamp}
          </p>
        )}
        <hr style={{ margin: "1.25rem 0", borderColor: "#d1d5db" }} />
        <form onSubmit={onSubmit} style={{ display: "grid", gap: "0.75rem" }}>
          <input name="name" placeholder="Nome do medicamento" required />
          <input name="dosageAmount" type="number" step="0.1" min="0.1" placeholder="Dosagem" required />
          <select name="dosageUnit" defaultValue="mg">
            <option value="mg">mg</option>
            <option value="ml">ml</option>
            <option value="tablet">tablet</option>
            <option value="capsule">capsule</option>
          </select>
          <input name="startsOn" type="date" required />
          <input name="time" type="time" defaultValue="08:00" required />
          <input name="notes" placeholder="Observacoes (opcional)" />
          <button type="submit" disabled={createState.isLoading}>
            {createState.isLoading ? "Salvando..." : "Salvar medicamento"}
          </button>
        </form>
        {validationError && <p style={{ color: "#b91c1c" }}>{validationError}</p>}
        {localSaveMessage && <p style={{ color: "#065f46" }}>{localSaveMessage}</p>}
        {createState.isError && <p style={{ color: "#b91c1c" }}>Falha ao salvar medicamento.</p>}
        {createState.data && (
          <p>
            Medicamento salvo: <strong>{createState.data.name}</strong> (id {createState.data.id})
          </p>
        )}
        <h2 style={{ marginTop: "1.5rem", marginBottom: "0.5rem", fontSize: "1.1rem" }}>
          Medicamentos locais
        </h2>
        {localMedicines.length === 0 && <p>Nenhum medicamento salvo localmente.</p>}
        {localMedicines.map((medicine) => (
          <p key={medicine.id} style={{ margin: "0.25rem 0" }}>
            <strong>{medicine.name}</strong> — {medicine.dosageAmount} {medicine.dosageUnit} (inicio {medicine.startsOn})
          </p>
        ))}
      </section>
    </main>
  );
}
