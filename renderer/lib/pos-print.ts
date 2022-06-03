import currency from "currency.js";
import { ipcRenderer } from "electron";
import Hashids from "hashids";
import { DateTime } from "luxon";
const awesomePhonenumber = require("awesome-phonenumber");

const postPrint = (order: any) => {
  const remote = require("@electron/remote");
  const path = require("path");

  // console.log(process.versions.electron);

  const hashids = new Hashids(
    "order",
    15,
    "abcdefghijklmnopqrstuvwxyz1234567890"
  );

  let orderId = order.tablo_order_id;
  console.log("orderID", order);
  let userPhone = order.contact_phone;
  let userPhoneNumber = awesomePhonenumber(userPhone, "UZ");
  let userPhoneNumberFormatted = userPhoneNumber.getNumber("international");
  userPhone = userPhoneNumberFormatted;

  let createdAt = order.created_at;
  let createdAtFormatted = DateTime.fromISO(createdAt)
    .toLocal()
    .toFormat("HH:mm dd.MM.yyyy");

  let basketTable: any[] = [];
  console.log("basketTable", basketTable);

  order.basket.lines.map((item: any) => {
    basketTable.push([
      {
        type: "text",
        value: item.variant.product.attribute_data.name.chopar.ru,
        css: { "text-align": "left" },
      },
      { type: "text", value: item.quantity, css: { "text-align": "right" } },
      {
        type: "text",
        value: currency(item.total, {
          pattern: "# !",
          separator: " ",
          decimal: ".",
          symbol: ``,
          precision: 0,
        }).format(),
        css: { "text-align": "right" },
      },
    ]);
  });

  const { PosPrinter } = remote.require("electron-15-pos-printer");

  const data = [
    {
      type: "image",
      path: path.join(__dirname, "assets/logo.svg"), // file path
      position: "center", // position of image: 'left' | 'center' | 'right'
      width: "auto", // width of image in px; default: auto
      height: "60px", // width of image in px; default: 50 or '50px'
    },
    // {
    //   type: "text", // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
    //   value:
    //     "@lesailesbestbot orqali buyurtma bering<br>va 5% lik cashbackni qo'lga kiriting.",

    //   css: {
    //     "font-size": "13px",
    //     "font-family": "sans-serif",
    //     "text-align": "center",
    //   },
    // },
    {
      type: "text", // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
      value: "***************************<br/>",

      css: {
        "font-size": "30px",
        "font-family": "sans-serif",
        "text-align": "center",
      },
    },
    // {
    //   type: "text", // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
    //   value: "Накладная",

    //   css: {
    //     "font-size": "13px",
    //     "font-family": "sans-serif",
    //     "text-align": "center",
    //   },
    // },
    {
      type: "text", // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
      value: `Заказ №`,

      css: {
        "font-size": "30px",
        "font-family": "sans-serif",
        "text-align": "center",
      },
    },
    {
      type: "text", // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
      value: `${order.tablo_order_id ? orderId : order.id}`,

      css: {
        "font-size": "80px",
        "font-family": "sans-serif",
        "text-align": "center",
      },
    },
    {
      type: "text",
      value: "<br />",
    },
    {
      type: "text",
      value: `${order.user.name}`,
      css: {
        "font-size": "13px",
        "font-family": "sans-serif",
      },
    },
    {
      type: "text",
      value: `${userPhone}`,
      css: {
        "font-size": "30px",
        "font-family": "sans-serif",
      },
    },
    {
      type: "text",
      value: "<br />",
    },
    {
      type: "table", // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
      tableBody: [
        [
          {
            type: "text",
            value: "Заказ принят:",
            css: { "text-align": "left" },
          },
          {
            type: "text",
            value: `${createdAtFormatted}`,
            css: { "text-align": "right" },
          },
        ],
      ],
      style: "border: 0",
      tableBodyStyle: "border: 0",
      tableFooterStyle: "border: 0",
      tableHeaderStyle: "border: 0",
      css: {
        "font-size": "13px",
        "font-family": "sans-serif",
      },
    },
    {
      type: "text",
      value: "<br />",
    },
    {
      type: "table", // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
      // value: `------------------------------------<br>Наименование К-во Сумма<br>------------------------------------`,
      tableHeader: [
        { type: "text", value: "Наименование", css: { "text-align": "left" } },
        { type: "text", value: "Кол-во", css: { "text-align": "right" } },
        { type: "text", value: "Сумма", css: { "text-align": "right" } },
      ],
      tableBody: basketTable,
      css: {
        "font-size": "13px",
        "font-family": "sans-serif",
        //   "text-align": "center",
      },
    },
    {
      type: "text",
      value: "<br />",
    },
    {
      type: "table",
      tableBody: [
        [
          {
            type: "text",
            value: "Итого к оплате:",
            css: {
              "text-align": "left",
              "font-weight": "bold",
              "font-size": "20px",
              "font-family": "sans-serif",
            },
          },
          {
            type: "text",
            value: currency(order.order_total / 100, {
              pattern: "# !",
              separator: " ",
              decimal: ".",
              symbol: ``,
              precision: 0,
            }).format(),
            css: {
              "text-align": "right",
              "font-weight": "bold",
              "font-size": "20px",
              "font-family": "sans-serif",
            },
          },
        ],
      ],
      tableBodyStyle: "border: 0",
      tableFooterStyle: "border: 0",
      tableHeaderStyle: "border: 0",
    },
    {
      type: "table",
      tableBody: [
        [
          {
            type: "text",
            value: "С учётом НДС (15%):",
            css: {
              "text-align": "left",
              "font-size": "13px",
              "font-family": "sans-serif",
            },
          },
          {
            type: "text",
            value: currency(
              (((order.order_total / 100) * 15) / 115).toFixed(0),
              {
                pattern: "# !",
                separator: " ",
                decimal: ".",
                symbol: ``,
                precision: 0,
              }
            ).format(),
            css: {
              "text-align": "right",
              "font-size": "13px",
              "font-family": "sans-serif",
            },
          },
        ],
      ],
      tableBodyStyle: "border: 0",
      tableFooterStyle: "border: 0",
      tableHeaderStyle: "border: 0",
    },
    {
      type: "text",
      value: "<br /><br />",
    },
    // {
    //   type: "text",
    //   value: "Комментарий к заказу:",
    //   css: {
    //     "text-align": "left",
    //     "font-size": "13px",
    //     "font-family": "sans-serif",
    //   },
    // },
    // {
    //   type: "text",
    //   value: order.notes,
    //   css: {
    //     "text-align": "left",
    //     "font-weight": "bold",
    //     "font-size": "25px",
    //     "font-family": "sans-serif",
    //   },
    // },
    // {
    //   type: "text",
    //   value: "<br /><br />",
    // },
    // {
    //   type: "text",
    //   value: `Счет будет пополнен на ${currency(
    //     (
    //       (order.order_total / 100) *
    //       (parseInt(preferences.lists.cashback_percent) / 100)
    //     ).toFixed(0),
    //     {
    //       pattern: "# !",
    //       separator: " ",
    //       decimal: ".",
    //       symbol: ``,
    //       precision: 2,
    //     }
    //   ).format()} бон. (${preferences.lists.cashback_percent}%)`,
    //   css: {
    //     "text-align": "left",
    //     "font-size": "13px",
    //     "font-family": "sans-serif",
    //   },
    // },
    {
      type: "text", // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
      value: `Спасибо за покупку`,

      css: {
        "font-size": "30px",
        "font-family": "sans-serif",
        "text-align": "center",
      },
    },
    {
      type: "text", // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
      value: "***************************<br/>",

      css: {
        "font-size": "30px",
        "font-family": "sans-serif",
        "text-align": "center",
      },
    },
  ];

  let webContents = remote.getCurrentWebContents();
  let printers = webContents.getPrinters();

  const options = {
    preview: false, // Preview in window or print
    margin: "0 0 0 0", // margin of content body
    copies: 1, // Number of copies to print
    width: "320px",
    printerName: "CUSTOM VKP80 II", // printerName: string, check it at webContent.getPrinters()
    timeOutPerLine: 400,
    silent: true,
  };
  // setTimeout(() => {
  PosPrinter.print(data, options)
    .then(() => {
      // console.log(data)
    })
    .catch((error: any) => {
      // console.error(error);
    });
};

export default postPrint;
