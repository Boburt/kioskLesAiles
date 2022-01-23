import React, { memo, FC } from "react";

type TitleProps = {
  title: string;
};

const ProductListSectionTitle: FC<TitleProps> = ({ title = "" }) => {
  return <h3 className="text-gray-800 text-6xl w-max font-serif">{title}</h3>;
};

export default memo(ProductListSectionTitle);
