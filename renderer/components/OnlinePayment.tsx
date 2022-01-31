import { FC, memo, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { LinkItem } from "@commerce/types/headerMenu";
import Image from "next/image";
import { Link } from "react-scroll";
import dynamic from "next/dynamic";
import SimpleBar from "simplebar-react";
import { useSelectedLanguage } from "next-export-i18n";
import { useUI } from "@components/ui/context";

const OnlinePayment = () => {
  const { lang: locale } = useSelectedLanguage();
  const { categoryId, setCategoryId } = useUI();
  const [isActice, setIsActive] = useState(true);

  return (
    <div className="bg-primary h-full">
      <div className="gap-5 grid grid-cols-2 m-auto w-[688px] pt-[546px]">
        <div className="items-center text-5xl text-gray-600 bg-green-400  m-auto rounded-3xl font-semibold font-sans">
          <img
            src="/assets/payme.png"
            alt=""
            width={145}
            height={145}
            className="py-14 ml-[70px] mr-16"
          />
        </div>
        <div className="flex items-center text-5xl text-gray-600 bg-white my-7  m-auto rounded-3xl font-semibold font-sans">
          <img
            src="/assets/click.png"
            alt=""
            width={145}
            height={145}
            className="py-14 ml-[70px] mr-16"
          />
        </div>
        <div className="flex items-center text-5xl text-gray-600 bg-white  m-auto rounded-3xl font-semibold font-sans">
          <img
            src="/assets/oson.png"
            alt=""
            width={145}
            height={145}
            className="py-14 ml-[70px] mr-16"
          />
        </div>
        <div className="flex items-center text-5xl text-gray-600 bg-white  m-auto rounded-3xl font-semibold font-sans">
          <img
            src="/assets/apelsin.png"
            alt=""
            width={145}
            height={145}
            className="py-14 ml-[70px] mr-16"
          />
        </div>
      </div>
      <div className="bg-black text-white fixed left-0 bottom-0 py-9 px-52 font-medium text-[40px] font-sans">
        Назад
      </div>
    </div>
  );
};

export default memo(OnlinePayment);
