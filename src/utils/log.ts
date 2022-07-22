export default function getLog() {
  const log = console.log;
  const myLog = function () {
    const date = new Date();
    const year = date.getFullYear()
    const [day, month, hours, minutes, seconds] = [
      date.getDate(),
      date.getMonth(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds()
    ].map(string =>
      string.toLocaleString("en-US", {
        minimumIntegerDigits: 2
      })
    );
    const LOG_PREFIX = `${day}.${month}.${year}/${hours}:${minutes}:${seconds}`;
    const args = Array.from(arguments);
    args.unshift(`[${LOG_PREFIX}]: `);
    if (Memory.log) {
      log.apply(console, args as []);
    }
  };
  return myLog
}
