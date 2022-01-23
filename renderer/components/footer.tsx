import React, { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import defaultChannel from "@lib/defaultChannel";

function Footer() {
  const [channelName, setChannelName] = useState("chopar");
  const [open, setOpen] = useState(false);
  const getChannel = async () => {
    const channelData = await defaultChannel();
    setChannelName(channelData.name);
  };
  return (
    <div className="flex h-32 bottom-0 w-full">
      <div className="flex text-center bg-teal-500 w-full h-full">
        <div
          className="text-2xl text-white bg-black px-60 py-12"
          //onClick={clearBasket}
        >
          Отменить
        </div>
        <div
          className="w-full bg-green-400 text-2xl py-12"
          onClick={() => {
            setOpen(true);
          }}
        >
          К оплате:{" "}
          {
            // !isEmpty && data.totalPrice
            // currency(data.totalPrice, {
            //   pattern: "# !",
            //   separator: " ",
            //   decimal: ".",
            //   symbol: `${locale == "uz" ? "so'm" : "сум"}`,
            //   precision: 0,
            // }).format())
          }
        </div>
      </div>
    </div>
  );
}
export default Footer;
