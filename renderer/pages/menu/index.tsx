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


  const printOrder = () => {
    const order = {
      "id": "ny61w13zko08qld",
      "display_id": "#ORD-21288",
      "sub_total": 17900000,
      "type": "payme",
      "delivery_total": 0,
      "discount_total": 0,
      "tax_total": 0,
      "shipping_preference": null,
      "shipping_method": null,
      "order_total": 17900000,
      "reference": "2022-03-12-14-06-29-1298921514",
      "customer_reference": null,
      "invoice_reference": "#INV-2022-03-12-14-06-29-1298921514",
      "vat_no": null,
      "tracking_no": null,
      "dispatched_at": null,
      "currency": "UZS",
      "customer_name": "Davr TEST",
      "contact_details": {
          "phone": "+998909514019",
          "email": null
      },
      "billing_details": {
          "phone": "+998909514019",
          "email": "yul.davron.93@gmail.com",
          "company_name": null,
          "firstname": "Davr",
          "lastname": "TEST",
          "address": null,
          "address_two": null,
          "address_three": null,
          "city": null,
          "county": null,
          "state": null,
          "country": null,
          "zip": null
      },
      "shipping_details": {
          "preference": null,
          "company_name": null,
          "phone": "+998909514019",
          "email": "yul.davron.93@gmail.com",
          "firstname": "Davr",
          "lastname": "TEST",
          "address": null,
          "address_two": null,
          "address_three": null,
          "city": null,
          "county": null,
          "state": null,
          "country": null,
          "zip": null
      },
      "status": "awaiting-payment",
      "order_status": {
          "label": "Ждём оплату",
          "color": "#848a8c"
      },
      "created_at": "2022-03-12T09:06:29.000000Z",
      "updated_at": "2022-03-12T09:06:29.000000Z",
      "placed_at": "2022-03-12T09:06:29.000000Z",
      "notes": "",
      "meta": [],
      "basket": {
          "data": {
              "id": "lm08v5r7l6dy4jo",
              "total": 0,
              "sub_total": 0,
              "currency": "UZS",
              "tax_total": 0,
              "discount_total": 0,
              "changed": false,
              "has_exclusions": false,
              "meta": [],
              "order": []
          }
      },
      "discounts": {
          "data": []
      },
      "lines": {
          "data": [
              {
                  "id": "pxyz7dpqz8735n6",
                  "quantity": 1,
                  "line_total": 4300000,
                  "discount_total": 0,
                  "delivery_total": 0,
                  "unit_price": 4300000,
                  "unit_qty": 1,
                  "tax_total": 0,
                  "tax_rate": 0,
                  "description": "Биг сет",
                  "option": "",
                  "sku": "40031",
                  "is_shipping": false,
                  "is_manual": false,
                  "meta": [],
                  "variant": []
              },
              {
                  "id": "v3y20m4lkq095np",
                  "quantity": 1,
                  "line_total": 3700000,
                  "discount_total": 0,
                  "delivery_total": 0,
                  "unit_price": 3700000,
                  "unit_qty": 1,
                  "tax_total": 0,
                  "tax_rate": 0,
                  "description": "Лестер сет",
                  "option": "",
                  "sku": "40030",
                  "is_shipping": false,
                  "is_manual": false,
                  "meta": [],
                  "variant": []
              },
              {
                  "id": "583rw4n3m57olvx",
                  "quantity": 1,
                  "line_total": 1800000,
                  "discount_total": 0,
                  "delivery_total": 0,
                  "unit_price": 1800000,
                  "unit_qty": 1,
                  "tax_total": 0,
                  "tax_rate": 0,
                  "description": "Классик",
                  "option": "",
                  "sku": "00164",
                  "is_shipping": false,
                  "is_manual": false,
                  "meta": [],
                  "variant": []
              },
              {
                  "id": "6qyn0eogk9w8vek",
                  "quantity": 1,
                  "line_total": 2000000,
                  "discount_total": 0,
                  "delivery_total": 0,
                  "unit_price": 2000000,
                  "unit_qty": 1,
                  "tax_total": 0,
                  "tax_rate": 0,
                  "description": "Чикен Чиз",
                  "option": "",
                  "sku": "00019",
                  "is_shipping": false,
                  "is_manual": false,
                  "meta": [],
                  "variant": []
              },
              {
                  "id": "ev6l73gyo2029j1",
                  "quantity": 1,
                  "line_total": 1600000,
                  "discount_total": 0,
                  "delivery_total": 0,
                  "unit_price": 1600000,
                  "unit_qty": 1,
                  "tax_total": 0,
                  "tax_rate": 0,
                  "description": "Лонгер",
                  "option": "",
                  "sku": "00092",
                  "is_shipping": false,
                  "is_manual": false,
                  "meta": [],
                  "variant": []
              },
              {
                  "id": "zm3nwy68y20rk8g",
                  "quantity": 1,
                  "line_total": 2700000,
                  "discount_total": 0,
                  "delivery_total": 0,
                  "unit_price": 2700000,
                  "unit_qty": 1,
                  "tax_total": 0,
                  "tax_rate": 0,
                  "description": "Стрипсы 5",
                  "option": "",
                  "sku": "00923",
                  "is_shipping": false,
                  "is_manual": false,
                  "meta": [],
                  "variant": []
              },
              {
                  "id": "eq3owxpn9r71gz9",
                  "quantity": 1,
                  "line_total": 900000,
                  "discount_total": 0,
                  "delivery_total": 0,
                  "unit_price": 900000,
                  "unit_qty": 1,
                  "tax_total": 0,
                  "tax_rate": 0,
                  "description": "Картошка фри S",
                  "option": "",
                  "sku": "00101",
                  "is_shipping": false,
                  "is_manual": false,
                  "meta": [],
                  "variant": []
              },
              {
                  "id": "odyx0gl8837npev",
                  "quantity": 3,
                  "line_total": 600000,
                  "discount_total": 0,
                  "delivery_total": 0,
                  "unit_price": 200000,
                  "unit_qty": 1,
                  "tax_total": 0,
                  "tax_rate": 0,
                  "description": "Кетчуп",
                  "option": "",
                  "sku": "00105",
                  "is_shipping": false,
                  "is_manual": false,
                  "meta": [],
                  "variant": []
              },
              {
                  "id": "g6q87n3gge05nd2",
                  "quantity": 1,
                  "line_total": 300000,
                  "discount_total": 0,
                  "delivery_total": 0,
                  "unit_price": 300000,
                  "unit_qty": 1,
                  "tax_total": 0,
                  "tax_rate": 0,
                  "description": "Чили",
                  "option": "",
                  "sku": "00124",
                  "is_shipping": false,
                  "is_manual": false,
                  "meta": [],
                  "variant": []
              }
          ]
      },
      "shipping": null,
      "user": {
          "data": {
              "id": "2lwmpw9m",
              "email": "yul.davron.93@gmail.com",
              "name": "Davr TEST",
              "created_at": "2021-06-16T06:00:16.000000Z"
          }
      }
  };
    postPrint(order);
  };

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
            <button onClick={printOrder}>Printttt</button>
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
