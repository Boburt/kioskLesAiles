import React from "react";
import Layout from "@components/Layout";
import {
  useTranslation,
  useLanguageQuery,
  LanguageSwitcher,
} from "next-export-i18n";

function Locator() {
  const { t: tr } = useTranslation("common");
  return (
    <>
      <div className="bg-primary h-full">
        <div className="pt-60">
          <div className="text-6xl font-bold font-serif text-center text-white mx-[240px]">
            {tr("order_to_your_table")}
          </div>
          <div className="text-white text-center mt-[70px] mx-[240px] text-5xl font-bold font-sans">
            {tr("take_the_locator")}
          </div>
        </div>

        <div className="mt-16 flex justify-around">
          <img src="/reservation.png" className=""></img>
        </div>
        <div className="mt-16 flex justify-around">
          {" "}
          <div className="border-solid rounded-lg w-[456px] h-[100px] bg-white">
            {/* {input} */}
          </div>
        </div>
        <div className="mt-3 flex justify-around">
          <div className="border-solid rounded-lg bg-white grid grid-cols-3 gap-2 p-[54px]">
            <div className="w-28 h-[72px] rounded-lg bg-gray-200 text-center text-4xl font-medium p-4">
              1
            </div>
            <div className="w-28 h-[72px] rounded-lg bg-gray-200 text-center text-4xl font-medium p-4">
              2
            </div>
            <div className="w-28 h-[72px] rounded-lg bg-gray-200 text-center text-4xl font-medium p-4">
              3
            </div>
            <div className="w-28 h-[72px] rounded-lg bg-gray-200 text-center text-4xl font-medium p-4">
              4
            </div>
            <div className="w-28 h-[72px] rounded-lg bg-gray-200 text-center text-4xl font-medium p-4">
              5
            </div>
            <div className="w-28 h-[72px] rounded-lg bg-gray-200 text-center text-4xl font-medium p-4">
              6
            </div>
            <div className="w-28 h-[72px] rounded-lg bg-gray-200 text-center text-4xl font-medium p-4">
              7
            </div>
            <div className="w-28 h-[72px] rounded-lg bg-gray-200 text-center text-4xl font-medium p-4">
              8
            </div>
            <div className="w-28 h-[72px] rounded-lg bg-gray-200 text-center text-4xl font-medium p-4">
              9
            </div>
            <div className="w-28 h-[72px] rounded-lg bg-gray-200 text-center text-4xl font-medium p-4">
              0
            </div>
            <div className="w-28 h-[72px] rounded-lg bg-gray-200 text-center text-4xl font-medium p-4">
              {"<="}
            </div>
          </div>
        </div>

        <div className="flex fixed bottom-0 w-full">
          <div className="flex text-center w-full h-full">
            <div
              className=" text-white bg-black flex flex-col justify-around w-1/2 py-9"
              //onClick={clearBasket}
            >
              <div className="text-[40px] font-medium">
                {tr("take_it_myself")}
              </div>
            </div>
            <div
              className=" bg-greenPrimary text-white text-2xl  flex flex-col justify-around w-1/2 py-9"
              //onClick={() => checkRecommended()}
            >
              <div className="flex items-end mx-auto space-x-4">
                <div className="text-[40px] font-medium">{tr("confirm")}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

Locator.Layout = Layout;
export default Locator;
