import React, { FunctionComponent, useState, MutableRefObject } from "react";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";

interface IProps {
  onChange: (input: string) => void;
  keyboardRef: MutableRefObject<Keyboard>;
}

const KeyboardWrapper: FunctionComponent<IProps> = ({
  onChange,
  keyboardRef,
}) => {
  const [layoutName, setLayoutName] = useState("default");

  const onKeyPress = (button: string) => {
    if (button === "{shift}" || button === "{lock}") {
      setLayoutName(layoutName === "default" ? "shift" : "default");
    }
    if (button === "{russianShift}") {
      setLayoutName(layoutName === "russian" ? "russianShift" : "russian");
    }

    if (button === "{changeLayout}") {
      setLayoutName(layoutName === "default" ? "russian" : "default");
    }
  };

  return (
    <div className="text-black">
      <Keyboard
        keyboardRef={(r) => (keyboardRef.current = r)}
        layout={{
          default: [
            "1 2 3 4 5 6 7 8 9 0",
            "q w e r t y u i o p",
            "a s d f g h j k l @",
            "{shift} z x c v b n m {bksp}",
            "{changeLayout} . {space}",
          ],
          shift: [
            "1 2 3 4 5 6 7 8 9 0",
            "Q W E R T Y U I O P",
            "A S D F G H J K L @",
            "{shift} Z X C V B N M {bksp}",
            "{changeLayout} . {space}",
          ],
          russian: [
            "1 2 3 4 5 6 7 8 9 0",
            "й ц у к е н г ш щ з х ъ",
            "ф ы в а п р о л д ж э @",
            "{russianShift} я ч с м и т ь б ю {bksp}",
            "{changeLayout} . {space}",
          ],
          russianShift: [
            "1 2 3 4 5 6 7 8 9 0",
            "Й Ц У К Е Н Г Ш Щ З Х Ъ",
            "Ф Ы В А П Р О Л Д Ж Э @",
            "{russianShift} Я Ч С М И Т Ь Б Ю {bksp}",
            "{changeLayout} . {space}",
          ],
        }}
        display={{
          "{bksp}": "⌫",
          "{shift}": "⇧",
          "{russianShift}": "⇧",
          "{changeLayout}": "🌐",
          "{space}": "⎵",
        }}
        layoutName={layoutName}
        onChange={onChange}
        onKeyPress={onKeyPress}
        onRender={() => console.log("Rendered")}
      />
    </div>
  );
};

export default KeyboardWrapper;
