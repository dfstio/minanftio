const logger = require("../serverless/winston");
const logm = logger.info.child({ winstonModule: "functionsLambdaBot" });
const axios = require("axios");

const { BOTAPIAUTH, BOTAPIURL } = process.env;

async function lambda(command, body) {
    const data = {
        auth: BOTAPIAUTH,
        command,
        data: body,
    };
    console.log("lambda", command, body);

    try {
        const response = await axios.post(`${BOTAPIURL}`, data);
        return { response: response, success: true };
    } catch (error) {
        logm.error("catch", { error, data });
        return { error, success: false };
    }
}

module.exports = {
    lambda,
};