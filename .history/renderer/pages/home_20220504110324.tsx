import React, { useEffect } from "react";
import Link from "next/link";
import Prodcart from "../components/mainProductCart";
import { Ru, Uz, Us } from "react-flags-select";
import { GetServerSidePropsContext, GetStaticPropsContext } from "next";
import commerce from "@lib/api/commerce";
import { useUI } from "@components/ui/context";
import { useRouter } from "next/router";
import {
  useTranslation,
  useLanguageQuery,
  LanguageSwitcher,
} from "next-export-i18n";
import { useIdleTimer } from "react-idle-timer";

declare global {
  interface Window {
    api: any; // 👈 turn off type checking
  }
}

function Home(props: any) {
  const {
    user,
    setUserData,
    locationData,
    setLocationData,
    cities,
    activeCity,
    setActiveCity,
    openSignInModal,
    addressId,
    setStopProducts,
    stopProducts,
  } = useUI();
  const { t: tr } = useTranslation("common");

  const router = useRouter();
  const { locale } = router;

  const setDeliveryType = (deliveryType = "pickup") => {
    setLocationData({
      ...locationData,
      deliveryType,
    });
    router.push("/menu");
  };
  const handleOnIdle = (event: any) => {
    localStorage.removeItem("mijoz");
    setUserData(null);
    router.push(`/inactive`);
  };
  const { getRemainingTime, getLastActiveTime } = useIdleTimer({
    timeout: 1000 * 60 * 5,
    onIdle: handleOnIdle,
    debounce: 500,
  });

  const initPreferences = () => {
    let preferences = window.api.getPreferences();
    window.api.showPreferences();
  };

  useEffect(() => {
    const { shortcut } = props;

    shortcut.registerShortcut(
      initPreferences,
      ["ctrl+shift+e", "cmd+shift+e"],
      "Save",
      "Save a file"
    );
    return () => {
      const { shortcut } = props;
      shortcut.unregisterShortcut(["ctrl+n", "cmd+n"]);
      shortcut.unregisterShortcut(["ctrl+s", "cmd+s"]);
    };
  }, []);

  return (
    <>
      <div className="bg-primary grid grid-flow-row auto-rows-max font-serif h-[calc(100vh-1px)]">
        <div className="flex ml-auto space-x-3 pt-10 pr-10">
          <LanguageSwitcher lang="ru">
            <div className="flex items-center text-sm px-4 py-2 leading-none border rounded-xl text-black border-white hover:border-transparent hover:text-teal-500 hover:bg-gray-500 mt-4 lg:mt-0 bg-white space-x-2">
              <Ru className="w-4 h-4 rounded-full" />
              <a href="#" className="">
                Ру
              </a>
            </div>
          </LanguageSwitcher>
          <LanguageSwitcher lang="uz">
            <div className="flex items-center text-sm px-4 py-2 leading-none border rounded-xl text-black border-white hover:border-transparent hover:text-teal-500 hover:bg-gray-500 mt-4 lg:mt-0 bg-white space-x-2">
              <Uz className="w-4 h-4 rounded-full" />
              <a href="#" className="">
                Uz
              </a>
            </div>
          </LanguageSwitcher>
          <div className="flex items-center text-sm px-4 py-2 leading-none border rounded-xl text-black border-white hover:border-transparent hover:text-teal-500 hover:bg-gray-500 mt-4 lg:mt-0 bg-white space-x-2">
            <Us className="w-4 h-4 rounded-full" />
            <a href="#" className="">
              En
            </a>
          </div>
        </div>

        <div className="mx-auto mt-52">
          <img src="/assets/home_big_logo.png" />
        </div>
        <div className="pt-48">
          <h2 className="uppercase text-6xl text-center text-white">
            {tr("choose_method")} <br /> {tr("want_to_eat")}
          </h2>
        </div>
        <div className="flex m-auto mt-20 space-x-10 mb-20">
          <div
            className="items-center p-14 w-80 flex flex-col text-center rounded-3xl text-black bg-white"
            onClick={() => setDeliveryType("table")}
          >
            <img src="/restaurant.png" className="mt-8" />
            <div className="text-5xl mt-10">{tr("in_the_room")}</div>
          </div>
          <div
            className="items-center p-14 w-80 flex flex-col text-center rounded-3xl text-black bg-white"
            onClick={() => setDeliveryType("pickup")}
          >
            <img src="/takeaway.png" className="mt-8" />
            <div className="text-5xl mt-10">{tr("with_myself")}</div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
