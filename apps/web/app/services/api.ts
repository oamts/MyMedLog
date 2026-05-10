import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  CreateMedicineRequest,
  CreateMedicineResponse,
  HealthResponse
} from "@mymedlog/contracts";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3333";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: apiBaseUrl }),
  endpoints: (builder) => ({
    getHealth: builder.query<HealthResponse, void>({
      query: () => "/api/v1/health"
    }),
    createMedicine: builder.mutation<CreateMedicineResponse, CreateMedicineRequest>({
      query: (body) => ({
        url: "/api/v1/medicines",
        method: "POST",
        body
      })
    })
  })
});

export const { useGetHealthQuery, useCreateMedicineMutation } = api;
