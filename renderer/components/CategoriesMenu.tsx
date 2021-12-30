import { FC, memo, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { LinkItem } from "@commerce/types/headerMenu";
import Image from "next/image";
import { Link } from "react-scroll";
import dynamic from "next/dynamic";
import SimpleBar from "simplebar-react";

const CategoriesMenu: FC<{ categories: any[]; channelName: string }> = ({
  categories = [],
  channelName = "",
}) => {
  const { locale = "ru", pathname } = useRouter();

  const [fixed, changeState] = useState(false);

  const categoriesFixing = () => {
    window.pageYOffset > 700 ? changeState(true) : changeState(false);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("scroll", categoriesFixing);
    }
    return () => {
      window.removeEventListener("scroll", categoriesFixing);
    };
  }, []);

  return (
    <div className="mt-6 items-center space-y-3">
      {categories.map((item: any) => {
        return (
          <div className="text-black w-44 h-28" key={item.id}>
            <img src="/assets/img_cat_menu.png" className="mx-auto" />
            <Link
              to={`productSection_${item.id}`}
              spy={true}
              smooth={true}
              activeClass="text-primary rounded-lg"
              offset={-100}
              className=""
            >
              <div className="p-3 leading-4">
                {item?.attribute_data?.name[channelName][locale || "ru"]}
              </div>
            </Link>
          </div>
        );
      })}
    </div>
  );
};

export default memo(CategoriesMenu);
