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
import { loadUser } from "./redux/slice/userSlice.js";
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
import OrderDetails from "./component/Order/OrderDetails.js";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useDispatch } from "react-redux";
import { useAlert } from "react-alert";
import Contact from "./component/layout/Contact/Contact";
import About from "./component/layout/About/About.js";
import NotFound from "./component/layout/Not Found/NotFound.js";

function App() {
  const alert = useAlert();
const dispatch = useDispatch();
const { isAuthenticated, user } = useSelector((state) => state.user);
const baseUrl = process.env.REACT_APP_API_URL;

const [stripeApiKey, setStripeApiKey] = useState("");

async function getStripeApiKey() {
  try {
    const { data } = await axios.get(`${baseUrl}/api/v1/stripeapikey` , {withCredentials : true});
    setStripeApiKey(data?.stripeApiKey);
  } catch (error) {
    alert.error("Failed to fetch Stripe API key.");
    console.error("Error fetching Stripe API key:", error);
  }
}

function checkCookiesEnabled() {
  // Try to set a test cookie
  document.cookie = "testcookie=yes";

  // Check if the cookie was set successfully\
  const cookiesEnabled = document.cookie.indexOf("testcookie") !== -1;

  if(!cookiesEnabled) {
    // Show a warning to user that cookies are blocked
    alert.error("Cookies are disabled or blocked . Please enable cookies for the best experience .")
  }
}


useEffect(() => {
  WebFont.load({
    google: {
      families: ["Roboto", "Droid Sans", "Chilanka", "Open Sans", "Poppins"],
    },
  });
  checkCookiesEnabled();
  dispatch(loadUser());
  getStripeApiKey();
}, [dispatch ]); // I can add isAuthenticated if I want to refetch the key when authentication state changes


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
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />

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
          path="/success"
          element={<ProtectedRoute element={<OrderSuccess />} />}
        />

        <Route
          path="/orders"
          element={<ProtectedRoute element={<MyOrders />} />}
        />

        <Route
          path="/order/:id"
          element={<ProtectedRoute element={<OrderDetails />} />}
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

<Route path="*" element={<NotFound />} />
{/* 
        <Route
          path="*"
          element={
            window.location.pathname === "/process/payment" ? null : (
              <NotFound />
            )
          } */}
        {/* /> */}
      </Routes>

      <Footer />
    </Router>
  );
}

export default App;
