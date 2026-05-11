import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  HealthResponse,
  Medicine,
  MedicinesSnapshotResponse
} from "@mymedlog/contracts";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3333";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: apiBaseUrl }),
  endpoints: (builder) => ({
    getHealth: builder.query<HealthResponse, void>({
      query: () => "/api/v1/health"
    }),
    getMedicines: builder.query<Medicine[], void>({
      query: () => "/api/v1/medicines"
    }),
    putMedicinesSnapshot: builder.mutation<MedicinesSnapshotResponse, Medicine[]>({
      query: (body) => ({
        url: "/api/v1/medicines/snapshot",
        method: "PUT",
        body
      })
    })
  })
});

export const {
  useGetHealthQuery,
  useLazyGetMedicinesQuery,
  usePutMedicinesSnapshotMutation
} = api;
