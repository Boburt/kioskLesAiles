import type { GetServerSidePropsContext, GetStaticPropsContext } from "next";
import commerce from "@lib/api/commerce";
import useCart from "@framework/cart/use-cart";
import Image from "next/image";
import { XIcon, MinusIcon, PlusIcon, TrashIcon } from "@heroicons/react/solid";
import {
  useTranslation,
  useLanguageQuery,
  LanguageSwitcher,
} from "next-export-i18n";
import getConfig from "next/config";
import { useRouter } from "next/router";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import Hashids from "hashids";
import axios from "axios";
import Cookies from "js-cookie";
import OtpInput from "react-otp-input";
import defaultChannel from "@lib/defaultChannel";
import currency from "currency.js";
import { useUI } from "@components/ui/context";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Layout from "@components/Layout";
import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/solid";
import Input from "react-phone-number-input/input";
import { useForm, Controller, SubmitHandler } from "react-hook-form";

import { chunk } from "lodash";
import { useCarousel } from "@webeetle/react-headless-hooks";
import { Dialog, Transition } from "@headlessui/react";
import Cashback from "@components/Cashback";
import SignInModal from "@components/SignInModal";
import NumPad from "@components/NumPad";
const NumberFormat = require("react-number-format");
import DisplayPhone from "@components/DisplayPhone";
import Link from "next/link";
import styles from "./cart.module.css";
import KeyboardWrapper from "@components/KeyboardWrapper";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Errors {
  [key: string]: string;
}

interface AnyObject {
  [key: string]: any;
}

const errors: Errors = {
  name_field_is_required: "",
  opt_code_is_incorrect: "",
};

let otpTimerRef: NodeJS.Timeout;

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
  const { activeCity, locationData, setUserData, user } = useUI();
  const { t: tr } = useTranslation("common");
  errors.name_field_is_required = tr("we_not_found_you");
  errors.opt_code_is_incorrect = tr("code_has_expired");

  let cartId: string | null = null;
  if (typeof window !== "undefined") {
    cartId = localStorage.getItem("basketId");
  }

  const { data, isLoading, isEmpty, mutate } = useCart({
    cartId,
  });

  const [isCartLoading, setIsCartLoading] = useState(false);
  const [phoneFieldValue, setPhoneFieldValue] = useState("");

  const [cashBackFirstStepOpen, setCashBackFirstStepOpen] = useState(false);
  const [cashbackStep, setCashbackStep] = useState("agreement");
  const [userBalance, setUserBalance] = useState(0);
  const [otpCode, setOtpCode] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [otpShowCode, setOtpShowCode] = useState(0);
  const [showUserName, setShowUserName] = useState(false);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const cashbackFirstStepRef = useRef(null);

  const keyboard = useRef(null);

  const onSubmit = (data: Object) => console.log(JSON.stringify(data));

  const otpTime = useRef(0);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState,
    getValues,
    setValue,
    control,
  } = useForm<AnyObject>({
    mode: "onChange",
  });

  const {
    register: passwordFormRegister,
    handleSubmit: handlePasswordSubmit,
    formState: passwordFormState,
  } = useForm({
    mode: "onChange",
  });

  const {
    register: newUserFormRegister,
    handleSubmit: handleNewUserSubmit,
    formState: newUserFormState,
    watch: newUserWatch,
    setValue: newUserSetValue,
  } = useForm({
    mode: "onChange",
  });

  const authPhone = watch("phone");
  const authName = newUserWatch("name");
  const authEmail = newUserWatch("email");

  const router = useRouter();
  const { locale } = router;

  const hashids = new Hashids(
    "basket",
    15,
    "abcdefghijklmnopqrstuvwxyz1234567890"
  );

  const startTimeout = () => {
    otpTimerRef = setInterval(() => {
      if (otpTime.current > 0) {
        otpTime.current = otpTime.current - 1;
        setOtpShowCode(otpTime.current);
      } else {
        clearInterval(otpTimerRef);
      }
    }, 1000);
  };

  const handleOtpChange = (otp: string) => {
    setOtpCode(otp);
  };

  const getNewCode = (e: React.SyntheticEvent<EventTarget>) => {
    e.preventDefault();
    onSubmitPhone({
      // name: authName,
      phone: authPhone,
    });
  };
  console.log("authName", authName);

  const newUserFormCheck = () => {
    if (!authName) {
      toast.error(tr("name_field_is_required"), {
        position: "bottom-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: false,
        progress: undefined,
      });
      return;
    }
    return onSubmitPhone({});
  };

  const onSubmitPhone: SubmitHandler<AnyObject> = async (data) => {
    setSubmitError("");
    setIsSubmittingForm(true);
    const csrfReq = await axios(`${webAddress}/api/keldi`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        crossDomain: true,
      },
      withCredentials: true,
    });
    let { data: res } = csrfReq;
    if (authName) {
      data.name = authName;
    }

    if (authEmail) {
      data.email = authEmail;
    }

    if (authPhone) {
      data.phone = authPhone;
    }

    const csrf = Buffer.from(res.result, "base64").toString("ascii");

    Cookies.set("X-XSRF-TOKEN", csrf);
    axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    axios.defaults.headers.common["X-CSRF-TOKEN"] = csrf;
    axios.defaults.headers.common["XCSRF-TOKEN"] = csrf;
    let ress = await axios.post(`${webAddress}/api/send_otp`, data, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });

    let {
      data: { error: otpError, data: result, success },
    }: {
      data: {
        error: string;
        data: AnyObject;
        success: any;
      };
    } = ress;

    if (otpError) {
      setIsSubmittingForm(false);
      setSubmitError(errors[otpError]);
      if (otpError == "name_field_is_required") {
        setCashbackStep("new_user");
      }
    } else if (success) {
      setIsSubmittingForm(false);
      success = Buffer.from(success, "base64");
      success = success.toString();
      success = JSON.parse(success);
      Cookies.set("opt_token", success.user_token);
      localStorage.setItem("opt_token", success.user_token);
      otpTime.current = result?.time_to_answer;
      setOtpShowCode(otpTime.current);
      startTimeout();

      setCashbackStep("pincode");
      // setIsShowPasswordForm(true);
      // hideOverlay();
    }
  };

  const otpTimerText = useMemo(() => {
    let text = "Получить новый код через ";
    const minutes: number = parseInt((otpShowCode / 60).toString(), 0);
    const seconds: number = otpShowCode % 60;
    if (minutes > 0) {
      text += minutes + " мин. ";
    }

    if (seconds > 0) {
      text += seconds + " сек.";
    }
    return text;
  }, [otpShowCode]);

  const submitPasswordForm: SubmitHandler<AnyObject> = async (data) => {
    setSubmitError("");
    setIsSubmittingForm(true);
    const otpToken = Cookies.get("opt_token");
    let ress = await axios.post(
      `${webAddress}/api/auth_otp`,
      {
        phone: authPhone,
        code: otpCode,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${otpToken}`,
        },
        withCredentials: true,
      }
    );

    let {
      data: { result },
    }: { data: { result: any } } = ress;
    result = Buffer.from(result, "base64");
    result = result.toString();
    result = JSON.parse(result);

    if (result === false) {
      setIsSubmittingForm(false);
      setSubmitError(errors.opt_code_is_incorrect);
    } else {
      clearInterval(otpTimerRef);
      setUserData(result);
      await checkUserBalance();
      setIsSubmittingForm(false);
      setCashbackStep("success");
      // setIsShowPasswordForm(false);
      // if (router.query && router.query.backUrl) {
      //   let backUrl: string = router.query.backUrl as string;
      //   router.push(backUrl);
      // }
    }
  };

  const checkUserBalance = async () => {
    const userToken = Cookies.get("opt_token");
    const res = await axios.get(`${webAddress}/api/cashback/balance`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      withCredentials: true,
    });

    setUserBalance(res.data.data.balance);
  };

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
        {data && (
          <>
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
          </>
        )}
      </div>
      <div className="flex fixed bottom-0 w-full">
        <div className="flex text-center w-full h-full">
          <div
            className=" text-white bg-black px-[160px]  h-[120px] flex flex-col justify-around"
            onClick={() => {
              router.push("/menu");
            }}
          >
            <div className="text-4xl font-medium">{tr("change_order")}</div>
          </div>
          <div
            className="w-full bg-greenPrimary text-white text-2xl h-[120px] flex flex-col justify-around"
            onClick={() => setOpen(true)}
          >
            <div
              className="flex items-end mx-auto space-x-4"
              onClick={() => {
                //agreement
                setCashbackStep("typing_phone");
                setCashBackFirstStepOpen(true);
              }}
            >
              <div className="text-[40px] font-medium">{tr("order_true")}</div>
            </div>
          </div>
        </div>
      </div>

      <Transition appear show={cashBackFirstStepOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-[100] overflow-y-auto"
          initialFocus={cashbackFirstStepRef}
          onClose={() => setCashBackFirstStepOpen(false)}
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
                    onClick={() => setCashBackFirstStepOpen(false)}
                  >
                    <XIcon className="w-10" />
                  </div>

                  {cashbackStep == "agreement" && (
                    <>
                      <div className="text-6xl pt-16 pb-16 px-28">
                        {tr("want_to_get_cashback")}
                      </div>
                      <div className="text-5xl font-bold px-32">
                        {tr("to_get_cashback_you")}{" "}
                        <span className="text-greenPrimary">
                          {tr("personal_phone")}
                        </span>{" "}
                        и{" "}
                        <span className="text-greenPrimary">
                          {tr("personal_data")}
                        </span>{" "}
                      </div>
                      <div className="mt-16 text-5xl font-bold px-28 pb-56">
                        {tr("you_may_pay_all")}
                      </div>
                      <div className="flex fixed w-full">
                        <button
                          className="text-4xl font-medium bg-gray-300 py-5 text-black outline-none w-full h-36 font-sans"
                          onClick={() => setCashBackFirstStepOpen(false)}
                        >
                          {tr("no_thanks")}
                        </button>
                        <button
                          className="text-4xl font-medium bg-greenPrimary py-5 text-white outline-none w-full h-36 font-sans"
                          onClick={() => setCashbackStep("typing_phone")}
                        >
                          {tr("yes_i_want")}
                        </button>
                      </div>
                    </>
                  )}
                  {cashbackStep == "typing_phone" && (
                    <form onSubmit={handleSubmit(onSubmitPhone)}>
                      <div>
                        <div className="text-6xl pt-16 pb-16 px-28">
                          {tr("enter_phone_number")}
                        </div>
                        <div className="text-5xl font-bold mx-44 px-16 py-7 border bg-white rounded-2xl">
                          <Controller
                            render={({ field: { onChange, value } }) => (
                              <Input
                                defaultCountry="UZ"
                                country="UZ"
                                international
                                withCountryCallingCode
                                value={value}
                                className="text-black focus:outline-none outline-none bg-transparent text-4xl w-full"
                                onChange={(e: any) => onChange(e)}
                                onKeyDown={(e: any) => {
                                  if (e.key == "Enter") {
                                    e.preventDefault();
                                    handleSubmit(onSubmitPhone)();
                                  }
                                }}
                              />
                            )}
                            rules={{
                              required: true,
                            }}
                            key="phone"
                            name="phone"
                            control={control}
                          />
                        </div>
                        <div className="bg-white text-black font-medium text-4xl font-sans mx-44 p-12 my-12 rounded-2xl">
                          <NumPad
                            onChange={(value: string) => {
                              console.log(value);
                              setValue("phone", "+998" + value);
                              // setPhoneFieldValue(value);
                            }}
                            maxLength={9}
                          />
                        </div>
                        <div className="">
                          <button
                            className="text-4xl relative font-medium bg-greenPrimary py-5 text-white outline-none w-full h-36 font-sans"
                            onClick={handleSubmit(onSubmitPhone)}
                            disabled={isSubmittingForm}
                          >
                            {isSubmittingForm ? (
                              <div className="h-full w-full absolute flex items-center justify-around bg-gray-300 top-0 bg-opacity-60 left-0 rounded-[15px]">
                                <svg
                                  className="animate-spin text-white h-14"
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
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                              </div>
                            ) : (
                              tr("get_code")
                            )}
                          </button>
                        </div>
                      </div>
                    </form>
                  )}
                  {cashbackStep == "pincode" && (
                    <form onSubmit={handlePasswordSubmit(submitPasswordForm)}>
                      <div>
                        <div className="text-6xl pt-16 pb-16 px-28">
                          {tr("enter_code")}
                        </div>
                        <div>
                          <OtpInput
                            value={otpCode}
                            onChange={handleOtpChange}
                            inputStyle={`${styles.digitField} w-[91px] rounded-3xl h-24 text-black text-4xl outline-none focus:outline-none text-center`}
                            isInputNum={true}
                            containerStyle="grid grid-cols-4 gap-1.5 justify-center"
                            numInputs={4}
                          />
                        </div>
                        {otpShowCode > 0 ? (
                          <div className="text-xl text-white mt-10">
                            {otpTimerText}
                          </div>
                        ) : (
                          <button
                            className="text-xl text-white mt-10 outline-none focus:outline-none border-b pb-0.5"
                            onClick={(e) => getNewCode(e)}
                          >
                            {tr("get_code_again")}
                          </button>
                        )}
                        <div className="bg-white text-black font-medium text-4xl font-sans mx-44 p-12 my-12 rounded-2xl">
                          <NumPad
                            onChange={(value: string) => {
                              setOtpCode(value);
                            }}
                            maxLength={4}
                          />
                        </div>
                        <div className="">
                          <button
                            className="text-4xl relative font-medium bg-greenPrimary py-5 text-white outline-none w-full h-36 font-sans"
                            onClick={handlePasswordSubmit(submitPasswordForm)}
                            disabled={isSubmittingForm}
                          >
                            {isSubmittingForm ? (
                              <div className="h-full w-full absolute flex items-center justify-around bg-gray-300 top-0 bg-opacity-60 left-0 rounded-[15px]">
                                <svg
                                  className="animate-spin text-white h-14"
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
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                              </div>
                            ) : (
                              tr("confirm")
                            )}
                          </button>
                        </div>
                      </div>
                    </form>
                  )}
                  {cashbackStep == "success" && (
                    <>
                      <div>
                        <div className="text-6xl pt-16 pb-5 px-28">
                          {tr("profile_hello")}, {user.user.name}!
                        </div>
                        <div className="text-4xl mx-auto font-sans">
                          <DisplayPhone phone={user.user.phone} />
                        </div>
                        <div className="mt-16 bg-white rounded-3xl text-black mx-44 text-4xl font-sans py-7">
                          {tr("you")}{" "}
                          {currency(userBalance, {
                            pattern: "# !",
                            separator: " ",
                            decimal: ".",
                            symbol: ``,
                            precision: 0,
                          }).format()}{" "}
                          {tr("profile_bounuses_score")}
                        </div>
                        <div className="mt-16 text-4xl mx-44 font-sans">
                          {tr("earn_and_pay")}
                        </div>
                        <div className="mt-5 mx-44">
                          <img
                            src="/modal_content_logo.png"
                            alt=""
                            className="mx-auto"
                          />
                        </div>
                        <div className="">
                          <Link href="/payment">
                            <a className="bg-greenPrimary flex font-medium font-sans h-36 items-center justify-around mt-32 outline-none relative text-4xl text-white w-full">
                              {tr("proceed_to_checkout")}
                            </a>
                          </Link>
                        </div>
                      </div>
                    </>
                  )}
                  {cashbackStep == "new_user" && (
                    <form onSubmit={handleNewUserSubmit(submitPasswordForm)}>
                      <div>
                        <div className="text-6xl pt-16 pb-16 px-28">
                          {tr("set_user_data")}
                        </div>
                        <div>
                          <div className="pl-32 py-7 rounded-xl bg-white mx-14 text-black text-4xl text-left flex justify-between mt-5">
                            <DisplayPhone phone={authPhone} />
                            <div
                              className="px-10"
                              onClick={() => {
                                setCashbackStep("typing_phone");
                              }}
                            >
                              <img src="/edit.png" alt="" />
                            </div>
                          </div>
                          <div
                            onClick={() => {
                              setCashbackStep("typing_name");
                            }}
                            className="pl-32 py-7 rounded-xl bg-white mx-14 text-black text-4xl text-left flex justify-between mt-5"
                          >
                            <div>
                              {authName ? authName : tr("set_user_name")}
                            </div>
                          </div>
                          <div
                            onClick={() => {
                              setCashbackStep("typing_email");
                            }}
                            className="pl-32 py-7 rounded-xl bg-white mx-14 text-black text-4xl text-left flex justify-between mt-5"
                          >
                            {authEmail ? authEmail : "E-mail"}
                          </div>
                        </div>
                        <div className="mt-24">
                          <button
                            className="text-4xl relative font-medium bg-greenPrimary py-5 text-white outline-none w-full h-36 font-sans"
                            onClick={handleNewUserSubmit(newUserFormCheck)}
                            disabled={isSubmittingForm}
                          >
                            {isSubmittingForm ? (
                              <div className="h-full w-full absolute flex items-center justify-around bg-gray-300 top-0 bg-opacity-60 left-0 rounded-[15px]">
                                <svg
                                  className="animate-spin text-white h-14"
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
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                              </div>
                            ) : (
                              tr("save")
                            )}
                          </button>
                        </div>
                      </div>
                    </form>
                  )}
                  {cashbackStep == "typing_name" && (
                    <form onSubmit={handleNewUserSubmit(submitPasswordForm)}>
                      <div>
                        <div className="text-6xl pt-16 pb-16 px-28">
                          {tr("set_user_name")}
                        </div>
                        <div>
                          <div className="pl-32 py-7 rounded-xl bg-white mx-14 text-black text-4xl text-left flex justify-between mt-5">
                            <input
                              type="text"
                              {...newUserFormRegister("name", {
                                required: true,
                                value: authName,
                              })}
                              readOnly={true}
                              placeholder={tr("set_user_name")}
                            />
                          </div>
                          <div className="mt-5 mx-14">
                            <KeyboardWrapper
                              keyboardRef={keyboard}
                              onChange={(value) => {
                                newUserSetValue("name", value);
                              }}
                            />
                          </div>
                        </div>
                        <div className="mt-24">
                          <button
                            className="text-4xl relative font-medium bg-greenPrimary py-5 text-white outline-none w-full h-36 font-sans"
                            onClick={() => setCashbackStep("new_user")}
                            disabled={isSubmittingForm}
                          >
                            {isSubmittingForm ? (
                              <div className="h-full w-full absolute flex items-center justify-around bg-gray-300 top-0 bg-opacity-60 left-0 rounded-[15px]">
                                <svg
                                  className="animate-spin text-white h-14"
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
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                              </div>
                            ) : (
                              tr("save")
                            )}
                          </button>
                        </div>
                      </div>
                    </form>
                  )}
                  {cashbackStep == "typing_email" && (
                    <form onSubmit={handleNewUserSubmit(submitPasswordForm)}>
                      <div>
                        <div className="text-6xl pt-16 pb-16 px-28">
                          {tr("set_user_name")}
                        </div>
                        <div>
                          <div className="pl-32 py-7 rounded-xl bg-white mx-14 text-black text-4xl text-left flex justify-between mt-5">
                            <input
                              type="text"
                              {...newUserFormRegister("email", {
                                required: true,
                                value: authEmail,
                              })}
                              readOnly={true}
                              placeholder={tr("set_user_email")}
                            />
                          </div>
                          <div className="mt-5 mx-14">
                            <KeyboardWrapper
                              keyboardRef={keyboard}
                              onChange={(value) => {
                                newUserSetValue("email", value);
                              }}
                            />
                          </div>
                        </div>
                        <div className="mt-24">
                          <button
                            className="text-4xl relative font-medium bg-greenPrimary py-5 text-white outline-none w-full h-36 font-sans"
                            onClick={() => setCashbackStep("new_user")}
                            disabled={isSubmittingForm}
                          >
                            {isSubmittingForm ? (
                              <div className="h-full w-full absolute flex items-center justify-around bg-gray-300 top-0 bg-opacity-60 left-0 rounded-[15px]">
                                <svg
                                  className="animate-spin text-white h-14"
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
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                              </div>
                            ) : (
                              tr("save")
                            )}
                          </button>
                        </div>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
      <ToastContainer />
    </>
  );
}

Cart.Layout = Layout;
export default Cart;
