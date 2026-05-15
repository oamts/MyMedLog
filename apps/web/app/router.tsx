import { App } from "@/pages/App";
import { Home } from "@/pages/Home";
import Root from "@/root";
import { createBrowserRouter } from "react-router";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      {
        index: true,
        Component: Home
      },
      { path: "/app", Component: App }
    ]
  }
]);
