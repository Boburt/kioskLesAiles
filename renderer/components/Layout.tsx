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
import Header from "./Header";

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
  const { locale = "ru", pathname, query } = useRouter();
  return (
    <CommerceProvider locale={locale}>
      <Header />
      <main className=" bg-white text-black mt-28 overflow-y-auto h-[calc(100vh-240px)]">
        {children}
      </main>
    </CommerceProvider>
  );
};

export default Layout;
