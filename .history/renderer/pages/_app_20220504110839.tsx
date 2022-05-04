import React, { FC, useEffect } from "react";
import type { AppProps } from "next/app";

import { ManagedUIContext } from "@components/ui/context";
import {
  withShortcut,
  ShortcutProvider,
  ShortcutConsumer,
} from "react-keybind";

import "@assets/fonts.css";

import "../styles/output.css";

const Noop: FC = ({ children }) => <>{children}</>;

function MyApp({ Component, pageProps }: AppProps) {
  const Layout = (Component as any).Layout || Noop;

  return (
    <ManagedUIContext pageProps={pageProps}>
      <ShortcutProvider pageProps={pageProps}>
        <Layout pageProps={pageProps}>
          <Component {...pageProps} />
        </Layout>
      </ShortcutProvider>
    </ManagedUIContext>
  );
}

export default MyApp;
