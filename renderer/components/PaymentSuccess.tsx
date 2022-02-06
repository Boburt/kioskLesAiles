import { FC, memo, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { LinkItem } from "@commerce/types/headerMenu";
import Image from "next/image";
import { Link } from "react-scroll";
import dynamic from "next/dynamic";
import SimpleBar from "simplebar-react";
import { useSelectedLanguage } from "next-export-i18n";
import { useUI } from "@components/ui/context";
import useTranslation from "next-translate/useTranslation";

const PaymentSuccess = () => {
  const { lang: locale } = useSelectedLanguage();
  const { categoryId, setCategoryId } = useUI();
  const [isActice, setIsActive] = useState(true);
  const { t: tr } = useTranslation("common");

  return (
    <div className="bg-primary h-full text-white">
      <div className="text-white font-bold text-6xl m-auto pt-80 px-[232px] text-center font-serif pb-28">
        {tr("payment_was_successful")}
      </div>
      <div className="m-auto w-max text-center">
        <img src="/assets/paymentSuccess.png" alt="" />
      </div>
    </div>
  );
};

export default memo(PaymentSuccess);
