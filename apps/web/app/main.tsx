import { router } from "@/router";
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
