import { FC, useState } from "react";

interface Props {
  onChange: (value: string) => void;
  maxLength?: number;
}

const NumPad: FC<Props> = ({ onChange, maxLength = 30 }) => {
  const [currentText, setCurrentText] = useState("");

  const handleClick = (value: string) => {
    if (value === "C") {
      setCurrentText("");
    } else if (value === "=") {
      onChange(currentText);
    } else if (value == "slice") {
      setCurrentText(currentText.slice(0, -1));
      onChange(currentText.slice(0, -1));
    } else {
      if (currentText.length < maxLength) {
        setCurrentText(currentText + value);
        onChange(currentText + value);
      }
    }
  };

  return (
    <div className="grid grid-cols-3 gap-2 text-5xl">
      <div
        className="bg-gray-300 py-3 rounded-xl focus:bg-greenPrimary focus:text-white active:bg-greenPrimary active:text-white"
        onClick={() => handleClick("1")}
      >
        1
      </div>
      <div
        className="bg-gray-300 py-3 rounded-xl focus:bg-greenPrimary focus:text-white active:bg-greenPrimary active:text-white"
        onClick={() => handleClick("2")}
      >
        2
      </div>
      <div
        className="bg-gray-300 py-3 rounded-xl focus:bg-greenPrimary focus:text-white active:bg-greenPrimary active:text-white"
        onClick={() => handleClick("3")}
      >
        3
      </div>

      <div
        className="bg-gray-300 py-3 rounded-xl focus:bg-greenPrimary focus:text-white active:bg-greenPrimary active:text-white"
        onClick={() => handleClick("4")}
      >
        4
      </div>
      <div
        className="bg-gray-300 py-3 rounded-xl focus:bg-greenPrimary focus:text-white active:bg-greenPrimary active:text-white"
        onClick={() => handleClick("5")}
      >
        5
      </div>
      <div
        className="bg-gray-300 py-3 rounded-xl focus:bg-greenPrimary focus:text-white active:bg-greenPrimary active:text-white"
        onClick={() => handleClick("6")}
      >
        6
      </div>
      <div
        className="bg-gray-300 py-3 rounded-xl focus:bg-greenPrimary focus:text-white active:bg-greenPrimary active:text-white"
        onClick={() => handleClick("7")}
      >
        7
      </div>
      <div
        className="bg-gray-300 py-3 rounded-xl focus:bg-greenPrimary focus:text-white active:bg-greenPrimary active:text-white"
        onClick={() => handleClick("8")}
      >
        8
      </div>
      <div
        className="bg-gray-300 py-3 rounded-xl focus:bg-greenPrimary focus:text-white active:bg-greenPrimary active:text-white"
        onClick={() => handleClick("9")}
      >
        9
      </div>
      <div className="col-span-1">
        <div
          className="bg-gray-300 py-3 rounded-xl focus:bg-greenPrimary focus:text-white active:bg-greenPrimary active:text-white"
          onClick={() => handleClick("0")}
        >
          0
        </div>
      </div>
      <div className="col-span-2">
        <div
          className="bg-gray-300 py-3 rounded-xl focus:bg-greenPrimary focus:text-white active:bg-greenPrimary active:text-white"
          onClick={() => handleClick("slice")}
        >
          <span role="img" aria-label="backspace">
            ⌫
          </span>
        </div>
      </div>
    </div>
  );
};

export default NumPad;
