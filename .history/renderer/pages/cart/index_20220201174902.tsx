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

  const { t: tr } = useTranslation("common");
  let cartId: string | null = null;
  if (typeof window !== "undefined") {
    cartId = localStorage.getItem("basketId");
  }

  const { data, isLoading, isEmpty, mutate } = useCart({
    cartId,
  });

  const [isCartLoading, setIsCartLoading] = useState(false);

  const [cashBackFirstStepOpen, setCashBackFirstStepOpen] = useState(false);
  const [getCashbackAgree, setCashbackAgree] = useState(false);
  const cashbackFirstStepRef = useRef(null);

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

  const slides = useMemo(() => {
    let result: any[] = [];

    if (data) {
      result = chunk(data.lineItems, 9);
    }

    return result;
  }, [data]);

  const {
    currentSlide,
    goToSlide,
    triggerGoToPrevSlide,
    triggerGoToNextSlide,
    isFirstSlide,
    isLastSlide,
  } = useCarousel({ maxSlide: slides.length, loop: false });

  console.log(slides);

  useEffect(() => {
    getChannel();
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
          <div className="mt-12 px-32 relative">
            <div className="text-center">
              <div className="text-7xl font-serif font-bold">
                {tr("approveCartBeforePay")}
              </div>
            </div>
            {!isFirstSlide && (
              <div className="absolute left-14 top-1/2">
                <button
                  className="text-white p-3 mt-4 rounded-xl"
                  {...triggerGoToPrevSlide}
                >
                  <img src="/cart_stroke_left.png" alt="" />
                </button>
              </div>
            )}
            {!isLastSlide && (
              <div className="absolute right-14 top-1/2">
                <button
                  className="text-white p-3 mt-4 rounded-xl"
                  {...triggerGoToNextSlide}
                >
                  <img src="/cart_stroke_right.png" alt="" />
                </button>
              </div>
            )}
            {data &&
              slides.map((slide: any, index: number) => (
                <div
                  key={`slide_${index}`}
                  data-current-slide={currentSlide}
                  className={`mt-14 gap-5 gap-y-10 grid grid-cols-3 ${
                    index + 1 == currentSlide ? "" : "hidden"
                  }`}
                >
                  {slide.map((lineItem: any) => (
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
                                  width="230"
                                  height="180"
                                  className="max-h-[180px]"
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
                                  width="230"
                                  height="180"
                                  className="max-h-[180px]"
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
                              width={230}
                              height={180}
                              className="max-h-[180px]"
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
                              : lineItem?.variant?.product?.attribute_data
                                  ?.name[channelName][locale || "ru"]}
                          </div>
                        </div>
                      </div>
                      <div className="">
                        <div className="m-auto text-4xl w-max text-primary">
                          {currency(lineItem.total * lineItem.quantity, {
                            pattern: "# !",
                            separator: " ",
                            decimal: ".",
                            symbol: ``,
                            precision: 0,
                          }).format()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
          </div>
        </>
      )}
      <div className="bottom-0 fixed flex mb-40 right-24 items-center">
        <span className="text-4xl font-medium font-sans">Итого:</span>
        <span className="ml-5 text-7xl font-sans font-semibold">
          {currency(data.totalPrice, {
            pattern: "# !",
            separator: " ",
            decimal: ".",
            symbol: ``,
            precision: 0,
          }).format()}
        </span>
      </div>
      <div className="flex fixed bottom-0 w-full">
        <div className="flex text-center w-full h-full">
          <div
            className=" text-white bg-black px-[160px]  h-[120px] flex flex-col justify-around"
            onClick={() => {
              router.push("/menu");
            }}
          >
            <div className="text-4xl font-medium">Изменить заказ</div>
          </div>
          <div
            className="w-full bg-greenPrimary text-white text-2xl h-[120px] flex flex-col justify-around"
            onClick={() => setOpen(true)}
          >
            <div
              className="flex items-end mx-auto space-x-4"
              onClick={() => {
                setCashBackFirstStepOpen(true);
              }}
            >
              <div className="text-[40px] font-medium">Да, заказ верен</div>
            </div>
          </div>
        </div>
      </div>

      <Transition appear show={cashBackFirstStepOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-[100] overflow-y-auto"
          initialFocus={cashbackFirstStepRef}
          onClose={() => setOpen(false)}
        >
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 "
            >
              <div className="align-middle inline-block overflow-hidden w-full z-[200] font-serif">
                <div className="bg-plum my-96 relative shadow-xl transform mx-28 text-white">
                  <div
                    className="absolute text-white hidden md:block p-3 right-0 bg-greenPrimary top-0 w-max"
                    ref={cashbackFirstStepRef}
                    onClick={() => setOpen(false)}
                  >
                    <XIcon className="w-10" />
                  </div>
                  {getCashbackAgree && (
                    <div>
                      <div className="text-6xl pt-16 pb-16 px-28">
                        Введите номер телефона
                      </div>
                      <div className="text-5xl font-bold px-32">
                        Чтобы получить кешбек, надо просто указать{" "}
                        <span className="text-greenPrimary">
                          номер телефона
                        </span>{" "}
                        и{" "}
                        <span className="text-greenPrimary">личные данные</span>{" "}
                      </div>
                      <div className="mt-16 text-5xl font-bold px-28 pb-56">
                        Оплатить заработанными бонусами можно все товары
                      </div>
                      <div className="flex fixed w-full">
                        <button
                          className="text-4xl font-medium bg-gray-300 py-5 text-black outline-none w-full h-36 font-sans"
                          onClick={() => setCashBackFirstStepOpen(false)}
                        >
                          Нет, спасибо
                        </button>
                        <button
                          className="text-4xl font-medium bg-greenPrimary py-5 text-white outline-none w-full h-36 font-sans"
                          onClick={() => setCashbackAgree(false)}
                        >
                          Да, хочу
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="text-6xl pt-16 pb-16 px-28">
                    Хотите получить кешбек 5%?
                  </div>
                  <div className="text-5xl font-bold px-32">
                    Чтобы получить кешбек, надо просто указать{" "}
                    <span className="text-greenPrimary">номер телефона</span> и{" "}
                    <span className="text-greenPrimary">личные данные</span>{" "}
                  </div>
                  <div className="mt-16 text-5xl font-bold px-28 pb-56">
                    Оплатить заработанными бонусами можно все товары
                  </div>
                  <div className="flex fixed w-full">
                    <button
                      className="text-4xl font-medium bg-gray-300 py-5 text-black outline-none w-full h-36 font-sans"
                      onClick={() => setCashBackFirstStepOpen(false)}
                    >
                      Нет, спасибо
                    </button>
                    <button
                      className="text-4xl font-medium bg-greenPrimary py-5 text-white outline-none w-full h-36 font-sans"
                      onClick={() => setCashbackAgree(false)}
                    >
                      Да, хочу
                    </button>
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

Cart.Layout = Layout;
export default Cart;
