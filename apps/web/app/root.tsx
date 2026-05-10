import { Outlet } from "react-router";
import { Provider } from "react-redux";
import { store } from "../src/store";
import "../src/pwa";

export default function Root() {
  return (
    <Provider store={store}>
      <Outlet />
    </Provider>
  );
}
