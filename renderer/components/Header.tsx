import React from "react";

function Header() {
  return (
    <div className="flex justify-between text-center">
      <nav className="flex items-center justify-between flex-wrap bg-teal-500 p-6 bg-pink-700 w-5/6">
        <div className="flex items-center flex-shrink-0 text-white mr-6">
          <svg
            className="fill-current h-8 w-8 mr-2"
            width="54"
            height="54"
            viewBox="0 0 54 54"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M13.5 22.1c1.8-7.2 6.3-10.8 13.5-10.8 10.8 0 12.15 8.1 17.55 9.45 3.6.9 6.75-.45 9.45-4.05-1.8 7.2-6.3 10.8-13.5 10.8-10.8 0-12.15-8.1-17.55-9.45-3.6-.9-6.75.45-9.45 4.05zM0 38.3c1.8-7.2 6.3-10.8 13.5-10.8 10.8 0 12.15 8.1 17.55 9.45 3.6.9 6.75-.45 9.45-4.05-1.8 7.2-6.3 10.8-13.5 10.8-10.8 0-12.15-8.1-17.55-9.45-3.6-.9-6.75.45-9.45 4.05z" />
          </svg>
          <span className="font-semibold text-xl tracking-tight">
            LES AILES
          </span>
        </div>

        <div className="w-full block flex-grow lg:flex lg:items-center lg:w-auto space-x-3">
          <div>
            <a
              href="#"
              className="inline-block text-sm px-4 py-2 leading-none border rounded text-white border-white hover:border-transparent hover:text-teal-500 hover:bg-white mt-4 lg:mt-0"
            >
              Ру
            </a>
          </div>
          <div>
            <a
              href="#"
              className="inline-block text-sm px-4 py-2 leading-none border rounded text-white border-white hover:border-transparent hover:text-teal-500 hover:bg-white mt-4 lg:mt-0"
            >
              Uz
            </a>
          </div>
          <div>
            <a
              href="#"
              className="inline-block text-sm px-4 py-2 leading-none border rounded text-white border-white hover:border-transparent hover:text-teal-500 hover:bg-white mt-4 lg:mt-0"
            >
              En
            </a>
          </div>
        </div>
      </nav>
      <div className="flex w-1/6">
        <div>
          <div className="h-full text-sm px-4 text-white hover:border-transparent hover:text-teal-500 hover:bg-red bg-indigo-600 pt-4">
            <span>
              Личный <br /> Кабинет
            </span>
          </div>
        </div>
        <div className="pt-5 px-auto">
          <span className="h-max text-sm text-white hover:border-transparent hover:text-teal-500 mt-4 lg:mt-0 bg-black">
            19:15
          </span>
        </div>
      </div>
    </div>
  );
}
export default Header;
