import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import Header from "./component/layout/Header/Header";
import Footer from "./component/layout/Footer/Footer";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./component/Home/Home";
import WebFont from "webfontloader";
// import loader from './component/layout/Loader/loader';
import ProductDetails from "./component/Product/ProductDetails";
import Products from "./component/Product/Products";
import ScrollToTop from "./component/ExtraFeatures/ScrollToTop";
import Search from "./component/Product/Search";
import LoginSignUp from "./component/User/LoginSignUp";
import { store } from "./redux/store";
import { loadUser } from "./redux/slice/user";
import UserOptions from "./component/layout/Header/UserOptions";
import { useSelector } from "react-redux";
import Profile from "./component/User/Profile";
import ProtectedRoute from "./component/Route/ProtectedRoute";
import UpdateProfile from "./component/User/UpdateProfile";
import UpdatePassword from "./component/User/UpdatePassword";
import ForgotPassword from "./component/User/ForgotPassword";
import ResetPassword from "./component/User/ResetPassword";
import Cart from "./component/Cart/Cart";
import Shipping from "./component/Cart/Shipping";
import ConfirmOrder from "./component/Cart/ConfirmOrder.js";
import Payment from "./component/Cart/Payment.js";
import OrderSuccess from "./component/Cart/OrderSuccess.js";
import MyOrders from "./component/Order/MyOrders.js";


import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useAlert } from "react-alert";



function App() {
  const alert = useAlert();
  const { isAuthenticated, user } = useSelector((state) => state.user);

  const [stripeApiKey, setStripeApiKey] = useState("");

  async function getStripeApiKey() {
      const { data } = await axios.get("/api/v1/stripeapikey");

      setStripeApiKey(data.stripeApiKey);
  }

  useEffect(() => {
    WebFont.load({
      google: {
        families: ["Roboto", "Droid Sans", "Chilanka", "Open Sans", "Poppins"],
      },
    });

    store.dispatch(loadUser());

    getStripeApiKey();
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <Header />
      {isAuthenticated && <UserOptions user={user} />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/products/" element={<Products />} />
        <Route path="/products/:keyword" element={<Products />} />

        <Route path="/search" element={<Search />} />
        <Route
          path="/account"
          element={<ProtectedRoute element={<Profile />} />}
        />
        <Route
          path="/me/update"
          element={<ProtectedRoute element={<UpdateProfile />} />}
        />
        <Route
          path="/password/update"
          element={<ProtectedRoute element={<UpdatePassword />} />}
        />
        <Route path="/password/forgot" element={<ForgotPassword />} />
        <Route path="/password/reset/:token" element={<ResetPassword />} />

        <Route path="/login" element={<LoginSignUp />} />
        <Route path="/cart" element={<Cart />} />

        <Route
          path="/shipping"
          element={<ProtectedRoute element={<Shipping />} />}
        />
        <Route
          path="/order/confirm"
          element={<ProtectedRoute element={<ConfirmOrder />} />}
        />

        <Route
          path="/process/payment"
          element={
            <ProtectedRoute
              element={
                stripeApiKey && (
                  <Elements stripe={loadStripe(stripeApiKey)}>
                    <Payment />
                  </Elements>
                )
              }
            />
          }
        />

        <Route
          path="/success"
          element={<ProtectedRoute element={<OrderSuccess />} />}
        />

        <Route
          path="/orders"
          element={<ProtectedRoute element={<MyOrders />} />}
        />

      </Routes>


      <Footer />
    </Router>
  );
}

export default App;
