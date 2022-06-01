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
    const otpToken = localStorage.getItem("opt_token");
    const { data: orderData } = await axios.get(
      `${webAddress}/api/orders?id=${id}`,
      {
        headers: {
          Authorization: `Bearer ${otpToken}`,
        },
      }
    );
    setOrder(orderData.order);
    setIsLoading(false);
    printOrder();
  };

  useEffect(() => {
    loadOrder();
  }, []);

  return (
    <div className="bg-primary h-full text-white">
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
    </div>
  );
};

OrderSuccess.Layout = Layout;

export default OrderSuccess;
