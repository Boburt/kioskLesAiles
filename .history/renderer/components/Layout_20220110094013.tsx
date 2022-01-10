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
import Footer from "./footer";

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
      <main className="grid grid-flow-row-dense grid-cols-6 bg-white text-black text-center">
        {children}
      </main>
      <Footer />
    </CommerceProvider>
  );
};

export default Layout;
