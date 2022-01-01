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
    <div className="w-44 h-full bg-black pt-6 text-2xl">
      {DateTime.fromJSDate(time).toFormat("HH:mm dd.MM.yyyy")}
    </div>
  );
};

export default memo(CurrentTime);
