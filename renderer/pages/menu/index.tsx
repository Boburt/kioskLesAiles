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
import useCart from "@framework/cart/use-cart";
import postPrint from "@lib/pos-print";

const CartWithNoSSR = dynamic(() => import("@components/SmallCart"), {
  ssr: false,
});

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
  const { t: tr } = useTranslation("common");
  const router = useRouter();
  const { locale } = router;
  const [channelName, setChannelName] = useState("chopar");
  const [isStickySmall, setIsStickySmall] = useState(false);
  const { categoryId, setCategoryId } = useUI();
  let cartId: string | null = null;

  if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
    cartId = localStorage.getItem("basketId");
  }
  const { data, isLoading, isEmpty, mutate } = useCart({
    cartId,
  });

  const getChannel = async () => {
    const channelData = await defaultChannel();
    setChannelName(channelData.name);
  };
  const readyProducts = useMemo(() => {
    let resProds = products;
    if (categoryId) {
      resProds = products.filter((section: any) => section.id == categoryId);
    }

    return resProds
      .map((prod: any) => {
        if (prod.half_mode) {
          return null;
        }
        if (prod.variants && prod.variants.length) {
          prod.variants = prod.variants.map((v: any, index: number) => {
            if (index === 1) {
              v.active = true;
            } else {
              v.active = false;
            }

            return v;
          });
        } else if (prod.items && prod.items.length) {
          prod.items = prod.items.map((item: any) => {
            item.variants = item.variants.map((v: any, index: number) => {
              if (index === 1) {
                v.active = true;
              } else {
                v.active = false;
              }

              return v;
            });

            return item;
          });
        }
        return prod;
      })
      .filter((prod: any) => prod != null);
  }, [products, categoryId]);

  const halfModeProds = useMemo(() => {
    return products
      .map((prod: any) => {
        if (!prod.half_mode) {
          return null;
        }
        if (prod.variants && prod.variants.length) {
          prod.variants = prod.variants.map((v: any, index: number) => {
            if (index === 1) {
              v.active = true;
            } else {
              v.active = false;
            }

            return v;
          });
        } else if (prod.items && prod.items.length) {
          prod.items = prod.items.map((item: any) => {
            item.variants = item.variants.map((v: any, index: number) => {
              if (index === 1) {
                v.active = true;
              } else {
                v.active = false;
              }

              return v;
            });

            return item;
          });
        }
        return prod;
      })
      .filter((prod: any) => prod != null);
  }, [products]);

  useEffect(() => {
    if (!categoryId) {
      setCategoryId(categories[0].id);
    }
  }, []);
  return (
    <>
      <div className="w-48 fixed left-0 pt-10 space-y-10 overflow-y-auto ">
        <CategoriesMenu categories={categories} channelName={channelName} />
      </div>
      <div className="col-span-5 ml-48 mb-40 mt-[30px]">
        <div className="container mx-auto px-10">
          <div className="">
            <div className="col-span-3 md:hidden"></div>
            <div className="">
              {readyProducts.map((sec: any) => (
                <ProductSection
                  key={sec.id}
                  sec={sec}
                  channelName={channelName}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div
        className={`${
          isEmpty ? "hidden" : ""
        } bottom-0 fixed left-0 w-full h-[365px]`}
      >
        <CartWithNoSSR channelName={channelName} />
      </div>
    </>
  );
}

Menu.Layout = Layout;

export default Menu;
