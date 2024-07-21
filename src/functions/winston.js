const WinstonCloudWatch = require("winston-cloudwatch");
const logger = require("../serverless/winston");
const log = logger.info.child({ winstonModule: "winston" });

const {
  WINSTON_ID,
  WINSTON_KEY,
  WINSTON_NAME,
  WINSTON_REGION,
  WINSTON_CHAIN_ID,
} = process.env;

function formatWinstonTime(ms) {
  if (ms === undefined) return "";
  if (ms < 1000) return ms + " ms";
  if (ms < 60 * 1000) return parseInt(ms / 1000) + " sec";
  if (ms < 60 * 60 * 1000) return parseInt(ms / 1000 / 60) + " min";
  return parseInt(ms / 1000 / 60 / 60) + " h";
}

exports.handler = async (event, context) => {
  // check for POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 400,
      body: "You are not using a http POST method for this endpoint.",
      headers: { Allow: "POST" },
    };
  }

  console.log("Winston: started", event);

  try {
    // parse form data
    let ipAddress = "";

    // Try different headers to get the IP address
    if (event.headers["x-forwarded-for"]) {
      ipAddress = event.headers["x-forwarded-for"].split(",")[0].trim();
    } else if (event.headers["x-real-ip"]) {
      ipAddress = event.headers["x-real-ip"];
    } else if (event.requestContext && event.requestContext.identity) {
      ipAddress = event.requestContext.identity.sourceIp;
    } else {
      ipAddress = event.headers["x-bb-ip"] || "IP not found";
    }

    let body = JSON.parse(event.body);
    logger.initMeta();
    const wTimer =
      body.winstonFrontendMeta &&
      body.winstonFrontendMeta.startTime &&
      Date.now() - body.winstonFrontendMeta.startTime;
    body.winstonChainId = WINSTON_CHAIN_ID;
    body.winstonLevel = "info";
    body.winstonRepo = "frontend";
    body.winstonHost = event.headers.host;
    body.winstonIP = ipAddress ?? "IP not found";
    body.winstonUserAgent = event.headers["user-agent"];
    body.winstonBrowser = event.headers["sec-ch-ua"];
    body.winstonTimer = wTimer;
    body.winstonTimerText = formatWinstonTime(wTimer);
    body.winstonMessageTime = new Date().toISOString().replace(/T/, " ");
    const cloudwatchConfig = {
      level: "info",
      logGroupName: WINSTON_NAME,
      logStreamName: WINSTON_CHAIN_ID,
      awsOptions: {
        credentials: {
          accessKeyId: WINSTON_ID,
          secretAccessKey: WINSTON_KEY,
        },
        region: WINSTON_REGION,
      },
      jsonMessage: true,
      //messageFormatter: ({ level, message, additionalInfo }) =>    `[${level}] : ${message} \nAdditional Info: ${JSON.stringify(additionalInfo)}}`
    };
    //console.log("Winston", body, "cloudwatchConfig", cloudwatchConfig);
    //const result = await lambda("winston", body);
    //console.log("Result", result);

    const transport = new WinstonCloudWatch(cloudwatchConfig);
    function myfunc(args) {}
    transport.log(body, myfunc);
    //log.info("winston test", {cloudwatchConfig, body});
    await new Promise((resolve) => {
      transport.kthxbye(resolve);
    });

    await logger.flush();

    //console.log("Winston: finished");

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
      }),
    };
  } catch (error) {
    // return error
    log.error("catch", { error, body: event.body });
    await logger.flush();
    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({
        message: error,
        success: false,
      }),
    };
  }
};
