const winston = (info) => {
  //if(DEBUG) console.log("winston api: ", info);
  if (info.level === "debug") return;
  return fetch("/api/winston", {
    body: JSON.stringify(info),
    method: "POST",
  }).then((response) => {
    return response.json();
  });
};

const nonce = (account) => {
  return fetch("/api/nonce", {
    body: JSON.stringify({ account }),
    method: "POST",
  }).then((response) => {
    return response.json();
  });
};

const storage = () => {
  //if(DEBUG) console.log("storage api: ", info);
  return fetch("/api/storage", {
    body: JSON.stringify({}),
    method: "POST",
  }).then((response) => {
    return response.json();
  });
};

export default {
  winston: winston,
  storage: storage,
  nonce: nonce,
};
