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

const OrderSuccess = () => {
  const { lang: locale } = useSelectedLanguage();
  const router = useRouter();
  const { id } = router.query;

  return (
    <div className="bg-primary h-full text-white">
      <div className="text-white font-bold text-6xl m-auto pt-60 text-center font-serif">
        Спасибо что выбрали нас !
      </div>
      <div className="text-white font-bold text-6xl m-auto pt-14 text-center font-serif">
        Ваш заказ
      </div>
      <div className="text-greenPrimary font-bold text-[200px] m-auto pt-7 text-center font-serif">
        № {id}
      </div>
      <div className="text-white font-bold text-6xl m-auto pt-14 text-center font-serif px-72">
        Пройдите в зону выдачи заказов
      </div>
      <Link href="/menu">
        <a className="bg-black bottom-0 fixed py-20 text-4xl text-center text-white w-full font-sans font-medium">
          Заказать снова
        </a>
      </Link>
    </div>
  );
};

OrderSuccess.Layout = Layout;

export default OrderSuccess;
