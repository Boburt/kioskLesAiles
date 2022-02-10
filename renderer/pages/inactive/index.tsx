import { useCarousel } from "@webeetle/react-headless-hooks";
import { FC } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useRouter } from "next/router";

const Inactive: FC = () => {
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
  };
  const router = useRouter();
  const activeWork = () => {
    router.push("/home");
  };

  return (
    <div>
      <Slider {...settings}>
        <div onClick={activeWork}>
          <img src="/inactive/slide1.jpg" alt="" />
        </div>
        <div onClick={activeWork}>
          <img src="/inactive/slide2.jpg" alt="" />
        </div>
      </Slider>
    </div>
  );
};

export default Inactive;
