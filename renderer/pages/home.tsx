import React from "react";
import Head from "next/head";
import Link from "next/link";
import Prodcart from "../components/mainProductCart";
import { Ru, Uz, Us } from "react-flags-select";

function Home() {
  return (
    <>
      <div className=" bg-primary grid grid-flow-row auto-rows-max font-serif">
        <div className="flex ml-auto space-x-3 pt-10 pr-10">
          <div className="flex items-center text-sm px-4 py-2 leading-none border rounded-xl text-black border-white hover:border-transparent hover:text-teal-500 hover:bg-gray-500 mt-4 lg:mt-0 bg-white space-x-2">
            <Ru className="w-4 h-4 rounded-full" />
            <a href="#" className="">
              Ру
            </a>
          </div>
          <div className="flex items-center text-sm px-4 py-2 leading-none border rounded-xl text-black border-white hover:border-transparent hover:text-teal-500 hover:bg-gray-500 mt-4 lg:mt-0 bg-white space-x-2">
            <Uz className="w-4 h-4 rounded-full" />
            <a href="#" className="">
              Uz
            </a>
          </div>
          <div className="flex items-center text-sm px-4 py-2 leading-none border rounded-xl text-black border-white hover:border-transparent hover:text-teal-500 hover:bg-gray-500 mt-4 lg:mt-0 bg-white space-x-2">
            <Us className="w-4 h-4 rounded-full" />
            <a href="#" className="">
              En
            </a>
          </div>
        </div>

        <div className="mx-auto mt-52">
          <img src="/assets/home_big_logo.png" />
        </div>
        <div className="pt-48">
          <h2 className="uppercase text-6xl text-center">
            выберите способ <br /> где вы хотите поесть
          </h2>
        </div>
        <div className="flex m-auto mt-20 space-x-10 mb-20">
          <Link href={"/menu"}>
            <div className="items-center p-14 w-80 flex flex-col text-center rounded-3xl text-black bg-white">
              <img src="/restaurant.png" className="mt-8" />
              <div className="text-5xl mt-10">В зале</div>
            </div>
          </Link>
          <Link href={"/menu"}>
            <div className="items-center p-14 w-80 flex flex-col text-center rounded-3xl text-black bg-white">
              <img src="/takeaway.png" className="mt-8" />
              <div className="text-5xl mt-10">С собой</div>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}

export default Home;
