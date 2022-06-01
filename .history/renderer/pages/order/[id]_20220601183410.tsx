import { FC, memo, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { LinkItem } from "@commerce/types/headerMenu";
import Image from "next/image";
import dynamic from "next/dynamic";
import SimpleBar from "simplebar-react";
import { useSelectedLanguage } from "next-export-i18n";
import { useUI } from "@components/ui/context";
import Layout from "@components/Layout";
import Link from "next/link";
import {
  useTranslation,
  useLanguageQuery,
  LanguageSwitcher,
} from "next-export-i18n";
import postPrint from "@lib/pos-print";
import axios from "axios";
import getConfig from "next/config";

const { publicRuntimeConfig } = getConfig();
let webAddress = publicRuntimeConfig.apiUrl;
declare global {
  interface Window {
    davr: any; // 👈 turn off type checking
  }
}

const OrderSuccess = () => {
  const { orderData } = useUI();
  const { lang: locale } = useSelectedLanguage();
  const router = useRouter();
  const { id } = router.query;
  const { t: tr } = useTranslation("common");
  const [isLoading, setIsLoading] = useState(true);
  const [order, setOrder] = useState<any>();

  const printOrder = () => {
    if (order) {
      postPrint(order);
    }
  };

  const loadOrder = async () => {
    setTimeout(async () => {
      const otpToken = localStorage.getItem("opt_token");
      const { data: orderData } = await axios.get(
        `${webAddress}/api/orders?id=${id}`,
        {
          headers: {
            Authorization: `Bearer ${otpToken}`,
          },
        }
      );
      setOrder(orderData);
      setIsLoading(false);
      printOrder();
    }, 5500);
  };

  useEffect(() => {
    loadOrder();
  }, []);

  return (
    <div className="bg-primary h-full text-white">
      {isLoading ? (
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
      ) : (
        <>
          <div className="text-white font-bold text-6xl m-auto pt-60 text-center font-serif">
            {tr("thanks_choosing_us")}
          </div>
          <div className="text-white font-bold text-6xl m-auto pt-14 text-center font-serif">
            {tr("your_order")}
          </div>
          <div className="text-greenPrimary font-bold text-[200px] m-auto pt-7 text-center font-serif">
            № {id}
          </div>
          <div className="text-white font-bold text-6xl m-auto pt-14 text-center font-serif px-72">
            {tr("go_to_the_pickup")}
          </div>
          <Link href="/menu">
            <a className="bg-black bottom-0 fixed py-20 text-4xl text-center text-white w-full font-sans font-medium">
              {tr("order_again")}
            </a>
          </Link>
        </>
      )}
    </div>
  );
};

OrderSuccess.Layout = Layout;

export default OrderSuccess;
