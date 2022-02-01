import { FC, memo, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { LinkItem } from "@commerce/types/headerMenu";
import Image from "next/image";
import { Link } from "react-scroll";
import dynamic from "next/dynamic";
import SimpleBar from "simplebar-react";
import { useSelectedLanguage } from "next-export-i18n";
import { useUI } from "@components/ui/context";

const PayWithPoints = () => {
  const { lang: locale } = useSelectedLanguage();
  const { categoryId, setCategoryId } = useUI();
  const [isActice, setIsActive] = useState(true);

  return (
    <div className="bg-primary h-full text-white">
      <div className="text-white font-bold text-6xl m-auto pt-80 px-[232px] text-center font-serif pb-28">
        Привет, Усман!
      </div>
      <div>+ (998) 97 700 00 00</div>
      <div className="m-auto w-max text-center">
        <div className="text-4xl font-sans font-medium">к оплате:</div>
        <div className="font-sans font-bold text-7xl">72 000 </div>
        <div className="bg-white rounded-2xl p-28  mx-10 mb-2 text-black text-4xl">
          QR
        </div>
        <div className="bg-white rounded-2xl mx-10 py-8 px-20">
          <img src="/assets/paymeH.png" alt="" width={169} height={48} />
        </div>
      </div>

      <div className="bg-black text-white fixed left-0 bottom-0 py-9 px-52 font-medium text-[40px] font-sans">
        Назад
      </div>
    </div>
  );
};

export default memo(PayWithPoints);
