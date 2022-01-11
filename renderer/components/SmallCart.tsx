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
  // if (typeof window !== undefined) {
  //   cartId = localStorage.getItem("basketId");
  // }

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
      <div className="pb-48 flex flex-row">
        {!isEmpty && (
          <div className=" bg-white">
            
              {data &&
                data?.lineItems.map((lineItem: any) => (
                  <div key={lineItem.id} className="">
                    <div>
                      {lineItem.child &&
                      lineItem.child.length &&
                      lineItem.child[0].variant?.product?.id !=
                        lineItem?.variant?.product?.box_id ? (
                        <div className="flex">
                          <div className="">
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
                                className="rounded-full"
                              />
                            </div>
                          </div>
                          <div className="w-5">
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
                          {/* <div className="font-medium ml-3 mx-1 w-7/12">
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
                          </div> */}
                          <div>
                            <XIcon
                              className="cursor-pointer h-4 text-black w-4"
                              onClick={() => destroyLine(lineItem.id)}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex">
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
                        <div className="items-center flex bg-white text-gray-500 rounded-md p-1 ">
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
            
            
            
          </div>
        )}
      </div>
      
      
    </>
  );
};

export default SmallCart;
