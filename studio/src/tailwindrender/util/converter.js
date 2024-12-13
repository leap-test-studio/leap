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
    str += Number(d.hours) + " hour ";
  }
  if (d.minutes > 0) {
    str += Number(d.minutes) + " min ";
  }
  if (d.seconds > 0) {
    str += Number(d.seconds) + " sec ";
  }
  if (d.milliseconds > 0) {
    str += Number(d.milliseconds) + " ms";
  }
  return str;
};
