import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Medicine } from "../types/medicine";

interface MedicinesState {
  medicines: Medicine[];
}

const initialState: MedicinesState = {
  medicines: [],
};

const medicinesSlice = createSlice({
  name: "medicines",
  initialState,
  reducers: {
    addMedicine: (state, action: PayloadAction<Medicine>) => {
      state.medicines.push(action.payload);
    },
  },
});

export const { addMedicine } = medicinesSlice.actions;
export default medicinesSlice.reducer;
