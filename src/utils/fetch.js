const JSON_HEADERS = {
  Accept: 'application/json',
};
const PLAIN_HEADERS = {
  Accept: 'text/plain',
};

export const jsonPost = (url, body) =>
  fetch(url, { headers: JSON_HEADERS, method: 'POST', body: JSON.stringify(body) });

export const jsonFetch = async (url) => {
  const response = await fetch(url, { JSON_HEADERS });
  const json = await response.json();
  return json;
};

export const plainFetch = url =>
  fetch(url, { PLAIN_HEADERS });
