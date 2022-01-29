import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/solid";
import { useCarousel } from "@webeetle/react-headless-hooks";
import currency from "currency.js";
import { chunk } from "lodash";
import { useTranslation } from "next-export-i18n";
import { useRouter } from "next/router";
import { useMemo } from "react";
import ProductItemNew from "./ProductItemNew";
import ProductListSectionTitle from "./ProductListSectionTitle";

export default function ProductSection({
  sec,
  channelName,
}: {
  sec: any;
  channelName: string;
}) {
  const { t: tr } = useTranslation("common");
  const router = useRouter();

  const { locale } = router;

  const secMinPrice = useMemo(() => {
    let minPrice = 0;
    minPrice = Math.min(
      ...sec.items.map((store: any) => {
        let price: number = parseInt(store.price, 0) || 0;
        if (store.variants && store.variants.length > 0) {
          const activeValue: any = store.variants.find(
            (item: any) => item.active == true
          );
          if (activeValue) price += parseInt(activeValue.price, 0);
        }

        return price;
      })
    );
    return minPrice;
  }, [sec]);

  const secSlides = useMemo(() => {
    let res: any[] = [];
    res = chunk(sec.items, 12);

    return res;
  }, [sec]);

  const {
    currentSlide,
    goToSlide,
    triggerGoToPrevSlide,
    triggerGoToNextSlide,
  } = useCarousel({ maxSlide: secSlides.length, loop: false });

  return (
    <div key={`productSection_${sec.id}`} id={`productSection_${sec.id}`}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-end space-x-36">
          <ProductListSectionTitle
            title={sec?.attribute_data?.name[channelName][locale || "ru"]}
          />
          <div>
            {locale == "ru" && tr("price_from")}
            <span className="md:w-auto text-primary md:px-0 md:py-0 text-4xl font-serif font-medium">
              {currency(secMinPrice, {
                pattern: "# !",
                separator: " ",
                decimal: ".",
                symbol: `${locale == "uz" ? "" : ""}`,
                precision: 0,
              }).format()}
            </span>
            {locale == "uz" && tr("price_from")}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span
            className={`bg-greenPrimary p-3 rounded-l-3xl ${
              currentSlide == 1 ? "hidden" : ""
            }`}
            {...triggerGoToPrevSlide}
          >
            <ArrowLeftIcon className="w-14 h-14 text-white" />
          </span>
          <span
            className={`bg-greenPrimary p-3 rounded-r-3xl ${
              currentSlide == secSlides.length ? "hidden" : ""
            }`}
            {...triggerGoToNextSlide}
          >
            <ArrowRightIcon className="w-14 h-14 text-white" />
          </span>
        </div>
      </div>
      {secSlides.map((slide: any, index: number) => (
        <div
          key={`productSection_${sec.id}_${index}`}
          data-current-slide={currentSlide}
          className={`grid grid-cols-3 gap-3 ${
            index + 1 == currentSlide ? "" : "hidden"
          }`}
        >
          {slide.map((item: any) => (
            <ProductItemNew
              key={`productSection_${sec.id}_${index}_${item.id}`}
              product={item}
              channelName={channelName}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
