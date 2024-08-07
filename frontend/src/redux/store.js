// import {createStore , combineReducers , applyMiddleware} from "redux"
// import {thunk} from "redux-thunk"
// import {composeWithDevTools} from "redux-devtools-extension"

// const reducer = combineReducers({});

// let initialState = {};

// const middleware = [thunk];

// const store = createStore(
//     reducer,
//     initialState,
//     composeWithDevTools(applyMiddleware(...middleware))
// )

// export default store;

import { configureStore } from "@reduxjs/toolkit";
import { productsReducer, productDetailsReducer } from "./slice/product";
import {
  forgotPasswordReducer,
  updateProfileReducer,
  userReducer,
} from "./slice/user";
import { cartReducer } from "./slice/cartSlice";

export const store = configureStore({
  reducer: {
    products: productsReducer,
    productDetails: productDetailsReducer,
    user: userReducer,
    profile: updateProfileReducer,
    forgotPassword: forgotPasswordReducer,
    cart: cartReducer,
  },
});
