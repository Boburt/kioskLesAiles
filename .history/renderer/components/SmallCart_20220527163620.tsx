import React, {
  FC,
  Fragment,
  memo,
  useMemo,
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";
import useCart from "@framework/cart/use-cart";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import Image from "next/image";
import {
  XIcon,
  MinusIcon,
  PlusIcon,
  ShoppingCartIcon,
} from "@heroicons/react/solid";
import currency from "currency.js";
import axios from "axios";
import Cookies from "js-cookie";
import getConfig from "next/config";
import { useRouter } from "next/router";
import { useUI } from "@components/ui/context";
import { Dialog, Transition } from "@headlessui/react";
import OtpInput from "react-otp-input";
import Input from "react-phone-number-input/input";
import styles from "./SmallCartMobile.module.css";
import { createPopper } from "@popperjs/core";
import Hashids from "hashids";
import SimpleBar from "simplebar-react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {
  useTranslation,
  useLanguageQuery,
  LanguageSwitcher,
} from "next-export-i18n";
import { ChevronDownIcon } from "@heroicons/react/outline";
import {
  Product,
  ProductOptionValues,
  ProductPrice,
} from "@commerce/types/product";
import { Link } from "react-scroll";

const { publicRuntimeConfig } = getConfig();
axios.defaults.withCredentials = true;

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

type SmallCartProps = {
  channelName: any;
};

const SmallCart: FC<SmallCartProps> = ({ channelName }) => {
  const { t: tr } = useTranslation("common");
  errors.name_field_is_required = tr("we_not_found_you");
  errors.opt_code_is_incorrect = tr("code_has_expired");

  const router = useRouter();
  const { locale } = router;
  let cartId: string | null = null;
  if (typeof window !== undefined) {
    cartId = localStorage.getItem("basketId");
  }

  const { publicRuntimeConfig } = getConfig();
  let webAddress = publicRuntimeConfig.apiUrl;

  const { data, isLoading, isEmpty, mutate } = useCart({
    cartId,
  });

  let [isShowPrivacy, setIsShowPrivacy] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isShowPasswordForm, setIsShowPasswordForm] = useState(false);
  const [otpShowCode, setOtpShowCode] = useState(0);
  const [showUserName, setShowUserName] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [popoverShow, setPopoverShow] = React.useState(false);
  const btnRef = useRef<any>(null);
  const popoverRef = useRef<any>(null);
  const [isCartLoading, setIsCartLoading] = useState(false);
  const cancelButtonRef = useRef(null);
  const cancelModalButtonRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [recomendedItems, setRecomendedItems] = useState([]);
  const [isLoadingRecomended, setLoadingRecomended] = useState(false);
  const [isBasketLoading, setIsBasketLoading] = useState(false);

  // const prodPriceDesktop = useMemo(() => {
  //   let price: number = parseInt(store.price, 0) || 0;
  //   if (store.variants && store.variants.length > 0) {
  //     const activeValue: any = store.variants.find(
  //       (item) => item.active == true
  //     );
  //     if (activeValue) price += parseInt(activeValue.price, 0);
  //   }

  //   return price;
  // }, [store.price, store.variants]);

  const {
    user,
    setUserData,
    openSignInModal,
    closeSignInModal,
    activeCity,
    showOverlay,
    hideOverlay,
  } = useUI();

  const otpTime = useRef(0);

  const openModal = () => {
    setShowSignInModal(true);
  };

  const closeModal = () => {
    setOpen(false);
    router.push(`/cart`);
  };

  const openCancelModal = () => {
    setCancelOpen(true);
  };

  const closeCancelModal = () => {
    setCancelOpen(false);
  };

  const cancelBasket = async () => {
    await clearBasket();
    closeCancelModal();
  };

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState,
    getValues,
    control,
  } = useForm<AnyObject>({
    mode: "onChange",
  });

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

  const otpTimerText = useMemo(() => {
    let text = tr("get_new_code");
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

  const {
    register: passwordFormRegister,
    handleSubmit: handlePasswordSubmit,
    formState: passwordFormState,
  } = useForm<AnyObject>({
    mode: "onChange",
  });
  const onSubmit: SubmitHandler<AnyObject> = async (data) => {
    setSubmitError("");
    const csrfReq = await axios(`${publicRuntimeConfig.apiUrl}/api/keldi`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        crossDomain: true,
      },
      withCredentials: true,
    });
    let { data: res } = csrfReq;
    const csrf = Buffer.from(res.result, "base64").toString("ascii");

    Cookies.set("X-XSRF-TOKEN", csrf);
    axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    axios.defaults.headers.common["X-CSRF-TOKEN"] = csrf;
    axios.defaults.headers.common["XCSRF-TOKEN"] = csrf;
    let ress = await axios.post(
      `${publicRuntimeConfig.apiUrl}/api/send_otp`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );

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
      setSubmitError(errors[otpError]);
      if (otpError == "name_field_is_required") {
        setShowUserName(true);
      }
    } else if (success) {
      success = Buffer.from(success, "base64");
      success = success.toString();
      success = JSON.parse(success);
      Cookies.set("opt_token", success.user_token);
      localStorage.setItem("opt_token", success.user_token);
      otpTime.current = result?.time_to_answer;
      setOtpShowCode(otpTime.current);
      startTimeout();
      setIsShowPasswordForm(true);
    }
  };

  const submitPasswordForm: SubmitHandler<AnyObject> = async (data) => {
    setSubmitError("");
    const otpToken = Cookies.get("opt_token");
    let ress = await axios.post(
      `${publicRuntimeConfig.apiUrl}/api/auth_otp`,
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
      setSubmitError(errors.opt_code_is_incorrect);
    } else {
      clearInterval(otpTimerRef);
      setUserData(result);
      setIsShowPasswordForm(false);

      router.push(`/${activeCity.slug}/cart/`);
    }
  };

  const authName = watch("name");
  const authPhone = watch("phone");

  const showPrivacy = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    closeSignInModal();
    setIsShowPrivacy(true);
  };

  const closePrivacy = () => {
    setIsShowPrivacy(false);
    openSignInModal();
  };

  let authButtonRef = useRef(null);
  let privacyButtonRef = useRef(null);

  const handleOtpChange = (otp: string) => {
    setOtpCode(otp);
  };

  const getNewCode = (e: React.SyntheticEvent<EventTarget>) => {
    e.preventDefault();
    onSubmit({
      name: authName,
      phone: authPhone,
    });
  };

  const resetField = (fieldName: string) => {
    const newFields: any = {
      ...getValues(),
    };
    newFields[fieldName] = null;
    reset(newFields);
  };
  const goToCheckout = (e: any) => {
    e.preventDefault();
    if (!user) {
      openModal();
    } else {
      router.push(`/${activeCity.slug}/cart/`);
      closePopover();
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

  const openPopover = () => {
    showOverlay();
    createPopper(btnRef.current, popoverRef.current, {
      placement: "bottom",
    });
    setPopoverShow(true);
  };
  const closePopover = () => {
    hideOverlay();
    setPopoverShow(false);
  };

  const openCart = () => {
    if (!popoverShow) {
      if (!isEmpty) {
        openPopover();
      }
    } else {
      closePopover();
    }
  };
  const hashids = new Hashids(
    "basket",
    15,
    "abcdefghijklmnopqrstuvwxyz1234567890"
  );
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

      if (!basket.data.lines) {
        hideOverlay();
      }

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
      fetchRecomendedItems();
    }
  };

  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    initialSlide: 0,
    arrows: true,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
  };
  function SampleNextArrow(props: any) {
    const { className, style, onClick } = props;
    return (
      <img
        src="/rightArrow.webp"
        className={className}
        style={{ ...style, display: "block", height: "40px" }}
        onClick={onClick}
      />
    );
  }

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
  useEffect(() => {
    fetchConfig();
    fetchRecomendedItems();
    return;
  }, []);

  const checkRecommended = async () => {
    setLoadingRecomended(true);
    if (cartId) {
      const { data } = await axios.get(
        `${webAddress}/api/baskets/related/${cartId}`
      );
      if (data.data && data.data.length) {
        setLoadingRecomended(false);

        setRecomendedItems(data.data);
        setOpen(true);
      } else {
        setLoadingRecomended(false);
        router.push("/cart/");
      }
    }
  };

  const addToBasket = async (selectedProdId: number) => {
    let modifierProduct: any = null;
    let selectedModifiers: any = null;
    setIsBasketLoading(true);
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
    setIsBasketLoading(false);
  };

  function SamplePrevArrow(props: any) {
    const { className, style, onClick } = props;
    return (
      <img
        src="/leftArrow.webp"
        className={className}
        style={{ ...style, display: "block", height: "40px" }}
        onClick={onClick}
      />
    );
  }
  return (
    <>
      <div
        className={
          (!isEmpty ? "" : " hidden") + "w-full fixed bg-white bottom-0"
        }
        ref={popoverRef}
      >
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
        {!isEmpty && (
          <div className="">
            <div className="flex  text-xl border-b border-primary font-sans">
              <div className="flex bg-primary rounded-tr-xl text-white">
                <ShoppingCartIcon className="h-5 my-auto text-white pr-1" />
                {tr("my_order")}
                <div className="text-white font-bold px-2">
                  {" "}
                  x{data && data.lineItems ? data?.lineItems.length : 0}
                </div>
              </div>
            </div>
            <div className="mx-10">
              <Slider {...settings}>
                {data &&
                  data?.lineItems.map((lineItem: any) => (
                    <div key={lineItem.id} className="flex py-3 pr-2">
                      <div>
                        {lineItem.child &&
                        lineItem.child.length &&
                        lineItem.child[0].variant?.product?.id !=
                          lineItem?.variant?.product?.box_id ? (
                          <div className="h-11 w-11 flex relative">
                            <div className="w-5 relative overflow-hidden">
                              <div>
                                <Image
                                  src={
                                    lineItem?.variant?.product?.assets?.length
                                      ? `${webAddress}/storage/${lineItem?.variant?.product?.assets[0]?.location}/${lineItem?.variant?.product?.assets[0]?.filename}`
                                      : "/no_photo.svg"
                                  }
                                  width="40"
                                  height="40"
                                  layout="fixed"
                                  className="absolute rounded-full"
                                />
                              </div>
                            </div>
                            <div className="w-5 relative overflow-hidden">
                              <div className="absolute right-0">
                                <Image
                                  src={
                                    lineItem?.child[0].variant?.product?.assets
                                      ?.length
                                      ? `${webAddress}/storage/${lineItem?.child[0].variant?.product?.assets[0]?.location}/${lineItem?.child[0].variant?.product?.assets[0]?.filename}`
                                      : "/no_photo.svg"
                                  }
                                  width="40"
                                  height="40"
                                  layout="fixed"
                                  className="rounded-full"
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="mb-2 items-center">
                            <div className="flex">
                              <div className="mx-auto flex">
                                <div>
                                  <XIcon
                                    className="h-4 text-primary w-4 right-0 top-0"
                                    onClick={() => destroyLine(lineItem.id)}
                                  />
                                </div>
                                <Image
                                  src={
                                    lineItem?.variant?.product?.assets?.length
                                      ? `${webAddress}/storage/${lineItem?.variant?.product?.assets[0]?.location}/${lineItem?.variant?.product?.assets[0]?.filename}`
                                      : "/no_photo.svg"
                                  }
                                  width={132}
                                  height={100}
                                />
                                <div className="items-center justify-between mt-1">
                                  <div className=" items-center flex justify-around bg-primary text-white rounded-full p-1">
                                    <PlusIcon
                                      className="w-6"
                                      onClick={() =>
                                        increaseQuantity(lineItem.id)
                                      }
                                    />
                                  </div>
                                  <div className="flex-grow text-center text-primary font-medium text-xl">
                                    {lineItem.quantity}
                                  </div>
                                  <div className="items-center flex justify-around bg-primary text-white rounded-full p-1 ">
                                    <MinusIcon
                                      className="w-6"
                                      onClick={() => decreaseQuantity(lineItem)}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="font-medium h-16 items-center leading-5 mx-auto pt-2 text-center w-32">
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
                                        v?.variant?.product?.attribute_data
                                          ?.name[channelName][locale || "ru"]
                                    )
                                    .join(" + ")}`
                                : lineItem?.variant?.product?.attribute_data
                                    ?.name[channelName][locale || "ru"]}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="text-center">
                        <div className=" font-medium text-primary">
                          {
                            lineItem.child && lineItem.child.length
                              ? (+lineItem.total + +lineItem.child[0].total) *
                                lineItem.quantity
                              : // currency(
                                //     (+lineItem.total + +lineItem.child[0].total) *
                                //       lineItem.quantity,
                                //     {
                                //       pattern: "# !",
                                //       separator: " ",
                                //       decimal: ".",
                                //       symbol: `${locale == "uz" ? "so'm" : "сум"}`,
                                //       precision: 0,
                                //     }
                                //   ).format()
                                lineItem.total * lineItem.quantity
                            // currency(lineItem.total * lineItem.quantity, {
                            //     pattern: "# !",
                            //     separator: " ",
                            //     decimal: ".",
                            //     symbol: `${locale == "uz" ? "so'm" : "сум"}`,
                            //     precision: 0,
                            //   }
                            //).format()
                          }
                        </div>
                      </div>
                    </div>
                  ))}
              </Slider>
            </div>
            {/* {!isEmpty && (
              <div className="flex items-center justify-between pt-4">
                <div className="text-sm">{tr('basket_order_price')}</div>
                <div className="text-xl font-medium">
                  {currency(data.totalPrice, {
                    pattern: '# !',
                    separator: ' ',
                    decimal: '.',
                    symbol: `${locale == 'uz' ? "so'm" : 'сум'}`,
                    precision: 0,
                  }).format()}
                </div>
              </div>
            )} */}
          </div>
        )}

        {/* <div className="flex bottom-0 w-full"> */}
        <div className="flex text-center  w-full h-full justify-center items-center">
          <div
            className="text-2xl text-white bg-black w-full py-5"
            onClick={openCancelModal}
          >
            <div className="text-[40px] font-medium">
              {tr("profile_address_cancel")}
            </div>
          </div>
          <div
            className=" bg-greenPrimary text-white w-full "
            onClick={() => checkRecommended()}
          >
            <div className="flex items-end mx-auto space-x-4">
              <div className="text-[40px] font-medium">{tr("to_pay")}</div>{" "}
              <div className="text-[50px] font-medium">
                {!isEmpty &&
                  data.totalPrice &&
                  currency(data.totalPrice, {
                    pattern: "# !",
                    separator: " ",
                    decimal: ".",
                    symbol: ``,
                    precision: 0,
                  }).format()}
              </div>
            </div>
          </div>
        </div>
        {/* </div> */}

        <Transition appear show={open} as={Fragment}>
          <Dialog
            as="div"
            className="fixed inset-0 z-[100] overflow-y-auto"
            initialFocus={cancelButtonRef}
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
                <div className="align-middle inline-block overflow-hidden w-full z-[200]">
                  <div className="bg-white my-96 relative shadow-xl transform mx-28">
                    {isBasketLoading && (
                      <div className="h-full w-full absolute z-50 flex items-center justify-around bg-gray-300 top-0 bg-opacity-60 left-0 rounded-[15px]">
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
                    <div
                      className="absolute text-white hidden md:block p-3 right-0 bg-primary top-0 w-max"
                      onClick={() => setOpen(false)}
                    >
                      <XIcon className="w-10" />
                    </div>
                    <div
                      className="font-serif text-6xl pt-14 pb-16 px-48"
                      ref={cancelButtonRef}
                    >
                      {tr("recomended_to_your_order")}
                    </div>
                    {recomendedItems.length > 0 && (
                      <div className="px-11 shadow-md rounded-2xl grid grid-cols-3 pb-28">
                        {recomendedItems.map((item: any) => (
                          <div
                            className="rounded-2xl px-5 py-2 text-center m-2 "
                            onClick={() => addToBasket(item.id)}
                            key={item.name}
                          >
                            <div className="flex-grow flex items-center flex-col justify-center">
                              <div className="h-44">
                                {item.image ? (
                                  <img
                                    src={item.image}
                                    width={245}
                                    height={184}
                                    alt={
                                      item?.attribute_data?.name[channelName][
                                        locale || "ru"
                                      ]
                                    }
                                    className="transform motion-safe:group-hover:scale-105 transition duration-500"
                                  />
                                ) : (
                                  <img
                                    src="/no_photo.svg"
                                    width={245}
                                    height={184}
                                    alt={
                                      item?.attribute_data?.name[channelName][
                                        locale || "ru"
                                      ]
                                    }
                                    className="rounded-full transform motion-safe:group-hover:scale-105 transition duration-500"
                                  />
                                )}
                              </div>

                              <div className="text-2xl leading-5 font-bold mb-3 h-16 pt-6 text-center font-sans">
                                {
                                  item?.attribute_data?.name[channelName][
                                    locale || "ru"
                                  ]
                                }
                              </div>
                            </div>
                            <div
                              className="text-3xl text-primary font-normal"
                              //onClick={() => addToBasket(item.id)}
                            >
                              {currency(parseInt(item.price, 0) || 0, {
                                pattern: "# !",
                                separator: " ",
                                decimal: ".",
                                symbol: `${locale == "uz" ? "so'm" : "сум"}`,
                                precision: 0,
                              }).format()}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex fixed w-full">
                      <button
                        className="text-4xl font-medium bg-gray-300 py-5 text-black outline-none w-full h-36 font-sans"
                        onClick={() => closeModal()}
                      >
                        {tr("no_thanks")}
                      </button>
                      <button
                        className="text-4xl font-medium bg-primary py-5 text-white outline-none w-full h-36 font-sans"
                        onClick={() => closeModal()}
                      >
                        {tr("ready")}
                      </button>
                    </div>
                  </div>
                </div>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition>

        <Transition appear show={cancelOpen} as={Fragment}>
          <Dialog
            className="fixed inset-0 z-[100] overflow-y-auto"
            initialFocus={cancelModalButtonRef}
            onClose={closeCancelModal}
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
                className="inline-block h-screen align-middle "
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
                <div className="align-middle inline-block overflow-hidden w-full z-[200]">
                  <div className="bg-primary my-96 relative shadow-xl transform mx-28">
                    {isBasketLoading && (
                      <div className="h-full w-full absolute z-50 flex items-center justify-around bg-gray-300 top-0 bg-opacity-60 left-0 rounded-[15px]">
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
                    <div
                      className="absolute text-primary hidden md:block p-3 right-0 bg-white top-0 w-max"
                      onClick={() => closeCancelModal()}
                    >
                      <XIcon className="w-10" />
                    </div>
                    <div
                      className="font-serif text-7xl py-64 text-white"
                      ref={cancelModalButtonRef}
                    >
                      {tr("promptBasketClear")}
                    </div>
                    <div className="flex fixed w-full">
                      <button
                        className="text-5xl font-medium bg-white py-5 text-black outline-none w-full h-36 font-sans"
                        onClick={() => closeCancelModal()}
                      >
                        {tr("no")}
                      </button>
                      <button
                        className="text-5xl font-medium bg-greenPrimary py-5 text-white outline-none w-full h-36 font-sans"
                        onClick={() => cancelBasket()}
                      >
                        {tr("yes")}
                      </button>
                    </div>
                  </div>
                </div>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition>
      </div>
    </>
  );
};

export default memo(SmallCart);
