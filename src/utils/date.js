export const dateFromUnixTimestamp = (unixTimestamp) => {
  const date = new Date(unixTimestamp * 1000);
  return `${date.toLocaleString()}`;
};

export const daysAgoDate = numberOfDays =>
  new Date((new Date()).getTime() - (numberOfDays * 24 * 60 * 60 * 1000))
    .toISOString().substring(0, 10);
