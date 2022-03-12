import { FC, memo, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { LinkItem } from "@commerce/types/headerMenu";
import Image from "next/image";
import dynamic from "next/dynamic";
import SimpleBar from "simplebar-react";
import { useSelectedLanguage } from "next-export-i18n";
import { useUI } from "@components/ui/context";
import Layout from "@components/Layout";
import Link from "next/link";
import useTranslation from "next-translate/useTranslation";
const remote = require("@electron/remote");
// console.log(process.versions.electron);

const { PosPrinter } = remote.require("electron-pos-printer");
const path = require("path");

const OrderSuccess = () => {
  const { orderData } = useUI();
  const { lang: locale } = useSelectedLanguage();
  const router = useRouter();
  const { id } = router.query;
  const { t: tr } = useTranslation("common");

  const printOrder = () => {
    const data = [
      {
        type: "image",
        path: path.join(__dirname, "assets/main_logo.svg"), // file path
        position: "center", // position of image: 'left' | 'center' | 'right'
        width: "auto", // width of image in px; default: auto
        height: "60px", // width of image in px; default: 50 or '50px'
      },
      {
        type: "text", // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
        value:
          "@lesailesbestbot orqali buyurtma bering<br>va 5% lik cashbackni qo'lga kiriting.",

        css: {
          "font-size": "12px",
          "font-family": "sans-serif",
          "text-align": "center",
        },
      },
      {
        type: "text", // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
        value: "***************************<br><br>",

        css: {
          "font-size": "30px",
          "font-family": "sans-serif",
          "text-align": "center",
        },
      },
      {
        type: "text", // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
        value: "Накладная",

        css: {
          "font-size": "30px",
          "font-family": "sans-serif",
          "text-align": "center",
        },
      },
      {
        type: "text", // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
        value: "Заказ № 427",

        css: {
          "font-size": "30px",
          "font-family": "sans-serif",
          "text-align": "center",
        },
      },
      {
        type: "text", // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
        value: `Заказ принят: `,

        css: {
          "font-size": "20px",
          "font-family": "sans-serif",
          "text-align": "center",
        },
      },
      {
        type: "text", // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
        value: `------------------------------------<br>Наименование К-во Сумма<br>------------------------------------`,

        css: {
          "font-size": "20px",
          "font-family": "sans-serif",
          "text-align": "center",
        },
      },
    ];

    
let webContents = remote.getCurrentWebContents();
let printers = webContents.getPrinters(); //list the printers
console.log(printers);

    
      const options = {
        preview: false, // Preview in window or print
        margin: "0 0 0 0", // margin of content body
        copies: 1, // Number of copies to print
        width: '300px', 
        printerName: "CUSTOM VKP80 II", // printerName: string, check it at webContent.getPrinters()
        timeOutPerLine: 400,
        silent: true,
      };
setTimeout(() => {
  PosPrinter.print(data, options)
  .then(() => {})
  .catch((error: any) => {
    console.error(error);
  });
}, 1000)

    // function print() {
    //   let printerName;
    //   let widthPage;

    //   var p = document.getElementsByName("printer");
    //   var w = document.getElementsByName("width");

    //   for (var i = 0, length = p.length; i < length; i++) {
    //     if (p[i].checked) {
    //       printerName = p[i].value;

    //       break;
    //     }
    //   }

    //   for (var i = 0, length = w.length; i < length; i++) {
    //     if (w[i].checked) {
    //       widthPage = w[i].value;

    //       break;
    //     }
    //   }

    //   console.log(printerName, widthPage);

    //   const options = {
    //     preview: false, // Preview in window or print
    //     width: widthPage, //  width of content body
    //     margin: "0 0 0 0", // margin of content body
    //     copies: 1, // Number of copies to print
    //     printerName: printerName, // printerName: string, check it at webContent.getPrinters()
    //     timeOutPerLine: 400,
    //     silent: true,
    //   };

    //   const now = {
    //     type: "text",
    //     value: "" + date(),
    //     style: `text-align:center;`,
    //     css: { "font-size": "12px", "font-family": "sans-serif" },
    //   };

    //   const d = [...data, now];

    //   if (printerName && widthPage) {
    //     PosPrinter.print(d, options)
    //       .then(() => {})
    //       .catch((error) => {
    //         console.error(error);
    //       });
    //   } else {
    //     alert("Select the printer and the width");
    //   }
    // }





  };

  useEffect(() => {
    printOrder();
  }, []);

  return (
    <div className="bg-primary h-full text-white">
      <div className="text-white font-bold text-6xl m-auto pt-60 text-center font-serif">
        {tr("thanks_choosing_us")}
      </div>
      <div className="text-white font-bold text-6xl m-auto pt-14 text-center font-serif">
        {tr("your_order")}
      </div>
      <div className="text-greenPrimary font-bold text-[200px] m-auto pt-7 text-center font-serif">
        № {id}
      </div>
      <div className="text-white font-bold text-6xl m-auto pt-14 text-center font-serif px-72">
        {tr("go_to_the_pickup")}
      </div>
      <Link href="/menu">
        <a className="bg-black bottom-0 fixed py-20 text-4xl text-center text-white w-full font-sans font-medium">
          {tr("order_again")}
        </a>
      </Link>
    </div>
  );
};

OrderSuccess.Layout = Layout;

export default OrderSuccess;
