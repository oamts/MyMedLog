import { store } from "@/store";
import { Provider } from "react-redux";
import { Outlet } from "react-router";
import "./pwa";

export default function Root() {
  return (
    <Provider store={store}>
      <Outlet />
    </Provider>
  );
}
