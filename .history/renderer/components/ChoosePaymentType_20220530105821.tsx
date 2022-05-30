import { FC, memo, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { LinkItem } from "@commerce/types/headerMenu";
import Image from "next/image";
import { Link } from "react-scroll";
import dynamic from "next/dynamic";
import SimpleBar from "simplebar-react";
import { useSelectedLanguage } from "next-export-i18n";
import { useUI } from "@components/ui/context";
import Cookies from "js-cookie";
import axios from "axios";
import getConfig from "next/config";
import useCart from "@framework/cart/use-cart";
import { toast } from "react-toastify";
import Hashids from "hashids";
import { useTranslation } from "next-export-i18n";
import { ipcRenderer } from "electron";

const { publicRuntimeConfig } = getConfig();
let webAddress = publicRuntimeConfig.apiUrl;
axios.defaults.withCredentials = true;

const ChoosePaymentType = () => {
  const { lang: locale } = useSelectedLanguage();
  const { categoryId, setCategoryId, user, setUserData, setOrderData } =
    useUI();

  const [isActice, setIsActive] = useState(true);

  const [isLoadingCard, setIsLoadingCard] = useState(false);
  const [isLoadingCashBack, setIsLoadingCashBack] = useState(false);
  const { t: tr } = useTranslation("common");

  const router = useRouter();
  let cartId: string | null = null;
  if (typeof window !== "undefined") {
    cartId = localStorage.getItem("basketId");
  }

  const { data, isLoading, isEmpty, mutate } = useCart({
    cartId,
  });

  const setCredentials = async () => {
    let csrf = Cookies.get("X-XSRF-TOKEN");
    if (!csrf) {
      const csrfReq = await axios(`${webAddress}/api/keldi`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          crossDomain: true,
        },
        withCredentials: true,
      });
      let { data: res } = csrfReq;
      csrf = Buffer.from(res.result, "base64").toString("ascii");

      var inTenMinutes = new Date(new Date().getTime() + 10 * 60 * 1000);
      Cookies.set("X-XSRF-TOKEN", csrf, {
        expires: inTenMinutes,
      });
    }
    axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    axios.defaults.headers.common["X-CSRF-TOKEN"] = csrf;
    axios.defaults.headers.common["XCSRF-TOKEN"] = csrf;
  };

  const submitCardOrder = async () => {
    const preferences = ipcRenderer.sendSync("getPreferences");
    setIsLoadingCard(true);
    await setCredentials();
    const otpToken = Cookies.get("opt_token");
    let sourceType = "kiosk";

    try {
      const { data } = await axios.post(
        `${webAddress}/api/orders`,
        {
          formData: {
            address: "",
            flat: "",
            house: "",
            entrance: "",
            door_code: "",
            deliveryType: "pickup",
            location: [],
            label: "",
            name: user?.user?.name,
            phone: user?.user?.phone,
            email: "",
            comment_to_address: "",
            comment_to_order: "",
            change: "",
            notes: "",
            card_number: "",
            card_month: "",
            holder_name: "",
            cvv_code: "",
            delivery_day: "",
            delivery_time: "",
            delivery_schedule: "now",
            addressId: null,
            additional_phone: "",
            pay_type: "offline",
            sms_sub: false,
            email_sub: false,
            sourceType,
            terminal_id: preferences.lists.terminal_id,
          },
          basket_id: cartId,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${otpToken}`,
          },
          withCredentials: true,
        }
      );
      setIsLoadingCard(false);
      // setUserData(data.user)
      localStorage.removeItem("basketId");

      const hashids = new Hashids(
        "order",
        15,
        "abcdefghijklmnopqrstuvwxyz1234567890"
      );

      localStorage.removeItem("mijoz");
      setUserData(null);
      setOrderData(data);
      router.push(`/order/${hashids.decode(data.order.id)}`);
    } catch (e) {
      // toast.error(e.response.data.error.message, {
      //   position: toast.POSITION.BOTTOM_RIGHT,
      //   hideProgressBar: true,
      // });
      toast(e.response.data.error.message, {
        position: "bottom-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: false,
        progress: undefined,
      });
      setIsLoadingCard(false);
    }
  };

  const submitCashBackOrder = async () => {
    setIsLoadingCashBack(true);
    await setCredentials();
    const userToken = Cookies.get("opt_token");
    const res = await axios.get(`${webAddress}/api/cashback/balance`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      withCredentials: true,
    });
    if (res.data.data.balance < data.totalPrice) {
      setIsLoadingCashBack(false);
      router.push("/payment/dont_enough_points");
      return;
    }
    const otpToken = Cookies.get("opt_token");
    let sourceType = "kiosk";

    try {
      const { data } = await axios.post(
        `${webAddress}/api/orders`,
        {
          formData: {
            address: "",
            flat: "",
            house: "",
            entrance: "",
            door_code: "",
            deliveryType: "pickup",
            location: [],
            label: "",
            name: user?.user?.name,
            phone: user?.user?.phone,
            email: "",
            comment_to_address: "",
            comment_to_order: "",
            change: "",
            notes: "",
            card_number: "",
            card_month: "",
            holder_name: "",
            cvv_code: "",
            delivery_day: "",
            delivery_time: "",
            delivery_schedule: "now",
            addressId: null,
            additional_phone: "",
            pay_type: "cashback",
            sms_sub: false,
            email_sub: false,
            sourceType,
            terminal_id: 14,
          },
          basket_id: cartId,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${otpToken}`,
          },
          withCredentials: true,
        }
      );
      setIsLoadingCashBack(false);
      // setUserData(data.user)
      localStorage.removeItem("basketId");

      const hashids = new Hashids(
        "order",
        15,
        "abcdefghijklmnopqrstuvwxyz1234567890"
      );

      localStorage.removeItem("mijoz");
      setUserData(null);
      router.push(`/order/${hashids.decode(data.order.id)}`);
    } catch (e) {
      // toast.error(e.response.data.error.message, {
      //   position: toast.POSITION.BOTTOM_RIGHT,
      //   hideProgressBar: true,
      // });
      toast(e.response.data.error.message, {
        position: "bottom-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: false,
        progress: undefined,
      });
      setIsLoadingCashBack(false);
    }
  };

  const clearBasket = async () => {
    if (cartId) {
      const { data: basket } = await axios.get(
        `${webAddress}/api/baskets/${cartId}/clear`
      );
      const basketResult = {
        id: basket.data.id,
        createdAt: "",
        currency: { code: basket.data.currency },
        taxesIncluded: basket.data.tax_total,
        lineItems: basket.data.lines,
        lineItemsSubtotalPrice: basket.data.sub_total,
        subtotalPrice: basket.data.sub_total,
        totalPrice: basket.data.total,
      };

      await mutate(basketResult, false);
    }
  };

  return (
    <div className="bg-primary h-full">
      <div className="text-white font-bold text-6xl m-auto pt-80 px-[304px] text-center font-serif pb-28">
        {tr("choose_payment_methods")}
      </div>

      <button
        onClick={submitCardOrder}
        disabled={isLoadingCard}
        className="flex relative items-center text-5xl text-gray-600 bg-white active:bg-greenPrimary active:text-white w-[688px] m-auto rounded-3xl font-semibold font-sans"
      >
        {isLoadingCard && (
          <div className="h-full w-full absolute flex items-center justify-around bg-gray-300 top-0 bg-opacity-60 left-0 rounded-[15px]">
            <svg
              className="animate-spin text-white h-14"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        )}
        <img
          src="/assets/card.png"
          alt=""
          width={50}
          height={40}
          className="py-14 ml-[70px] mr-16"
        />
        <div> {tr("payment_by_card")}</div>
      </button>
      <button
        onClick={() => router.push("/payment/online")}
        className="flex items-center relative text-5xl text-gray-600 bg-white active:bg-greenPrimary active:text-white my-7 w-[688px] m-auto rounded-3xl font-semibold font-sans"
      >
        <img
          src="/assets/onlinePay.png"
          alt=""
          width={50}
          height={40}
          className="py-14 ml-[70px] mr-16"
        />
        <div>{tr("payment_online")}</div>
      </button>
      {/* <button
        onClick={submitCashBackOrder}
        disabled={isLoadingCashBack}
        className="flex items-center relative text-5xl text-gray-600 bg-white active:bg-greenPrimary active:text-white w-[688px] m-auto rounded-3xl font-semibold font-sans"
      >
        {isLoadingCashBack && (
          <div className="h-full w-full absolute flex items-center justify-around bg-gray-300 top-0 bg-opacity-60 left-0 rounded-[15px]">
            <svg
              className="animate-spin text-white h-14"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        )}
        <img
          src="/assets/cache.png"
          alt=""
          width={50}
          height={40}
          className="py-14 ml-[70px] mr-16"
        />
        <div>{tr("payment_by_bonuses")}</div>
      </button> */}
      <div
        className="bg-black text-white fixed left-0 bottom-0 py-9 px-52 font-medium text-[40px] font-sans"
        onClick={() => clearBasket}
      >
        {tr("Отменить заказ")}
      </div>
    </div>
  );
};

export default memo(ChoosePaymentType);
