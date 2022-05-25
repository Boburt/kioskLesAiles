import React, { useEffect, useMemo, useState } from "react";
import { GetServerSidePropsContext, GetStaticPropsContext } from "next";
import commerce from "@lib/api/commerce";
import { useRouter } from "next/router";
import Layout from "@components/Layout";
import { useTranslation } from "next-export-i18n";
import DontHaveEnaughtPoints from "@components/DontHaveEnaughtPoints";

export async function getStaticProps({
  preview,
  locale,
  locales,
}: GetStaticPropsContext) {
  const config = { locale, locales };
  const pagesPromise = commerce.getAllPages({ config, preview });
  const siteInfoPromise = commerce.getSiteInfo({ config, preview });
  const { pages } = await pagesPromise;
  const {
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

function dontEnaughtPoints({}: { products: any[]; categories: any[] }) {
  const { t: tr } = useTranslation("common");
  const router = useRouter();
  return <DontHaveEnaughtPoints />;
}

dontEnaughtPoints.Layout = Layout;

export default dontEnaughtPoints;
