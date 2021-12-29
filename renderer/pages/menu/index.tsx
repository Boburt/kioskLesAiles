import React from "react";
import Head from "next/head";
import Link from "next/link";
import Prodcart from "@components/mainProductCart";
import Header from "@components/Header";
import { GetServerSidePropsContext, GetStaticPropsContext } from "next";
import commerce from "@lib/api/commerce";

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

function Menu({
  products,
  categories,
}: {
  products: any[];
  categories: any[];
}) {
  console.log(categories);
  return (
    <>
      <Header />
      <main className="grid grid-flow-row-dense grid-cols-6 bg-white text-black text-center">
        <div className="col-span-1 block space-y-10 pt-10">
          <div>Хиты</div>
          <div>Сеты</div>
          <div>Лестеры</div>
          <div>Лонгеры</div>
          <div>Бургеры</div>
          <div>Курица</div>
          <div>Снеки</div>
          <div>Салаты</div>
          <div>Дисерты</div>
          <div>Напитки</div>
          <div>Соусы</div>
        </div>
        <div className="col-span-5">
          <Prodcart />
        </div>
      </main>
    </>
  );
}

export default Menu;
