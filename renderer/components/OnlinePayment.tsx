import { FC, memo, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { LinkItem } from "@commerce/types/headerMenu";
import Image from "next/image";
import dynamic from "next/dynamic";
import SimpleBar from "simplebar-react";
import { useSelectedLanguage } from "next-export-i18n";
import { useUI } from "@components/ui/context";
import Link from "next/link";
import Cookies from "js-cookie";
import axios from "axios";
import getConfig from "next/config";
import useCart from "@framework/cart/use-cart";
import Hashids from "hashids";
import { toast } from "react-toastify";
import useTranslation from "next-translate/useTranslation";

const { publicRuntimeConfig } = getConfig();
let webAddress = publicRuntimeConfig.apiUrl;
axios.defaults.withCredentials = true;

const OnlinePayment = () => {
  const { lang: locale } = useSelectedLanguage();
  const { categoryId, setCategoryId, user, setUserData, setOrderData } =
    useUI();
  const [isActice, setIsActive] = useState(true);
  const { t: tr } = useTranslation("common");

  const [isLoadingPayment, setIsLoadingPayment] = useState(false);

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

  const submitCardOrder = async (paymentType = "payme") => {
    setIsLoadingPayment(true);
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
            pay_type: paymentType,
            sms_sub: false,
            email_sub: false,
            sourceType,
            terminal_id: 16,
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
      setIsLoadingPayment(false);
      // setUserData(data.user)
      localStorage.removeItem("basketId");

      // const hashids = new Hashids(
      //   "order",
      //   15,
      //   "abcdefghijklmnopqrstuvwxyz1234567890"
      // );

      localStorage.removeItem("mijoz");
      setUserData(null);
      setOrderData(data);
      setTimeout(() => {
        router.push(`/payment/wait_payment`);
      }, 200);
    } catch (e) {
      console.log(e);
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
      setIsLoadingPayment(false);
    }
  };

  return (
    <div className="bg-primary h-full">
      <div className="relative">
        {isLoadingPayment && (
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
        <div className="gap-5 grid grid-cols-2 m-auto w-[688px] pt-[546px]">
          <button
            className="items-center text-5xl text-gray-600 bg-white active:bg-greenPrimary  m-auto rounded-3xl font-semibold font-sans"
            onClick={() => submitCardOrder("payme")}
          >
            <img
              src="/assets/payme.png"
              alt=""
              width={145}
              height={145}
              className="py-14 ml-[70px] mr-16"
            />
          </button>
          <button
            onClick={() => submitCardOrder("click")}
            className="flex items-center text-5xl text-gray-600 bg-white active:bg-greenPrimary my-7  m-auto rounded-3xl font-semibold font-sans"
          >
            <img
              src="/assets/click.png"
              alt=""
              width={145}
              height={145}
              className="py-14 ml-[70px] mr-16"
            />
          </button>
        </div>
      </div>
      <Link href="/payment">
        <a className="bg-black text-white fixed left-0 bottom-0 py-9 px-52 font-medium text-[40px] font-sans">
          {tr("back")}
        </a>
      </Link>
    </div>
  );
};

export default memo(OnlinePayment);
