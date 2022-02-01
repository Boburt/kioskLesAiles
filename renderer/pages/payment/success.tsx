import React, { useEffect, useMemo, useState } from "react";
import { GetServerSidePropsContext, GetStaticPropsContext } from "next";
import commerce from "@lib/api/commerce";
import { useRouter } from "next/router";
import Layout from "@components/Layout";
import { useTranslation } from "next-export-i18n";
import PaymentSuccess from "@components/PaymentSuccess";

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

function Success({
  products,
  categories,
}: {
  products: any[];
  categories: any[];
}) {
  const { t: tr } = useTranslation("common");
  const router = useRouter();
  return <PaymentSuccess />;
}

Success.Layout = Layout;

export default Success;
