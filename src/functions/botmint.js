const { lambda } = require("../serverless/botlambda");
const { REACT_APP_RELAY_KEY } = process.env;
const logger = require("../serverless/winston");
const log = logger.info.child({ winstonModule: "botmint" });

exports.handler = async (event, context) => {
    // check for POST
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 400,
            body: "You are not using a http POST method for this endpoint.",
            headers: { Allow: "POST" },
        };
    }

    try {
        // parse form data
        const body = JSON.parse(event.body);

        logger.initMeta();
        /*
        //logger.meta.frontendMeta = body.winstonMeta;
        logger.meta.frontendMeta.winstonHost = event.headers.host;
        logger.meta.frontendMeta.winstonIP = event.headers["x-bb-ip"];
        logger.meta.frontendMeta.winstonUserAgent = event.headers["user-agent"];
        logger.meta.frontendMeta.winstonBrowser = event.headers["sec-ch-ua"];
				*/

        if (body.key === undefined || body.key !== REACT_APP_RELAY_KEY) {
            log.error("Relay call: wrong key");
            return {
                statusCode: error.statusCode || 500,
                body: JSON.stringify({
                    message: "Relay call: wrong key",
                    success: false,
                }),
            };
        }

        const result = await lambda("mint", body.data);

        // return success
        await logger.flush();
        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                //data: result,
            }),
        };
    } catch (error) {
        // return error
        log.error("catch", { error, body: event.body });
        console.error("botmint catch", event.body, error);
        await logger.flush();
        return {
            statusCode: error.statusCode || 500,
            body: JSON.stringify({
                //message: error,
                success: false,
            }),
        };
    }
};
