import { Outlet } from "react-router";
import { Provider } from "react-redux";
import { store } from "./store";
import "./pwa";

export default function Root() {
  return (
    <Provider store={store}>
      <Outlet />
    </Provider>
  );
}
