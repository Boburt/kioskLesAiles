import { FC, memo, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { LinkItem } from "@commerce/types/headerMenu";
import Image from "next/image";
import dynamic from "next/dynamic";
import SimpleBar from "simplebar-react";
import { useSelectedLanguage } from "next-export-i18n";
import { useUI } from "@components/ui/context";
import Link from "next/link";
import useTranslation from "next-translate/useTranslation";

const DontHaveEnaughtPoints = () => {
  const { lang: locale } = useSelectedLanguage();
  const { categoryId, setCategoryId } = useUI();
  const [isActice, setIsActive] = useState(true);
  const { t: tr } = useTranslation("common");

  return (
    <div className="bg-primary h-full text-white">
      <div className="text-white font-bold text-6xl m-auto pt-80 px-[232px] text-center font-serif pb-28">
        {tr("dont_have_enaught_points")}
      </div>
      <div className="m-auto w-max text-center">
        <img src="/assets/notEnaught.png" alt="" />
      </div>
      <Link href="/payment">
        <a className="bg-black bottom-0 fixed py-20 text-4xl text-center text-white w-full font-sans font-medium">
          {tr("pay_in_another_way")}
        </a>
      </Link>
    </div>
  );
};

export default memo(DontHaveEnaughtPoints);
