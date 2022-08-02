//@ts-ignore
import profiler from "./screeps-profiler";

let getLog = () => {
  const date = new Date();
  const year = date.getFullYear();
  const day = date.getDate();
  const month = date.getMonth();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  const localeString = [day, month, hours, minutes, seconds].map(string =>
    string.toLocaleString("en-US", { minimumIntegerDigits: 2 })
  );

  const [dayString, monthString, hoursString, minutesString, secondsString] =
    localeString;
  const LOG_PREFIX = `${dayString}.${monthString}.${year}/${hoursString}:${minutesString}:${secondsString}`;

  const log = console.log;
  let myLog = function () {
    const args = Array.from(arguments);
    args.unshift(`[${LOG_PREFIX}]: `);
    if (Memory.log) {
      log.apply(console, args as []);
    }
  };
  myLog = profiler ? profiler.registerFN(myLog, "myLog") : myLog
  return myLog;
};

getLog = profiler ? profiler.registerFN(getLog, "getLog") : getLog;
export default getLog;
