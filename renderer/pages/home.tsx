import React from "react";
import Head from "next/head";
import Link from "next/link";
import Prodcart from "../components/mainProductCart";
import Header from "../components/Header";

function Home() {
  return (
    <React.Fragment>
      <Header />
      <main className="grid grid-flow-row-dense grid-cols-6 bg-white text-black text-center">
        <div className="col-span-1 block space-y-10 pt-10">
          <div>Хиты1</div>
          <div>Сеты</div>
          <div>Лестеры</div>
          <div>Лонгеры</div>
          <div>Бургеры</div>
          <div>Курица</div>
          <div>Снеки</div>
          <div>Салаты</div>
          <div>Дисерты</div>
          <div>Напитки</div>
          <div>Соусы</div>
        </div>
        <div className="col-span-5">
          <Prodcart />
        </div>
      </main>
    </React.Fragment>
  );
}

export default Home;
