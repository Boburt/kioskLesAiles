import { FC, useState } from "react";

interface Props {
  onChange: (value: string) => void;
}

const NumPad: FC<Props> = ({ onChange }) => {
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
      setCurrentText(currentText + value);
      onChange(currentText + value);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-2 text-6xl">
      <div
        className="bg-gray-300 py-7 rounded-xl"
        onClick={() => handleClick("1")}
      >
        1
      </div>
      <div
        className="bg-gray-300 py-7 rounded-xl"
        onClick={() => handleClick("2")}
      >
        2
      </div>
      <div
        className="bg-gray-300 py-7 rounded-xl"
        onClick={() => handleClick("3")}
      >
        3
      </div>

      <div
        className="bg-gray-300 py-7 rounded-xl"
        onClick={() => handleClick("4")}
      >
        4
      </div>
      <div
        className="bg-gray-300 py-7 rounded-xl"
        onClick={() => handleClick("5")}
      >
        5
      </div>
      <div
        className="bg-gray-300 py-7 rounded-xl"
        onClick={() => handleClick("6")}
      >
        6
      </div>
      <div
        className="bg-gray-300 py-7 rounded-xl"
        onClick={() => handleClick("7")}
      >
        7
      </div>
      <div
        className="bg-gray-300 py-7 rounded-xl"
        onClick={() => handleClick("8")}
      >
        8
      </div>
      <div
        className="bg-gray-300 py-7 rounded-xl"
        onClick={() => handleClick("9")}
      >
        9
      </div>
      <div className="col-span-1">
        <div
          className="bg-gray-300 py-7 rounded-xl"
          onClick={() => handleClick("0")}
        >
          0
        </div>
      </div>
      <div className="col-span-2">
        <div
          className="bg-gray-300 py-7 rounded-xl"
          onClick={() => handleClick("clear")}
        >
          X
        </div>
      </div>
    </div>
  );
};

export default NumPad;
