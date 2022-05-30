import { FC, memo, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { LinkItem } from "@commerce/types/headerMenu";
import Image from "next/image";
import dynamic from "next/dynamic";
import SimpleBar from "simplebar-react";
import { useSelectedLanguage } from "next-export-i18n";
import { useUI } from "@components/ui/context";
import currency from "currency.js";
import Link from "next/link";
import { QRCode } from "react-qrcode-logo";
import axios from "axios";
import getConfig from "next/config";
import Cookies from "js-cookie";
import Hashids from "hashids";

let otpTimerRef: NodeJS.Timeout;
let orderStatusTimerRef: NodeJS.Timeout;

const { publicRuntimeConfig } = getConfig();
let webAddress = publicRuntimeConfig.apiUrl;
axios.defaults.withCredentials = true;
const WaitingPaymentComponent = () => {
  const { lang: locale } = useSelectedLanguage();
  const { categoryId, setCategoryId, orderData, setOrderData } = useUI();
  const [isActice, setIsActive] = useState(true);
  const [otpShowCode, setOtpShowCode] = useState(0);
  const router = useRouter();

  const otpTime = useRef(0);

  console.log(orderData);

  const startTimeout = () => {
    otpTimerRef = setInterval(() => {
      if (otpTime.current > 0) {
        otpTime.current = otpTime.current - 1;
        setOtpShowCode(otpTime.current);
      } else {
        clearInterval(otpTimerRef);
        clearInterval(orderStatusTimerRef);
        setOrderData(null);
        router.push("/payment/not_payed");
      }
    }, 1000);
  };

  const checkOrderStatus = async () => {
    orderStatusTimerRef = setInterval(async () => {
      // if (orderData?.status === "paid") {
      //   clearInterval(orderStatusTimerRef);
      //   router.push("/");
      // }
      const otpToken = Cookies.get("opt_token");
      const { data: order } = await axios.get(
        `${webAddress}/api/orders?id=${orderData.order.id}`,
        {
          headers: {
            Authorization: `Bearer ${otpToken}`,
          },
        }
      );
      if (order.status != "awaiting-payment") {
        const hashids = new Hashids(
          "order",
          15,
          "abcdefghijklmnopqrstuvwxyz1234567890"
        );
        router.push(`/order/${hashids.decode(orderData.order.id)}`);
      }
    }, 5000);
  };

  useEffect(() => {
    otpTime.current = 60;
    setOtpShowCode(60);
    startTimeout();
    checkOrderStatus();
  }, []);

  const otpTimerText = useMemo(() => {
    let text = "";
    const minutes: number = parseInt((otpShowCode / 60).toString(), 0);
    const seconds: number = otpShowCode % 60;
    if (minutes > 0) {
      text += minutes + ":";
    } else {
      text += "0:";
    }

    if (seconds > 0) {
      text += seconds < 10 ? "0" + seconds : seconds;
    } else {
      text += "00";
    }
    return text;
  }, [otpShowCode]);

  return (
    <div className="bg-primary h-full text-white">
      {console.log(orderData)}
      {orderData && (
        <>
          <div className="text-white font-bold text-6xl m-auto pt-40 px-[232px] text-center font-serif pb-28">
            Отсканируйте QR-код и оплатите заказ
          </div>
          <div className="m-auto w-max text-center">
            <div className="text-4xl font-sans font-medium">к оплате:</div>
            <div className="font-sans font-bold text-7xl">
              {currency(orderData.order.order_total / 100, {
                pattern: "# !",
                separator: " ",
                decimal: ".",
                symbol: ``,
                precision: 0,
              }).format()}{" "}
            </div>
            <div className="bg-white rounded-2xl p-7 w-96 mb-2 text-black text-4xl mt-5 flex items-center h-96">
              <div className="m-auto">
                <QRCode
                  value={orderData.transaction.payment_link}
                  logoImage={`/assets/${orderData.order.type}.png`}
                  size={285}
                />
              </div>
            </div>
            <div className="bg-white flex justify-around py-8 rounded-2xl">
              <img
                src={`/assets/order_payment/${orderData.order.type}.png`}
                alt=""
                width={169}
                height={48}
              />
            </div>
          </div>
          <div className="bg-white flex justify-around mt-5 py-8 px-4 rounded-2xl text-black w-96 mx-auto">
            <div className="font-medium font-sans text-3xl flex-grow">
              Осталось времени:
            </div>
            <div className="flex-grow font-bold font-sans text-5xl w-20">
              {otpTimerText}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default memo(WaitingPaymentComponent);
