import ReactDOM from "react-dom/client";
import "./assets/css/index.css";
import App from "./App";
import ContextProvider from "./views/context/ContextProvider";
import { Provider } from "react-redux";
import { Store } from "./redux/Store";
import Product from "./product.json";

const container = document.getElementById("root");
const root = ReactDOM.createRoot(container);

root.render(
  <Provider store={Store}>
    <ContextProvider product={Product}>
      <App product={Product} />
    </ContextProvider>
  </Provider>
);
