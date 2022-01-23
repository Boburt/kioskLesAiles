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

  const secMinPrice = useMemo(() => {
    let minPrice = 0;
    const currentCategory = readyProducts[0];
    if (currentCategory) {
      minPrice = Math.min(
        ...currentCategory.items.map((store: any) => {
          let price: number = parseInt(store.price, 0) || 0;
          if (store.variants && store.variants.length > 0) {
            const activeValue: any = store.variants.find(
              (item: any) => item.active == true
            );
            if (activeValue) price += parseInt(activeValue.price, 0);
          }

          return price;
        })
      );
    }
    return minPrice;
  }, [readyProducts]);

  const secSlides = useMemo(() => {
    let category = readyProducts[0];
    let res: any[] = [];
    if (category) {
      res = chunk(category.items, 12);
    }

    return res;
  }, [readyProducts]);

  const {
    currentSlide,
    goToSlide,
    triggerGoToPrevSlide,
    triggerGoToNextSlide,
  } = useCarousel({ maxSlide: secSlides.length, loop: false });

  return (
    <>
      <div className="w-48 fixed left-0 pt-10 space-y-10 overflow-y-auto h-[calc(100vh-290px)]">
        <CategoriesMenu categories={categories} channelName={channelName} />
      </div>
      <div className="col-span-5 ml-48 mb-10">
        <div className="container mx-auto px-10">
          <div className="">
            <div className="col-span-3 md:hidden"></div>
            <div className="">
              {readyProducts.map((sec: any) => (
                <div
                  key={`productSection_${sec.id}`}
                  id={`productSection_${sec.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <ProductListSectionTitle
                        title={
                          sec?.attribute_data?.name[channelName][locale || "ru"]
                        }
                      />
                      <div>
                        {locale == "ru" && tr("price_from")}
                        <span className="md:w-auto text-primary md:px-0 md:py-0 text-4xl font-serif font-medium">
                          {currency(secMinPrice, {
                            pattern: "# !",
                            separator: " ",
                            decimal: ".",
                            symbol: `${locale == "uz" ? "" : ""}`,
                            precision: 0,
                          }).format()}
                        </span>
                        {locale == "uz" && tr("price_from")}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`bg-greenPrimary p-3 rounded-l-3xl ${
                          currentSlide == 1 ? "hidden" : ""
                        }`}
                        {...triggerGoToPrevSlide}
                      >
                        <ArrowLeftIcon className="w-14 h-14 text-white" />
                      </span>
                      <span
                        className={`bg-greenPrimary p-3 rounded-r-3xl ${
                          currentSlide == secSlides.length ? "hidden" : ""
                        }`}
                        {...triggerGoToNextSlide}
                      >
                        <ArrowRightIcon className="w-14 h-14 text-white" />
                      </span>
                    </div>
                  </div>
                  {secSlides.map((slide: any, index: number) => (
                    <div
                      key={`productSection_${sec.id}_${index}`}
                      data-current-slide={currentSlide}
                      className={`grid grid-cols-3 gap-3 ${
                        index + 1 == currentSlide ? "" : "hidden"
                      }`}
                    >
                      {slide.map((item: any) => (
                        <ProductItemNew
                          key={`productSection_${sec.id}_${index}_${item.id}`}
                          product={item}
                          channelName={channelName}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* <div>
      <CartWithNoSSR channelName={channelName} />
    </div> */}
    </>
  );
}

Menu.Layout = Layout;

export default Menu;
