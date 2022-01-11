import React, { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Header from "@components/Header";
import { GetServerSidePropsContext, GetStaticPropsContext } from "next";
import commerce from "@lib/api/commerce";
import { useRouter } from "next/router";
import defaultChannel from "@lib/defaultChannel";
import dynamic from "next/dynamic";
import Footer from "@components/footer";
import Layout from "@components/Layout";
import { useUI } from "@components/ui/context";

// const { publicRuntimeConfig } = getConfig()

const CartWithNoSSR = dynamic(
  () => import('@components/SmallCart'),
  { ssr: false }
)

// let webAddress = publicRuntimeConfig.apiUrl

export async function getServerSideProps({
  preview,
  locale,
  locales,
  query,
}: GetServerSidePropsContext) {
  const config = { locale, locales, queryParams: query }
  const productsPromise = commerce.getAllProducts({
    variables: { first: 6 },
    config,
    preview,
    // Saleor provider only
    ...({ featured: true } as any),
  })
  const pagesPromise = commerce.getAllPages({ config, preview })
  const siteInfoPromise = commerce.getSiteInfo({ config, preview })
  const { products }: { products: any[] } = await productsPromise
  const { pages } = await pagesPromise
  const {
    categories,
    brands,
    topMenu,
    footerInfoMenu,
    socials,
    cities,
    currentCity,
  } = await siteInfoPromise
  if (!currentCity) {
    return {
      notFound: true,
    }
  }

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
      currentCity
    },
  }
}

// const getChannel = async () => {
//     const channelData = await defaultChannel()
//     setChannelName(channelData.name)
//   }


function CartPage (){
    return(
        <>
        </>
    )
}

export default CartPage;