import React, { FC } from "react";
import type { AppProps } from "next/app";

import { ManagedUIContext } from "@components/ui/context";

import "@assets/fonts.css";

import "../styles/globals.css";

const Noop: FC = ({ children }) => <>{children}</>;

function MyApp({ Component, pageProps }: AppProps) {
  const Layout = (Component as any).Layout || Noop;
  return (
    <ManagedUIContext pageProps={pageProps}>
      <Layout pageProps={pageProps}>
        <Component {...pageProps} />
      </Layout>
    </ManagedUIContext>
  );
}

export default MyApp;
