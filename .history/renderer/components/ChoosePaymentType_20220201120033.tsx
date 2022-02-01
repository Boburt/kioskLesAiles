import { FC, memo, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { LinkItem } from "@commerce/types/headerMenu";
import Image from "next/image";
import { Link } from "react-scroll";
import dynamic from "next/dynamic";
import SimpleBar from "simplebar-react";
import { useSelectedLanguage } from "next-export-i18n";
import { useUI } from "@components/ui/context";

const ChoosePaymentType = () => {
  const { lang: locale } = useSelectedLanguage();
  const { categoryId, setCategoryId } = useUI();
  const [isActice, setIsActive] = useState(true);

  return (
    <div className="bg-primary h-full">
      <div className="text-white font-bold text-6xl m-auto pt-80 px-[304px] text-center font-serif pb-28">
        Выберите способы оплаты
      </div>

      <div className="flex items-center text-5xl text-gray-600 bg-greenPrimary 0 w-[688px] m-auto rounded-3xl font-semibold font-sans">
        <img
          src="/assets/card.png"
          alt=""
          width={50}
          height={40}
          className="py-14 ml-[70px] mr-16"
        />
        <div>Оплата картой</div>
      </div>
      <div className="flex items-center text-5xl text-gray-600 bg-white my-7 w-[688px] m-auto rounded-3xl font-semibold font-sans">
        <img
          src="/assets/onlinePay.png"
          alt=""
          width={50}
          height={40}
          className="py-14 ml-[70px] mr-16"
        />
        <div>Оплата онлайн</div>
      </div>
      <div className="flex items-center text-5xl text-gray-600 bg-white w-[688px] m-auto rounded-3xl font-semibold font-sans">
        <img
          src="/assets/cache.png"
          alt=""
          width={50}
          height={40}
          className="py-14 ml-[70px] mr-16"
        />
        <div>Оплата бонусами</div>
      </div>
      <div className="bg-black text-white fixed left-0 bottom-0 py-9 px-52 font-medium text-[40px] font-sans">
        Назад
      </div>
    </div>
  );
};

export default memo(ChoosePaymentType);
