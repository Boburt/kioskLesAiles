import React from "react";
import Link from "next/link";

function Footer() {
  return (
  <div>
    <div>
    </div>
      <div className="flex h-32 fixed bottom-0 w-full">
        <div className="flex text-center bg-teal-500 w-full h-full">
          <div className="text-2xl text-white bg-black px-60 py-12">Отменить</div>
          <div className="w-full bg-green-400 text-2xl py-12">К оплате</div>
        </div>
      </div>
  </div>
  );
}
export default Footer;
