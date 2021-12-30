import React from "react";
import Link from "next/link";

function Footer() {
  return (
    <div className="flex items-center w-full">
      <div className="flex text-center bg-teal-500 py-6 w-full">
        <div className="h-full text-2xl text-white bg-indigo-600">Отменить</div>
        <div className="h-full bg-black pt-6 text-2xl">К оплате</div>
      </div>
    </div>
  );
}
export default Footer;
