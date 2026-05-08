import type { Medicine } from "@mymedlog/contracts";

type MedicineListItemProps = {
  medicine: Medicine;
  onEdit: (medicine: Medicine) => void;
  onDelete: (id: string) => void;
};

export function MedicineListItem({ medicine, onEdit, onDelete }: MedicineListItemProps) {
  return (
    <div
      style={{
        margin: "0.4rem 0",
        padding: "0.5rem",
        border: "1px solid #d1d5db",
        borderRadius: "10px"
      }}
    >
      <p style={{ margin: 0 }}>
        <strong>{medicine.name}</strong> — validade {medicine.expiresOn ?? "nao informada"}
      </p>
      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.35rem" }}>
        <button type="button" onClick={() => onEdit(medicine)}>
          Editar
        </button>
        <button type="button" onClick={() => onDelete(medicine.id)}>
          Excluir
        </button>
      </div>
    </div>
  );
}
