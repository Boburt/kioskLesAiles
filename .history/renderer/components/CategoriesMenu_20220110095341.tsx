import { FC, memo, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { LinkItem } from "@commerce/types/headerMenu";
import Image from "next/image";
import { Link } from "react-scroll";
import dynamic from "next/dynamic";
import SimpleBar from "simplebar-react";
import { useSelectedLanguage } from "next-export-i18n";
import { useUI } from "@components/ui/context";

const CategoriesMenu: FC<{ categories: any[]; channelName: string }> = ({
  categories = [],
  channelName = "",
}) => {
  const { lang: locale } = useSelectedLanguage();
  const { categoryId, setCategoryId } = useUI();

  return (
    <div className="text-center items-center space-y-3">
      {categories.map((item: any) => {
        return (
          <div
            className={`text-black w-44 h-28 cursor-pointer rounded-r-2xl ${categoryId == item.id ? 'bg-primary' : ''}`}
            key={item.id}
            onClick={() => setCategoryId(item.id)}
          >
            <img src="/assets/img_cat_menu.png" className="mx-auto pt-1" />
            <div className={`p-3 leading-4 text-2xl ${categoryId == item.id ? 'text-white' : ''}`}>
              {item?.attribute_data?.name[channelName][locale || "ru"]}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default memo(CategoriesMenu);
