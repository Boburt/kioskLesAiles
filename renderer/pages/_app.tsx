import React from "react";
import type { AppProps } from "next/app";

import { ManagedUIContext } from "@components/ui/context";

import "@assets/fonts.css";

import "../styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ManagedUIContext pageProps={pageProps}>
      <React.Fragment>
        <Component {...pageProps} />
      </React.Fragment>
    </ManagedUIContext>
  );
}

export default MyApp;
