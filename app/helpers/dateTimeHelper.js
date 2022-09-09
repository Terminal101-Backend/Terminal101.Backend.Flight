module.exports.convertAvtraTimeToMinutes = time => {
  let timeArray = time.split(":").map(t => parseInt(t));
  while (timeArray.length < 3) {
    timeArray = [0, ...timeArray];
  }
  return timeArray[0] * 60 + timeArray[1];
};

module.exports.convertAmadeusTime = time => {
  const reH = /^PT(?:(\d+)H)?/.exec(time);
  const reM = /(?:(\d+)M)?$/.exec(time);
  return parseInt(reH[1] ?? 0) * 60 + parseInt(reM[1] ?? 0);
};

module.exports.excludeDateFromIsoString = isoString => {
  const re = /(\d+-\d+-\d+)T(\d+:\d+:\d+)(?:\.\d+Z)?/;
  const reTest = re.exec(isoString);
  return reTest ? reTest[1] : undefined;
};

module.exports.excludeTimeFromIsoString = isoString => {
  const re = /(\d+-\d+-\d+)T(\d+:\d+:\d+)(?:\.\d+Z)?/;
  const reTest = re.exec(isoString);
  return reTest ? reTest[2] : undefined;
};

module.exports.getMinutesFromIsoString = isoString => {
  const date = new Date(isoString);
  return date.getHours() * 60 + date.getMinutes();
};