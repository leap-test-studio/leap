import { thunk } from "redux-thunk";
import { legacy_createStore as createStore, applyMiddleware, compose } from "redux";
import Reducers from "./reducers";

const initialState = {};

const middlewares = [thunk];

export const Store = createStore(Reducers, initialState, compose(applyMiddleware(...middlewares)));
