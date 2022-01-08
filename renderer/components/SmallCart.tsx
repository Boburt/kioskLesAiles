import React, {
  FC,
  Fragment,
  memo,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import useCart from "@framework/cart/use-cart";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import Image from "next/image";
import { XIcon, MinusIcon, PlusIcon } from "@heroicons/react/solid";
import currency from "currency.js";
import axios from "axios";
import Cookies from "js-cookie";
import getConfig from "next/config";
import { useRouter } from "next/router";
import useTranslation from "next-translate/useTranslation";
import { useUI } from "@components/ui/context";
import { Dialog, Transition } from "@headlessui/react";
import OtpInput from "react-otp-input";
import Input from "react-phone-number-input/input";
import styles from "./SmallCartMobile.module.css";
import { createPopper } from "@popperjs/core";
import Hashids from "hashids";
import SimpleBar from "simplebar-react";

const { publicRuntimeConfig } = getConfig();
let webAddress = publicRuntimeConfig.apiUrl;
axios.defaults.withCredentials = true;

interface Errors {
  [key: string]: string;
}

interface AnyObject {
  [key: string]: any;
}

const errors: Errors = {
  name_field_is_required:
    "Мы Вас не нашли в нашей системе. Просьба указать своё имя.",
  opt_code_is_incorrect: "Введённый код неверный или срок кода истёк",
};

let otpTimerRef: NodeJS.Timeout;

type SmallCartProps = {
  channelName: any;
};

const SmallCart: FC<SmallCartProps> = ({ channelName }) => {
  const { t: tr } = useTranslation("common");

  const router = useRouter();
  const { locale } = router;
  let cartId: string | null = null;
  if (typeof window !== undefined) {
    cartId = localStorage.getItem("basketId");
  }

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
    setShowSignInModal(false);
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
    }
  };
  return (
    <>
      <div>
        {isCartLoading && (
          <div className="h-full w-full absolute flex items-center justify-around bg-gray-300 top-0 bg-opacity-60 left-0 rounded-[15px]"></div>
        )}
        {!isEmpty && (
          <div className="divide-y border-b bg-white p-5 rounded-2xl">
            <SimpleBar style={{ maxHeight: 320 }}>
              {data &&
                data?.lineItems.map((lineItem: any) => (
                  <div key={lineItem.id} className="py-3 pr-2">
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
                        <div className="flex mb-2 items-center">
                          <div className="rounded-lg bg-gray-200  flex items-center p-1">
                            <div className="flex">
                              <Image
                                src={
                                  lineItem?.variant?.product?.assets?.length
                                    ? `${webAddress}/storage/${lineItem?.variant?.product?.assets[0]?.location}/${lineItem?.variant?.product?.assets[0]?.filename}`
                                    : "/no_photo.svg"
                                }
                                width={52}
                                height={52}
                              />
                            </div>
                          </div>
                          <div className="font-medium ml-3 mx-1 w-7/12">
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
                          <div>
                            <XIcon
                              className="cursor-pointer h-4 text-black w-4"
                              onClick={() => destroyLine(lineItem.id)}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className=" font-medium">
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
                      <div className="w-20 ml-14 bg-gray-200 rounded-lg flex items-center p-1">
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
                  </div>
                ))}
            </SimpleBar>
            {!isEmpty && (
              <div className="flex items-center justify-between pt-4">
                <div className="text-sm">{tr("basket_order_price")}</div>
                <div className="text-xl font-medium">
                  {currency(data.totalPrice, {
                    pattern: "# !",
                    separator: " ",
                    decimal: ".",
                    symbol: `${locale == "uz" ? "so'm" : "сум"}`,
                    precision: 0,
                  }).format()}
                </div>
              </div>
            )}
            <button
              className="bg-green-500 rounded-xl w-full text-white py-4 mt-5"
              onClick={goToCheckout}
            >
              Оформить заказ
            </button>
          </div>
        )}
      </div>
      <Transition appear show={showSignInModal} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-y-auto"
          onClose={closeModal}
          initialFocus={authButtonRef}
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
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="align-middle inline-block overflow-hidden w-full">
                <div className="md:inline-flex my-8 items-start">
                  <div className="align-middle bg-white inline-block overflow-hidden md:px-16 px-6 py-10 rounded-2xl shadow-xl text-center transform transition-all max-w-2xl">
                    <button
                      className="absolute focus:outline-none hidden md:block outline-none right-4 text-gray-500 top-5 transform"
                      onClick={closeModal}
                    >
                      <XIcon className=" cursor-pointer w-4 h-4" />
                    </button>
                    <Dialog.Title as="h3" className="leading-6 text-3xl">
                      {tr("auth")}
                    </Dialog.Title>
                    {submitError && (
                      <div className="bg-red-200 p-5 font-bold text-red-600 my-6">
                        {submitError}
                      </div>
                    )}
                    {user && (
                      <div className="mt-10 bg-green-200 font-bold text-green-800 p-4">
                        {tr("successfully_logged")} {user.user.name}!
                      </div>
                    )}
                    {!user && isShowPasswordForm && (
                      <div>
                        <form
                          onSubmit={handlePasswordSubmit(submitPasswordForm)}
                        >
                          <div className="mt-10">
                            <label className="text-sm text-gray-400 mb-2 block">
                              {tr("sms_code")}
                            </label>
                            <OtpInput
                              value={otpCode}
                              onChange={handleOtpChange}
                              inputStyle={`${styles.digitField} border border-primary w-16 rounded-3xl h-12 outline-none focus:outline-none text-center`}
                              isInputNum={true}
                              containerStyle="grid grid-cols-4 gap-1.5 justify-center"
                              numInputs={4}
                            />
                            {otpShowCode > 0 ? (
                              <div className="text-xs text-primary mt-3">
                                {otpTimerText}
                              </div>
                            ) : (
                              <button
                                className="text-xs text-primary mt-3 outline-none focus:outline-none border-b border-primary pb-0.5"
                                onClick={(e) => getNewCode(e)}
                              >
                                {tr("get_code_again")}
                              </button>
                            )}
                          </div>
                          <div className="mt-10">
                            <button
                              className={`py-3 px-20 text-white font-bold text-xl text-center rounded-xl w-full outline-none focus:outline-none ${
                                otpCode.length >= 4
                                  ? "bg-primary"
                                  : "bg-gray-400"
                              }`}
                              disabled={otpCode.length < 4}
                              ref={authButtonRef}
                            >
                              {passwordFormState.isSubmitting ? (
                                <svg
                                  className="animate-spin h-5 mx-auto text-center text-white w-5"
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
                              ) : (
                                tr("signIn")
                              )}
                            </button>
                          </div>
                        </form>
                      </div>
                    )}{" "}
                    {!user && !isShowPasswordForm && (
                      <>
                        <form onSubmit={handleSubmit(onSubmit)}>
                          <div className="mt-10">
                            <label className="text-sm text-gray-400 mb-2 block">
                              {tr("personal_phone")}
                            </label>
                            <div className="relative">
                              <Controller
                                render={({ field: { onChange, value } }) => (
                                  <Input
                                    defaultCountry="UZ"
                                    country="UZ"
                                    international
                                    withCountryCallingCode
                                    value={value}
                                    className="border border-primary focus:outline-none outline-none px-6 py-3 rounded-full text-sm w-full"
                                    onChange={(e: any) => onChange(e)}
                                    onKeyDown={(e: any) => {
                                      if (e.key == "Enter") {
                                        e.preventDefault();
                                        handleSubmit(onSubmit)();
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
                              {authPhone && (
                                <button
                                  className="absolute focus:outline-none inset-y-0 outline-none right-4 text-gray-400"
                                  onClick={() => {
                                    resetField("phone");
                                  }}
                                >
                                  <XIcon className="cursor-pointer h-5 text-gray-400 w-5" />
                                </button>
                              )}
                            </div>
                          </div>

                          {showUserName && (
                            <div className="mt-10">
                              <label className="text-sm text-gray-400 mb-2 block">
                                {tr("your_name")}
                              </label>
                              <div className="relative">
                                <input
                                  type="text"
                                  {...register("name")}
                                  className="border border-primary focus:outline-none outline-none px-6 py-3 rounded-full text-sm w-full"
                                />
                                {authName && (
                                  <button
                                    className="absolute focus:outline-none inset-y-0 outline-none right-4 text-gray-400"
                                    onClick={() => {
                                      resetField("name");
                                    }}
                                  >
                                    <XIcon className="cursor-pointer h-5 text-gray-400 w-5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                          <div className="mt-10">
                            <button
                              className={`py-3 md:px-20 text-white font-bold text-xl text-center rounded-xl w-full outline-none focus:outline-none ${
                                formState.isValid ? "bg-primary" : "bg-gray-400"
                              }`}
                              disabled={!formState.isValid}
                              ref={authButtonRef}
                            >
                              {formState.isSubmitting ? (
                                <svg
                                  className="animate-spin h-5 mx-auto text-center text-white w-5"
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
                              ) : (
                                tr("get_code")
                              )}
                            </button>
                          </div>
                        </form>
                        {/*<div className="mt-5 text-gray-400 text-sm">
                              Нажимая получить код я принимаю условия{' '}
                              <a
                                href="/privacy"
                                onClick={showPrivacy}
                                className="text-primary block"
                                target="_blank"
                              >
                                пользовательского соглашения
                              </a>
                                </div>*/}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
      <Transition appear show={isShowPrivacy} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto"
          onClose={closePrivacy}
          initialFocus={privacyButtonRef}
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
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default memo(SmallCart);
