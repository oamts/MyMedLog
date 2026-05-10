import { createBrowserRouter } from "react-router";
import Root from "./root";
import IndexPage from "./routes/index";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        index: true,
        element: <IndexPage />
      }
    ]
  }
]);
