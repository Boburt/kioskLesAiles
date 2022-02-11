import React, { useEffect, useMemo, useState } from "react";
import { GetServerSidePropsContext, GetStaticPropsContext } from "next";
import commerce from "@lib/api/commerce";
import { useRouter } from "next/router";
import Layout from "@components/Layout";
import { useTranslation } from "next-export-i18n";
import DontHaveEnaughtPoints from "@components/DontHaveEnaughtPoints";
import Link from "next/link";
import { useUI } from "@components/ui/context";

export async function getStaticProps({
  preview,
  locale,
  locales,
}: GetStaticPropsContext) {
  const config = { locale, locales };
  const productsPromise = commerce.getAllProducts({
    variables: { first: 6 },
    config,
    preview,
    // Saleor provider only
    ...({ featured: true } as any),
  });
  const pagesPromise = commerce.getAllPages({ config, preview });
  const siteInfoPromise = commerce.getSiteInfo({ config, preview });
  const { products }: { products: any[] } = await productsPromise;
  const { pages } = await pagesPromise;
  const {
    categories,
    brands,
    topMenu,
    footerInfoMenu,
    socials,
    cities,
    // currentCity,
  } = await siteInfoPromise;
  //   if (!currentCity) {
  //     return {
  //       notFound: true,
  //     };
  //   }

  return {
    props: {
      products,
      categories,
      brands,
      pages,
      topMenu,
      footerInfoMenu,
      socials,
      cities,
      //   currentCity,
    },
  };
}

function dontEnaughtPoints({
  products,
  categories,
}: {
  products: any[];
  categories: any[];
}) {
  const { t: tr } = useTranslation("common");
  const router = useRouter();
  const { setUserData, setOrderData } = useUI();

  const makeOrderAgain = () => {
    setUserData(null);
    setOrderData(null);
    router.push("/home");
  };

  return (
    <div className="bg-primary h-full text-white">
      <div className="text-white font-bold text-6xl m-auto pt-80 px-[232px] text-center font-serif pb-28">
        {tr("not_payed")}
      </div>
      <div className="m-auto w-max text-center">
        <img src="/assets/notEnaught.png" alt="" />
      </div>
      <button
        onClick={makeOrderAgain}
        className="bg-black bottom-0 fixed py-20 text-4xl text-center text-white w-full font-sans font-medium"
      >
        {tr("order_again")}
      </button>
    </div>
  );
}

dontEnaughtPoints.Layout = Layout;

export default dontEnaughtPoints;
