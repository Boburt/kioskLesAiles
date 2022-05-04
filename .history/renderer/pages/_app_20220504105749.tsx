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

  useEffect(() => {
    const { shortcut } = props;

    shortcut.registerShortcut(save, ["ctrl+s", "cmd+s"], "Save", "Save a file");
    shortcut.registerShortcut(
      create,
      ["ctrl+n", "cmd+n"],
      "New",
      "Create a new file"
    );
    return () => {
      const { shortcut } = props;
      shortcut.unregisterShortcut(["ctrl+n", "cmd+n"]);
      shortcut.unregisterShortcut(["ctrl+s", "cmd+s"]);
    };
  }, []);

  return (
    <ManagedUIContext pageProps={pageProps}>
      <ShortcutProvider>
        <Layout pageProps={pageProps}>
          <Component {...pageProps} />
        </Layout>
      </ShortcutProvider>
    </ManagedUIContext>
  );
}

export default MyApp;
