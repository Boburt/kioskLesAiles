import { FC, memo, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { LinkItem } from "@commerce/types/headerMenu";
import Image from "next/image";
import { Link } from "react-scroll";
import dynamic from "next/dynamic";
import SimpleBar from "simplebar-react";
import { useSelectedLanguage } from "next-export-i18n";
import { useUI } from "@components/ui/context";

const DontHaveEnaughtPoints = () => {
  const { lang: locale } = useSelectedLanguage();
  const { categoryId, setCategoryId } = useUI();
  const [isActice, setIsActive] = useState(true);

  return (
    <div className="bg-primary h-full text-white">
      <div className="text-white font-bold text-6xl m-auto pt-80 px-[232px] text-center font-serif pb-28">
        Для списания у вас не хватает баллов
      </div>
      <div className="m-auto w-max text-center">
        <img src="/assets/notEnaught.png" alt="" />
      </div>
      <div className="bg-black bottom-0 fixed py-20 text-4xl text-center text-white w-full font-sans font-medium">
        Оплатить другим способом
      </div>
    </div>
  );
};

export default memo(DontHaveEnaughtPoints);
