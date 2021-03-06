import React from "react";
import { Ru, Uz, Us } from "react-flags-select";
import Link from "next/link";

import {
  useTranslation,
  useLanguageQuery,
  LanguageSwitcher,
} from "next-export-i18n";
import CurrentTime from "./ui/CurrentTime";

function Header() {
  return (
    <div className="flex text-center top-0 fixed w-full h-28">
      <nav className="flex items-center py-6 bg-primary w-full">
        <div className="flex items-center flex-shrink-0 text-white mx-6">
          <Link href={"/home"}>
            <img src="/assets/logo_for_header.png" />
          </Link>
        </div>
        <div className="flex ml-auto space-x-3 pr-10">
          <LanguageSwitcher lang="ru">
            <div className="flex items-center text-sm px-4 py-2 border rounded-xl text-black mt-4 lg:mt-0 bg-white space-x-2 w-20 h-10">
              <Ru className="w-4 h-4 rounded-full" />
              <span>Ру</span>
            </div>
          </LanguageSwitcher>
          <LanguageSwitcher lang="uz">
            <div className="flex items-center text-sm px-4 py-2 border rounded-xl text-black mt-4 lg:mt-0 bg-white space-x-2 w-20 h-10">
              <Uz className="w-4 h-4 rounded-full" />
              <span>Uz</span>
            </div>
          </LanguageSwitcher>

          <div className="flex items-center text-sm px-4 py-2 border rounded-xl text-black mt-4 lg:mt-0 bg-white space-x-2 w-20 h-10">
            <Us className="w-4 h-4 rounded-full" />
            <a href="#" className="">
              En
            </a>
          </div>
        </div>
      </nav>
      <div className="flex items-center">
        <div className="h-full font-sans text-2xl px-4 text-white bg-indigo-600 w-44 pt-6">
          Личный Кабинет
        </div>
        <CurrentTime />
      </div>
    </div>
  );
}
export default Header;
