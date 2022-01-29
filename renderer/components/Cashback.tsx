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

function Cashback() {
  const [channelName, setChannelName] = useState("chopar");
  const [open, setOpen] = useState(false);
  const cancelButtonRef = useRef(null);

  return (
    <>
      <Transition.Root show={open} as={Fragment}>
        <Dialog
          as="div"
          static
          className="fixed z-50 inset-0"
          initialFocus={cancelButtonRef}
          open={open}
          onClose={setOpen}
        >
          <div className="flex items-end justify-center h-full md:pt-4 md:px-4 md:pb-20 text-center sm:block sm:p-0">
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
            <span className="hidden " aria-hidden="true">
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
              <div className="bg-white mx-[49px]">
                <div className="bg-[#7C40C6] my-96 relative shadow-xl transform mx-28">
                  <div
                    className="absolute text-white hidden md:block p-3 right-0 bg-greenPrimary top-0 w-max"
                    onClick={() => setOpen(false)}
                  >
                    <XIcon className="w-10" />
                  </div>
                  <div className="text-7xl font-serif font-bold text-white pt-16 mb-12">
                    Хотите получить кешбек 5%?
                  </div>
                  <div className="mx-[70px]">
                    <div className="text-5xl font-serif font-bold text-white">
                      Чтобы получить кешбек, надо просто указать{" "}
                      <span className="text-green-600">номер телефона</span> и{" "}
                      <span className="text-green-600">личные данные</span>
                      <div className="text-5xl font-serif font-bold text-white mt-12">
                        Оплатить заработанными бонусами можно все товары
                      </div>
                    </div>
                  </div>
                  <div className="font-sans text-2xl font-normal mt-32 mx-16 pb-12">
                    Нажимая “Подтвердить”, я принимаю{" "}
                    <span className="text-green-600">
                      условия пользовательского соглашения
                    </span>
                  </div>

                  <div className="flex fixed w-full">
                    <button
                      className="text-4xl font-medium bg-white py-5 text-black outline-none w-full h-36 font-sans"
                      //onClick={() => closeModal()}
                    >
                      Нет, спасибо
                    </button>
                    <button
                      className="text-4xl font-medium bg-greenPrimary py-5 text-white outline-none w-full h-36 font-sans"
                      //onClick={() => closeModal()}
                    >
                      Да, хочу
                    </button>
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
}
export default Cashback;
