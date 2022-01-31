import React, { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Header from "@components/Header";
import { GetServerSidePropsContext, GetStaticPropsContext } from "next";
import commerce from "@lib/api/commerce";
import { useRouter } from "next/router";
import CategoriesMenu from "@components/CategoriesMenu";
import defaultChannel from "@lib/defaultChannel";
import ProductListSectionTitle from "@components/ProductListSectionTitle";
import ProductItemNew from "@components/ProductItemNew";
import { Product } from "@commerce/types/product";
import dynamic from "next/dynamic";
import Footer from "@components/footer";
import Layout from "@components/Layout";
import { useUI } from "@components/ui/context";
import { useTranslation } from "next-export-i18n";
import currency from "currency.js";
import { useCarousel } from "@webeetle/react-headless-hooks";
import { chunk } from "lodash";
import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/solid";
import ProductSection from "@components/ProductSection";
import OnlinePayment from "@components/OnlinePayment";
import PaymeComponent from "@components/PaymeComponent";

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

function Payme({
  products,
  categories,
}: {
  products: any[];
  categories: any[];
}) {
  const { t: tr } = useTranslation("common");
  const router = useRouter();
  return <PaymeComponent />;
}

Payme.Layout = Layout;

export default Payme;
