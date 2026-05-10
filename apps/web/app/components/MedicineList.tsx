import type { Medicine } from "@mymedlog/contracts";
import { MedicineListItem } from "./MedicineListItem";

type MedicineListProps = {
  medicines: Medicine[];
  onEdit: (medicine: Medicine) => void;
  onDelete: (id: string) => void;
};

export function MedicineList({ medicines, onEdit, onDelete }: MedicineListProps) {
  if (medicines.length === 0) {
    return <p>Nenhum medicamento salvo localmente.</p>;
  }

  return (
    <>
      {medicines.map((medicine) => (
        <MedicineListItem
          key={medicine.id}
          medicine={medicine}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </>
  );
}
