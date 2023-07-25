import ReactDOM from "react-dom/client";
import "./assets/css/index.css";
import App from "./App.jsx";
import ContextProvider from "./views/context/ContextProvider";
import { Provider } from "react-redux";
import { Store } from "./redux/Store";
import Product from "./product.json";

const Index = () => {
  return (
    <Provider store={Store}>
      <ContextProvider product={Product}>
        <App product={Product} />
      </ContextProvider>
    </Provider>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<Index />);
