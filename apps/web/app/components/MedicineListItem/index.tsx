import type { Medicine } from "@mymedlog/contracts";
import "./style.css";

type MedicineListItemProps = {
  medicine: Medicine;
  onEdit: (medicine: Medicine) => void;
  onDelete: (id: string) => void;
};

export function MedicineListItem({ medicine, onEdit, onDelete }: MedicineListItemProps) {
  return (
    <div className="medicine-list-item">
      <p className="medicine-list-item__text">
        <strong>{medicine.name}</strong> — validade {medicine.expiresOn ?? "nao informada"}
      </p>
      <div className="medicine-list-item__actions">
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
