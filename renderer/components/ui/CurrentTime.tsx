import { memo, useEffect, useState } from "react";
import { DateTime } from "luxon";

const CurrentTime = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="w-44 h-full bg-black text-white pt-6 text-2xl">
      <div className="text-3xl">{DateTime.fromJSDate(time).toFormat("HH:mm")}</div>
      <div className="text-base">{DateTime.fromJSDate(time).toFormat("dd.MM.yyyy")}</div>
      
    </div>
  );
};

export default memo(CurrentTime);
