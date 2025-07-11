import { RootState } from "@/src/redux/store";

export const selectMedicines = (state: RootState) => state.medicine.medicines;
