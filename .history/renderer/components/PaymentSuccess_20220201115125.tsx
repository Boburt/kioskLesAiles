import { FC, memo, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { LinkItem } from "@commerce/types/headerMenu";
import Image from "next/image";
import { Link } from "react-scroll";
import dynamic from "next/dynamic";
import SimpleBar from "simplebar-react";
import { useSelectedLanguage } from "next-export-i18n";
import { useUI } from "@components/ui/context";

const PaymentSuccess = () => {
  const { lang: locale } = useSelectedLanguage();
  const { categoryId, setCategoryId } = useUI();
  const [isActice, setIsActive] = useState(true);

  return (
    <div className="bg-primary h-full text-white">
      <div className="text-white font-bold text-6xl m-auto pt-80 px-[232px] text-center font-serif pb-28">
        Оплата прошла успешно
      </div>
      <div className="m-auto w-max text-center">
        <img src="/assets/paymentSuccess.png" alt="" />
      </div>

      <div className="bg-black text-white fixed left-0 bottom-0 py-9 px-52 font-medium text-[40px] font-sans">
        Назад
      </div>
    </div>
  );
};

export default memo(PaymentSuccess);
