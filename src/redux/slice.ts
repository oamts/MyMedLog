import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Medicine } from "../views/Home/types";

interface MedicineState {
  medicines: Medicine[];
}

const initialState: MedicineState = {
  medicines: [],
};

const medicineSlice = createSlice({
  name: "medicine",
  initialState,
  reducers: {
    addMedicine: (state, action: PayloadAction<Medicine>) => {
      state.medicines.push(action.payload);
    },
    removeMedicine: (state, action: PayloadAction<string>) => {
      state.medicines = state.medicines.filter((med) => med.id !== action.payload);
    },
    editMedicine: (state, action: PayloadAction<Medicine>) => {
      const idx = state.medicines.findIndex((med) => med.id === action.payload.id);
      if (idx !== -1) {
        state.medicines[idx] = action.payload;
      }
    },
  },
});

export const { addMedicine, removeMedicine, editMedicine } = medicineSlice.actions;
export default medicineSlice.reducer;
