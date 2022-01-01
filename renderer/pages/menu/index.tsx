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
  const router = useRouter();
  const { locale } = router;
  const [channelName, setChannelName] = useState("chopar");
  const [isStickySmall, setIsStickySmall] = useState(false);

  const getChannel = async () => {
    const channelData = await defaultChannel();
    setChannelName(channelData.name);

    console.log(categories);
  };
  const readyProducts = useMemo(() => {
    return products
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
  }, [products]);

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
  return (
    <>
      <div className="col-span-1 block space-y-10 pt-10">
        <CategoriesMenu categories={categories} channelName={channelName} />
      </div>
      <div className="col-span-5">
        <div className="container mx-auto">
          <div className="">
            <div className="col-span-3 md:hidden"></div>
            <div className="">
              {readyProducts.map((sec: any) => (
                <div key={sec.id} id={`productSection_${sec.id}`}>
                  <ProductListSectionTitle
                    title={
                      sec?.attribute_data?.name[channelName][locale || "ru"]
                    }
                  />
                  <div className="grid md:grid-cols-4 grid-cols-2  gap-3 px-4 md:px-0 md:space-y-0">
                    {sec.items.map((prod: any) => (
                      <ProductItemNew
                        product={prod}
                        key={prod.id}
                        channelName={channelName}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

Menu.Layout = Layout;

export default Menu;
