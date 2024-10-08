import React, { useRef, useEffect } from "react";
import CheckoutSteps from "./CheckoutSteps";
import { useSelector, useDispatch } from "react-redux";
import MetaData from "../layout/MetaData";
import { Typography } from "@mui/material";
import { useAlert } from "react-alert";
import {
  CardNumberElement,
  CardCvcElement,
  CardExpiryElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import "./Payment.css";
import axios from "axios";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import EventIcon from "@mui/icons-material/Event";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import { useNavigate } from "react-router-dom";
import { createOrder , removeError } from "../../redux/slice/orderSlice";
const baseUrl = process.env.REACT_APP_API_URL;


const Payment = () => {
  const orderInfo = JSON.parse(sessionStorage.getItem("orderInfo"));

  const dispatch = useDispatch();
  const alert = useAlert();
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const payBtn = useRef(null);

  const { shippingInfo, cartItems } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.user);
  const { isError , errorMessage } = useSelector((state) => state.newOrder);

  const paymentData = {
    amount: Math.round(orderInfo.totalPrice * 100),
  };

  const order = {
    shippingInfo,
    orderItems : cartItems,
    itemsPrice : orderInfo.subTotal,
    taxPrice : orderInfo.tax,
    shippingPrice : orderInfo.shippingCharges,
    totalPrice : orderInfo.totalPrice
  }

  const submitHandler = async (e) => {
    e.preventDefault();

    payBtn.current.disabled = true;

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true
      };

      const { data } = await axios.post(
        `${baseUrl}/api/v1/payment/process`,
        paymentData,
        config
      );
      console.log(data)

      const client_secret = data.client_secret;

      if (!stripe || !elements) return;

      const result = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: elements.getElement(CardNumberElement),
          billing_details: {
            name: user.name,
            email: user.email,
            address: {
              line1: shippingInfo.address,
              city: shippingInfo.city,
              state: shippingInfo.state,
              postal_code: shippingInfo.pinCode,
              country: shippingInfo.country,
            },
          },
        },
      });

      console.log("Stripe Result: ", result);

      if (result.error) {

        payBtn.current.disabled = false;
        alert.error(result.error.message);

      } else {

        if ((result.paymentIntent.status === "succeeded")) {

          order.paymentInfo = {
            id : result.paymentIntent.id,
            status : result.paymentIntent.status
          }

          dispatch(createOrder(order));

          navigate("/success", { replace: true });
          alert.success("Payment Successful ! Your Order has been placed !")
        } else {
          alert.error("There's some issue while processing payment");
        }

      }
    } catch (error) {

      payBtn.current.disabled = false;
      alert.error(error.response.data.message);

    }
  };

  useEffect(() => {
    if(isError) {
      alert.error(errorMessage);
      dispatch(removeError());
    }
  }, [dispatch , isError , errorMessage , alert])
  

  return (
    <>
      <MetaData title="Payment" />
      <CheckoutSteps activeStep="2" />
      <div className="paymentContainer">
        <form onSubmit={(e) => submitHandler(e)} className="paymentForm">
          <Typography>CARD INFO</Typography>
          <div>
            <CreditCardIcon />
            <CardNumberElement className="paymentInput" />
          </div>
          <div>
            <EventIcon />
            <CardExpiryElement className="paymentInput" />
          </div>
          <div>
            <VpnKeyIcon />
            <CardCvcElement className="paymentInput" />
          </div>
          <input
            type="submit"
            value={`Pay - ₹${orderInfo && orderInfo.totalPrice}`}
            ref={payBtn}
            className="paymentFormBtn"
          />
        </form>
      </div>
    </>
  );
};

export default Payment;
