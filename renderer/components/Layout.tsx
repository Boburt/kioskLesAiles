import React, {
  FC,
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/router";
import { CommerceProvider } from "@framework";
import type { Page } from "@commerce/types/page";
import { APILinkItem } from "@commerce/types/headerMenu";
import { SocialIcons } from "@commerce/types/socialIcons";
import { City } from "@commerce/types/cities";
import { useIdleTimer } from "react-idle-timer";
import Header from "./Header";
import { useUI } from "./ui/context";

interface Props {
  pageProps: {
    pages?: Page[];
    categories: any[];
    topMenu: APILinkItem[];
    footerInfoMenu: APILinkItem[];
    socials: SocialIcons[];
    cleanBackground?: boolean;
    cities: City[];
    currentCity?: City;
    geo: any;
  };
}
const Layout: FC<Props> = ({
  children,
  pageProps: {
    categories = [],
    topMenu = [],
    footerInfoMenu = [],
    socials = [],
    cities = [],
    currentCity,
    cleanBackground = false,
    ...pageProps
  },
}) => {
  const { locale = "ru", pathname, query, push } = useRouter();
  const { setUserData } = useUI();
  const handleOnIdle = (event: any) => {
    localStorage.removeItem("mijoz");
    localStorage.removeItem("basketId");
    setUserData(null);
    push(`/inactive`);
  };
  const { getRemainingTime, getLastActiveTime } = useIdleTimer({
    timeout: 1000 * 60 * 5,
    onIdle: handleOnIdle,
    debounce: 500,
  });
  return (
    <CommerceProvider locale={locale}>
      <Header />
      <main className=" bg-white text-black mt-[6.6rem] overflow-y-auto h-[calc(100vh-106px)]">
        {children}
      </main>
    </CommerceProvider>
  );
};

export default Layout;
