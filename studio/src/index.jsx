import { Provider } from "react-redux";
import ReactDOM from "react-dom/client";
import "./index.css";

import App from "./App";
import ContextProvider from "./views/context/ContextProvider";
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
