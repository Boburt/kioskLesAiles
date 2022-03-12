
const postPrint = (order: any) => {
  const remote = require("@electron/remote");
  const path = require("path");
  // console.log(process.versions.electron);

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
      value: "Заказ № 427",

      css: {
        "font-size": "13px",
        "font-family": "sans-serif",
        "text-align": "center",
      },
    },
    {
      type: "text",
      value: "Даврон Юлдашев",
      css: {
        "font-size": "13px",
        "font-family": "sans-serif",
      },
    },
    {
      type: "text",
      value: "+998 90 951-40-19",
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
            value: "17:10 03.02.2022",
            css: { "text-align": "right" },
          }
        ],
      ],
      style: 'border: 0',
      tableBodyStyle: 'border: 0',
      tableFooterStyle: 'border: 0',
      tableHeaderStyle: 'border: 0',
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
      tableBody: [
        [
          { type: "text", value: "Лестер чиз", css: { "text-align": "left" } },
          { type: "text", value: 1, css: { "text-align": "right" } },
          { type: "text", value: "22 000", css: { "text-align": "right" } },
        ],
        [
          { type: "text", value: "Лонгер чиз", css: { "text-align": "left" } },
          { type: "text", value: 1, css: { "text-align": "right" } },
          { type: "text", value: "18 000", css: { "text-align": "right" } },
        ],
        [
          { type: "text", value: "Майонез", css: { "text-align": "left" } },
          { type: "text", value: 1, css: { "text-align": "right" } },
          { type: "text", value: "3 000", css: { "text-align": "right" } },
        ],
        [
          { type: "text", value: "Кетчуп", css: { "text-align": "left" } },
          { type: "text", value: 1, css: { "text-align": "right" } },
          { type: "text", value: "2 000", css: { "text-align": "right" } },
        ],
      ],
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
            [{
                type: "text",
                value: "Итого к оплате:",
                css: {
                    "text-align": "left",
                    "font-weight": "bold",
                    "font-size": "20px",
                    "font-family": "sans-serif"
                }
            },
            {
                type: "text",
                value: "45 000",
                css: {
                    "text-align": "right",
                    "font-weight": "bold",
                    "font-size": "20px",
                    "font-family": "sans-serif"
                }
            }]
        ],
        tableBodyStyle: 'border: 0',
        tableFooterStyle: 'border: 0',
        tableHeaderStyle: 'border: 0',
    },
    {
        type: "table",
        tableBody: [
            [{
                type: "text",
                value: "С учётом НДС (15%):",
                css: {
                    "text-align": "left",
                    "font-size": "13px",
                    "font-family": "sans-serif"
                }
            },
            {
                type: "text",
                value: "5 870",
                css: {
                    "text-align": "right",
                    "font-size": "13px",
                    "font-family": "sans-serif"
                }
            }]
        ],
        tableBodyStyle: 'border: 0',
        tableFooterStyle: 'border: 0',
        tableHeaderStyle: 'border: 0',
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
            "font-family": "sans-serif"
        }
    },
    {
        type: "text",
        value: "Доп. номер: 998071181 Мне нужны приборы",
        css: {
            "text-align": "left",
            "font-weight": "bold",
            "font-size": "25px",
            "font-family": "sans-serif"
        }
    },
    {
      type: "text",
      value: "<br /><br />",
    },
    {
        type: "text",
        value: "Счет будет пополнен на 2 250,00 бон. (5%)",
        css: {
            "text-align": "left",
            "font-size": "13px",
            "font-family": "sans-serif"
        }
    },
    {
      type: "text",
      value: "<br /> <br /> <br /> <br /> <br /> <br />",
    },
  ];

  let webContents = remote.getCurrentWebContents();
  let printers = webContents.getPrinters(); //list the printers
  console.log(data);

  const options = {
    preview: false, // Preview in window or print
    margin: "0 0 100px 0", // margin of content body
    copies: 1, // Number of copies to print
    width: "320px",
    printerName: "CUSTOM VKP80 II", // printerName: string, check it at webContent.getPrinters()
    timeOutPerLine: 400,
    silent: true,
  };
  console.log(options);
  // setTimeout(() => {
  PosPrinter.print(data, options)
    .then(() => {})
    .catch((error: any) => {
      console.error(error);
    });
};

export default postPrint;
