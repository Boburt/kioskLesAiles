import React, { FC } from "react";
import NumberFormat from "react-number-format";

type Props = {
  phone: string;
};

const NumberFormatExample: FC<Props> = ({ phone }) => {
  return (
    <div>
      <NumberFormat
        thousandsGroupStyle="thousand"
        value={phone}
        prefix=""
        decimalSeparator=""
        displayType="text"
        type="text"
        thousandSeparator={false}
        allowNegative={true}
        format="+(###) ## ### ## ##"
      />
    </div>
  );
};
export default NumberFormatExample;
