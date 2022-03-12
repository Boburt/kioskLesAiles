import currency from "currency.js";
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

  let orderId = hashids.decode(order.id);
  let userPhone = order.contact_details.phone;
  let userPhoneNumber = awesomePhonenumber(userPhone, "UZ");
  let userPhoneNumberFormatted = userPhoneNumber.getNumber("international");
  userPhone = userPhoneNumberFormatted;

  let createdAt = order.created_at;
  let createdAtFormatted = DateTime.fromISO(createdAt)
    .toLocal()
    .toFormat("HH:mm dd.MM.yyyy");

  let basketTable: any[] = [];

  order.lines.data.map((item: any) => {
    basketTable.push([
      {
        type: "text",
        value: item.description,
        css: { "text-align": "left" },
      },
      { type: "text", value: item.quantity, css: { "text-align": "right" } },
      {
        type: "text",
        value: currency(item.line_total / 100, {
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
    // {
    //   type: "image",
    //   path: path.join(__dirname, "assets/main_logo.svg"), // file path
    //   position: "center", // position of image: 'left' | 'center' | 'right'
    //   width: "auto", // width of image in px; default: auto
    //   height: "60px", // width of image in px; default: 50 or '50px'
    // },
    {
      type: "text", // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
      value:
        "@lesailesbestbot orqali buyurtma bering<br>va 5% lik cashbackni qo'lga kiriting.",

      css: {
        "font-size": "13px",
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
    {
      type: "text", // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
      value: "Накладная",

      css: {
        "font-size": "13px",
        "font-family": "sans-serif",
        "text-align": "center",
      },
    },
    {
      type: "text", // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
      value: `Заказ № ${orderId}`,

      css: {
        "font-size": "13px",
        "font-family": "sans-serif",
        "text-align": "center",
      },
    },
    {
      type: "text",
      value: `${order.user.data.name}`,
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
    {
      type: "text",
      value: "Комментарий к заказу:",
      css: {
        "text-align": "left",
        "font-size": "13px",
        "font-family": "sans-serif",
      },
    },
    {
      type: "text",
      value: order.notes,
      css: {
        "text-align": "left",
        "font-weight": "bold",
        "font-size": "25px",
        "font-family": "sans-serif",
      },
    },
    {
      type: "text",
      value: "<br /><br />",
    },
    {
      type: "text",
      value: `Счет будет пополнен на ${currency(
        ((order.order_total / 100) * 0.05).toFixed(0),
        {
          pattern: "# !",
          separator: " ",
          decimal: ".",
          symbol: ``,
          precision: 2,
        }
      ).format()} бон. (5%)`,
      css: {
        "text-align": "left",
        "font-size": "13px",
        "font-family": "sans-serif",
      },
    },
    {
      type: "text",
      value: "<br /> <br /> <br /> <br /> <br /> <br />",
    },
  ];

  let webContents = remote.getCurrentWebContents();
  let printers = webContents.getPrinters();

  const options = {
    preview: false, // Preview in window or print
    margin: "0 0 100px 0", // margin of content body
    copies: 1, // Number of copies to print
    width: "320px",
    printerName: "CUSTOM VKP80 II", // printerName: string, check it at webContent.getPrinters()
    timeOutPerLine: 400,
    silent: true,
  };
  // setTimeout(() => {
  PosPrinter.print(data, options)
    .then(() => {})
    .catch((error: any) => {
      console.error(error);
    });
};

export default postPrint;
