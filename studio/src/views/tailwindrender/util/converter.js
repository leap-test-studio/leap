const SECONDS = 60;

export const convertMsToHM = (input = 0) => {
  let milliseconds = Number(String(input).substring(String(input).length - 3));
  let seconds = Math.floor(input / 1000);
  let minutes = Math.floor(seconds / SECONDS);
  let hours = Math.floor(minutes / SECONDS);

  seconds = seconds % SECONDS;
  minutes = seconds >= SECONDS ? minutes + 1 : minutes;
  minutes = minutes % SECONDS;
  hours = hours % 24;

  return {
    seconds,
    minutes,
    hours,
    milliseconds
  };
};

export const convertMsToHMString = (milliseconds = 0) => {
  const d = convertMsToHM(milliseconds);

  let str = "";
  if (d.hours > 0) {
    if (d.hours < 10) str += "0";
    str += d.hours + " hour ";
  }
  if (d.minutes > 0) {
    if (d.minutes < 10) str += "0";
    str += d.minutes + " min ";
  }
  if (d.seconds > 0) {
    if (d.seconds < 10) str += "0";
    str += d.seconds + " sec ";
  }
  if (d.milliseconds > 0) {
    if (d.milliseconds < 10) str += "0";
    str += d.milliseconds + " ms";
  }
  return str;
};
