import type { GetServerSidePropsContext, GetStaticPropsContext } from "next";
import commerce from "@lib/api/commerce";
import useCart from "@framework/cart/use-cart";
import Image from "next/image";
import { XIcon, MinusIcon, PlusIcon, TrashIcon } from "@heroicons/react/solid";
import { useForm } from "react-hook-form";
import useTranslation from "next-translate/useTranslation";
import getConfig from "next/config";
import { useRouter } from "next/router";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import Hashids from "hashids";
import axios from "axios";
import Cookies from "js-cookie";
import defaultChannel from "@lib/defaultChannel";
import currency from "currency.js";
import { useUI } from "@components/ui/context";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Layout from "@components/Layout";
import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/solid";

import { chunk } from "lodash";
import { useCarousel } from "@webeetle/react-headless-hooks";
import { Dialog, Transition } from "@headlessui/react";
import Cashback from "@components/Cashback";
import SignInModal from "@components/SignInModal";

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

const { publicRuntimeConfig } = getConfig();
let webAddress = publicRuntimeConfig.apiUrl;
axios.defaults.withCredentials = true;

function Cart() {
  const [channelName, setChannelName] = useState("chopar");
  const [recomendedItems, setRecomendedItems] = useState([]);

  const getChannel = async () => {
    const channelData = await defaultChannel();
    setChannelName(channelData.name);
  };

  const { activeCity, locationData } = useUI();
  useEffect(() => {
    getChannel();
  }, []);

  const { t: tr } = useTranslation("common");
  let cartId: string | null = null;
  if (typeof window !== "undefined") {
    cartId = localStorage.getItem("basketId");
  }

  const { data, isLoading, isEmpty, mutate } = useCart({
    cartId,
  });

  const [isCartLoading, setIsCartLoading] = useState(false);

  const { register, handleSubmit } = useForm();
  const onSubmit = (data: Object) => console.log(JSON.stringify(data));

  const router = useRouter();
  const { locale } = router;

  const hashids = new Hashids(
    "basket",
    15,
    "abcdefghijklmnopqrstuvwxyz1234567890"
  );

  const fetchRecomendedItems = async () => {
    if (cartId) {
      const { data } = await axios.get(
        `${webAddress}/api/baskets/related/${cartId}`
      );
      if (data.data && data.data.length) {
        setRecomendedItems(data.data);
      }
    }
  };

  const [configData, setConfigData] = useState({} as any);
  const fetchConfig = async () => {
    let configData;
    if (!sessionStorage.getItem("configData")) {
      let { data } = await axios.get(`${webAddress}/api/configs/public`);
      configData = data.data;
      sessionStorage.setItem("configData", data.data);
    } else {
      configData = sessionStorage.getItem("configData");
    }

    try {
      configData = Buffer.from(configData, "base64");
      configData = configData.toString("ascii");
      configData = JSON.parse(configData);
      setConfigData(configData);
    } catch (e) {}
  };

  const setCredentials = async () => {
    let csrf = Cookies.get("X-XSRF-TOKEN");
    if (!csrf) {
      const csrfReq = await axios(`${webAddress}/api/keldi`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          crossDomain: true,
        },
        withCredentials: true,
      });
      let { data: res } = csrfReq;
      csrf = Buffer.from(res.result, "base64").toString("ascii");

      var inTenMinutes = new Date(new Date().getTime() + 10 * 60 * 1000);
      Cookies.set("X-XSRF-TOKEN", csrf, {
        expires: inTenMinutes,
      });
    }
    axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    axios.defaults.headers.common["X-CSRF-TOKEN"] = csrf;
    axios.defaults.headers.common["XCSRF-TOKEN"] = csrf;
  };

  const destroyLine = async (lineId: string) => {
    setIsCartLoading(true);
    await setCredentials();
    const { data } = await axios.delete(
      `${webAddress}/api/basket-lines/${hashids.encode(lineId)}`
    );
    if (cartId) {
      let { data: basket } = await axios.get(
        `${webAddress}/api/baskets/${cartId}`
      );
      const basketResult = {
        id: basket.data.id,
        createdAt: "",
        currency: { code: basket.data.currency },
        taxesIncluded: basket.data.tax_total,
        lineItems: basket.data.lines,
        lineItemsSubtotalPrice: basket.data.sub_total,
        subtotalPrice: basket.data.sub_total,
        totalPrice: basket.data.total,
      };

      await mutate(basketResult, false);
      setIsCartLoading(false);
    }
  };

  const decreaseQuantity = async (line: any) => {
    if (line.quantity == 1) {
      return;
    }
    setIsCartLoading(true);
    await setCredentials();
    const { data: basket } = await axios.put(
      `${webAddress}/api/v1/basket-lines/${hashids.encode(line.id)}/remove`,
      {
        quantity: 1,
      }
    );

    if (cartId) {
      let { data: basket } = await axios.get(
        `${webAddress}/api/baskets/${cartId}`
      );
      const basketResult = {
        id: basket.data.id,
        createdAt: "",
        currency: { code: basket.data.currency },
        taxesIncluded: basket.data.tax_total,
        lineItems: basket.data.lines,
        lineItemsSubtotalPrice: basket.data.sub_total,
        subtotalPrice: basket.data.sub_total,
        totalPrice: basket.data.total,
      };

      await mutate(basketResult, false);
      setIsCartLoading(false);
    }
  };

  const increaseQuantity = async (lineId: string) => {
    setIsCartLoading(true);
    await setCredentials();
    const { data: basket } = await axios.post(
      `${webAddress}/api/v1/basket-lines/${hashids.encode(lineId)}/add`,
      {
        quantity: 1,
      }
    );

    if (cartId) {
      let { data: basket } = await axios.get(
        `${webAddress}/api/baskets/${cartId}`
      );
      const basketResult = {
        id: basket.data.id,
        createdAt: "",
        currency: { code: basket.data.currency },
        taxesIncluded: basket.data.tax_total,
        lineItems: basket.data.lines,
        lineItemsSubtotalPrice: basket.data.sub_total,
        subtotalPrice: basket.data.sub_total,
        totalPrice: basket.data.total,
      };

      await mutate(basketResult, false);
      setIsCartLoading(false);

      console.log(basket);
    }
  };

  const addToBasket = async (selectedProdId: number) => {
    let modifierProduct: any = null;
    let selectedModifiers: any = null;
    await setCredentials();

    let basketId = localStorage.getItem("basketId");
    const otpToken = Cookies.get("opt_token");

    let basketResult = {};

    if (basketId) {
      const { data: basketData } = await axios.post(
        `${webAddress}/api/baskets-lines`,
        {
          basket_id: basketId,
          variants: [
            {
              id: selectedProdId,
              quantity: 1,
              modifiers: null,
              additionalSale: true,
            },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${otpToken}`,
          },
          withCredentials: true,
        }
      );
      basketResult = {
        id: basketData.data.id,
        createdAt: "",
        currency: { code: basketData.data.currency },
        taxesIncluded: basketData.data.tax_total,
        lineItems: basketData.data.lines,
        lineItemsSubtotalPrice: basketData.data.sub_total,
        subtotalPrice: basketData.data.sub_total,
        totalPrice: basketData.data.total,
      };
    } else {
      const { data: basketData } = await axios.post(
        `${webAddress}/api/baskets`,
        {
          variants: [
            {
              id: selectedProdId,
              quantity: 1,
              modifiers: null,
              additionalSale: true,
            },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${otpToken}`,
          },
          withCredentials: true,
        }
      );
      localStorage.setItem("basketId", basketData.data.encoded_id);
      basketResult = {
        id: basketData.data.id,
        createdAt: "",
        currency: { code: basketData.data.currency },
        taxesIncluded: basketData.data.tax_total,
        lineItems: basketData.data.lines,
        lineItemsSubtotalPrice: basketData.data.sub_total,
        subtotalPrice: basketData.data.sub_total,
        totalPrice: basketData.data.total,
      };
    }

    await mutate(basketResult, false);
    fetchRecomendedItems();
  };
  const [open, setOpen] = useState(false);

  const goToCheckout = (e: any) => {
    e.preventDefault();
    if (locationData.deliveryType == "table") {
      router.push("/pickuplocator");
    } else {
    }
  };

  const clearBasket = async () => {
    if (cartId) {
      const { data: basket } = await axios.get(
        `${webAddress}/api/baskets/${cartId}/clear`
      );
      const basketResult = {
        id: basket.data.id,
        createdAt: "",
        currency: { code: basket.data.currency },
        taxesIncluded: basket.data.tax_total,
        lineItems: basket.data.lines,
        lineItemsSubtotalPrice: basket.data.sub_total,
        subtotalPrice: basket.data.sub_total,
        totalPrice: basket.data.total,
      };

      await mutate(basketResult, false);
    }
  };

  useEffect(() => {
    fetchConfig();
    fetchRecomendedItems();
    return;
  }, []);

  const isWorkTime = useMemo(() => {
    let currentHour = new Date().getHours();
    if (
      configData.workTimeStart <= currentHour ||
      configData.workTimeEnd > currentHour
    )
      return true;
    return false;
  }, [configData]);

  if (!isWorkTime) {
    return (
      <div className="bg-white flex py-20 text-xl text-primary font-bold px-10">
        <div>
          {tr("isNotWorkTime")}{" "}
          {locale == "uz" ? configData.workTimeUz : configData.workTimeRu}
        </div>
      </div>
    );
  }

  const settings = {
    infinite: false,
    centerPadding: "20px",
    arrows: true,
    slidesToShow: 6,
    swipeToSlide: true,
    speed: 500,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          arrows: false,
          dots: true,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          arrows: false,
          dots: true,
        },
      },
    ],
  };

  // const readyProducts = useMemo(() => {
  //   let resProds = products;
  //   if (categoryId) {
  //     resProds = products.filter((section: any) => section.id == categoryId);
  //   }

  //   return resProds
  //     .map((prod: any) => {
  //       if (prod.half_mode) {
  //         return null;
  //       }
  //       if (prod.variants && prod.variants.length) {
  //         prod.variants = prod.variants.map((v: any, index: number) => {
  //           if (index === 1) {
  //             v.active = true;
  //           } else {
  //             v.active = false;
  //           }

  //           return v;
  //         });
  //       } else if (prod.items && prod.items.length) {
  //         prod.items = prod.items.map((item: any) => {
  //           item.variants = item.variants.map((v: any, index: number) => {
  //             if (index === 1) {
  //               v.active = true;
  //             } else {
  //               v.active = false;
  //             }

  //             return v;
  //           });

  //           return item;
  //         });
  //       }
  //       return prod;
  //     })
  //     .filter((prod: any) => prod != null);
  // }, [products, categoryId]);

  // const secMinPrice = useMemo(() => {
  //   let minPrice = 0;
  //   const currentCategory = readyProducts[0];
  //   if (currentCategory) {
  //     minPrice = Math.min(
  //       ...currentCategory.items.map((store: any) => {
  //         let price: number = parseInt(store.price, 0) || 0;
  //         if (store.variants && store.variants.length > 0) {
  //           const activeValue: any = store.variants.find(
  //             (item: any) => item.active == true
  //           );
  //           if (activeValue) price += parseInt(activeValue.price, 0);
  //         }

  //         return price;
  //       })
  //     );
  //   }
  //   return minPrice;
  // }, [readyProducts]);

  // const secSlides = useMemo(() => {
  //   let category = readyProducts[0];
  //   let res: any[] = [];
  //   if (category) {
  //     res = chunk(category.items, 12);
  //   }

  //   return res;
  // }, [readyProducts]);

  // const {
  //   currentSlide,
  //   goToSlide,
  //   triggerGoToPrevSlide,
  //   triggerGoToNextSlide,
  // } = useCarousel({ maxSlide: secSlides.length, loop: false });

  return (
    <>
      {isCartLoading && (
        <div className="h-full w-full absolute flex items-center justify-around bg-gray-300 top-0 bg-opacity-60 left-0 rounded-[15px]">
          <svg
            className="animate-spin text-primary h-14"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      )}
      {isEmpty && (
        <div className="flex flex-col items-center mt-2 text-center text-gray-400 text-sm pb-4">
          {/* <img src="/cart_empty.png" width={130} height={119} /> */}
          <div className="text-2xl">{tr("basket_empty")}</div>
          <button
            className="bg-primary text-white p-3 mt-4 rounded-xl"
            onClick={() => router.push(`/menu`)}
          >
            {tr("back_to_menu")}
          </button>
        </div>
      )}
      {!isEmpty && (
        <>
          <div className="mt-12 h-[calc(100vh-490px)]">
            <div className="text-center">
              <div className="text-6xl font-serif font-bold mx-64">
                Подтвердите заказ перед оплатой
              </div>
              {/* <div className="text-gray-400 text-sm flex cursor-pointer">
            Очистить всё <TrashIcon className=" w-5 h-5 ml-1" />
          </div> */}
            </div>

            <div className="mt-14 gap-4 gap-y-24 grid grid-cols-3">
              {data &&
                data?.lineItems.map((lineItem: any) => (
                  <div className="m-auto" key={lineItem.id}>
                    <div className="relative">
                      <div className=" p-2 rounded-md w-max absolute">
                        <XIcon
                          className=" text-primary w-8 "
                          onClick={() => destroyLine(lineItem.id)}
                        />
                      </div>
                      {lineItem.child &&
                      lineItem.child.length &&
                      lineItem.child[0].variant?.product?.id !=
                        lineItem?.variant?.product?.box_id ? (
                        <div className="">
                          <div className="">
                            <div>
                              <img
                                src={
                                  lineItem?.variant?.product?.assets?.length
                                    ? `${webAddress}/storage/${lineItem?.variant?.product?.assets[0]?.location}/${lineItem?.variant?.product?.assets[0]?.filename}`
                                    : "/no_photo.svg"
                                }
                                width="240"
                                height="180"
                                className=""
                              />
                            </div>
                          </div>
                          <div className="overflow-hidden">
                            <div className="absolute right-0">
                              <img
                                src={
                                  lineItem?.child[0].variant?.product?.assets
                                    ?.length
                                    ? `${webAddress}/storage/${lineItem?.child[0].variant?.product?.assets[0]?.location}/${lineItem?.child[0].variant?.product?.assets[0]?.filename}`
                                    : "/no_photo.svg"
                                }
                                width="240"
                                height="180"
                                className=""
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="">
                          <img
                            src={
                              lineItem?.variant?.product?.assets?.length
                                ? `${webAddress}/storage/${lineItem?.variant?.product?.assets[0]?.location}/${lineItem?.variant?.product?.assets[0]?.filename}`
                                : "/no_photo.svg"
                            }
                            width={240}
                            height={180}
                            className=""
                          />
                        </div>
                      )}
                      <div className=" flex items-center pt-3">
                        <div className="items-center flex bg-primary text-white rounded-full p-4">
                          <MinusIcon
                            className="w-6"
                            onClick={() => decreaseQuantity(lineItem)}
                          />
                        </div>
                        <div className="flex-grow text-center text-primary font-medium text-3xl">
                          {lineItem.quantity}
                        </div>
                        <div className=" items-center flex bg-primary text-white rounded-full p-4">
                          <PlusIcon
                            className="w-6 "
                            onClick={() => increaseQuantity(lineItem.id)}
                          />
                        </div>
                      </div>
                      <div className="m-auto w-36 h-24 text-center items-center py-5">
                        <div className=" font-medium  text-2xl font-sans">
                          {lineItem.child && lineItem.child.length > 1
                            ? `${
                                lineItem?.variant?.product?.attribute_data
                                  ?.name[channelName][locale || "ru"]
                              } + ${lineItem?.child
                                .filter(
                                  (v: any) =>
                                    lineItem?.variant?.product?.box_id !=
                                    v?.variant?.product?.id
                                )
                                .map(
                                  (v: any) =>
                                    v?.variant?.product?.attribute_data?.name[
                                      channelName
                                    ][locale || "ru"]
                                )
                                .join(" + ")}`
                            : lineItem?.variant?.product?.attribute_data?.name[
                                channelName
                              ][locale || "ru"]}
                        </div>
                      </div>
                    </div>
                    <div className="">
                      <div className="m-auto text-4xl w-max text-primary">
                        {lineItem.child && lineItem.child.length
                          ? lineItem.total +
                            +lineItem.child[0].total * lineItem.quantity
                          : lineItem.total * lineItem.quantity}
                      </div>
                    </div>
                    <div className="md:hidden w-full space-y-3">
                      <div className="flex justify-between">
                        <div className="md:text-xl font-medium text-base">
                          {lineItem.child && lineItem.child.length > 1
                            ? `${
                                lineItem?.variant?.product?.attribute_data
                                  ?.name[channelName][locale || "ru"]
                              } + ${lineItem?.child
                                .filter(
                                  (v: any) =>
                                    lineItem?.variant?.product?.box_id !=
                                    v?.variant?.product?.id
                                )
                                .map(
                                  (v: any) =>
                                    v?.variant?.product?.attribute_data?.name[
                                      channelName
                                    ][locale || "ru"]
                                )
                                .join(" + ")}`
                            : lineItem?.variant?.product?.attribute_data?.name[
                                channelName
                              ][locale || "ru"]}
                        </div>
                        <div className="bg-gray-200 p-1 rounded-md w-max md:hidden">
                          <XIcon
                            className="cursor-pointer text-gray-400 w-5 "
                            onClick={() => destroyLine(lineItem.id)}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <div className="md:text-xl text-base md:font-medium">
                          {currency(lineItem.total, {
                            pattern: "# !",
                            separator: " ",
                            decimal: ".",
                            symbol: `${locale == "uz" ? "so'm" : "сум"}`,
                            precision: 0,
                          }).format()}
                          <div className="text-xs">Цена за 1 шт</div>
                        </div>
                        <div className="md:w-32 w-24 md:ml-14 bg-gray-200 rounded-lg flex items-center p-1">
                          <div className="items-center flex justify-around bg-white text-gray-500 rounded-md p-1 ">
                            <MinusIcon
                              className="cursor-pointer w-4 "
                              onClick={() => decreaseQuantity(lineItem)}
                            />
                          </div>
                          <div className="flex-grow text-center text-gray-500 font-medium">
                            {lineItem.quantity}
                          </div>
                          <div className=" items-center flex justify-around bg-white text-gray-500 rounded-md p-1">
                            <PlusIcon
                              className="cursor-pointer w-4 "
                              onClick={() => increaseQuantity(lineItem.id)}
                            />
                          </div>
                        </div>
                      </div>
                      <div></div>

                      <div className="ml-auto text-base w-max">
                        {lineItem.child && lineItem.child.length
                          ? currency(
                              (+lineItem.total + +lineItem.child[0].total) *
                                lineItem.quantity,
                              {
                                pattern: "# !",
                                separator: " ",
                                decimal: ".",
                                symbol: `${locale == "uz" ? "so'm" : "сум"}`,
                                precision: 0,
                              }
                            ).format()
                          : currency(lineItem.total * lineItem.quantity, {
                              pattern: "# !",
                              separator: " ",
                              decimal: ".",
                              symbol: `${locale == "uz" ? "so'm" : "сум"}`,
                              precision: 0,
                            }).format()}
                      </div>
                      <div className="bg-gray-200 p-2 rounded-md w-max md:block hidden">
                        <XIcon
                          className="cursor-pointer text-gray-400 w-5 "
                          onClick={() => destroyLine(lineItem.id)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
          {/* <div className="flex items-center space-x-2">
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
          </div> */}
        </>
      )}
      <div className="bottom-0 fixed flex mb-40 right-24 items-center">
        <span className="text-4xl font-medium font-sans">Итого:</span>
        <span className="ml-5 text-7xl font-sans font-semibold">
          {/* {data.totalPrice} */}
        </span>
      </div>
      <div className="flex fixed bottom-0 w-full">
        <div className="flex text-center w-full h-full">
          <div className=" text-white bg-black px-[160px]  h-[120px] flex flex-col justify-around">
            <div className="text-4xl font-medium">Изменить заказ</div>
          </div>
          <div
            className="w-full bg-greenPrimary text-white text-2xl h-[120px] flex flex-col justify-around"
            onClick={() => setOpen(true)}
          >
            <div className="flex items-end mx-auto space-x-4">
              <div className="text-[40px] font-medium">Да, заказ верен</div>
            </div>
          </div>
        </div>
      </div>
      <Cashback />
      <SignInModal channelName={locale} />
    </>
  );
}

Cart.Layout = Layout;
export default Cart;
