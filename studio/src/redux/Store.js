import thunk from "redux-thunk";
import { createStore, applyMiddleware, compose } from "redux";
import Reducers from "./reducers";

const initialState = {};

const middlewares = [thunk];

export const Store = createStore(Reducers, initialState, compose(applyMiddleware(...middlewares)));
