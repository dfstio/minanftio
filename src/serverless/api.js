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

export default {
  winston: winston,
};
