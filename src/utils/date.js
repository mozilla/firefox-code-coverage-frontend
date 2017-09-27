const dateFromUnixTimestamp = (unixTimestamp) => {
  const date = new Date(unixTimestamp * 1000);
  return `${date.toLocaleString()}`;
};

export default dateFromUnixTimestamp;
