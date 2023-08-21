const logger = require("../serverless/winston");
const logm = logger.info.child({ winstonModule: "functionsLambdaBot" });
const axios = require("axios");

const { BOTAPIAUTH, BOTAPIURL } = process.env;

async function lambda(command, data) {
    const lambdaData = {
        auth: BOTAPIAUTH,
        command,
        data,
    };
    console.log("functionsLambdaBot command", command, data);

    try {
        const response = await axios.post(`${BOTAPIURL}`, JSON.stringify(lambdaData));
        //console.log("functionsLambdaBot result", data, response);
        return { response: response, success: true };
    } catch (error) {
        logm.error("catch", { error, data });
        console.error("catch functionsLambdaBot", data, error);
        return { error, success: false };
    }
}

module.exports = {
    lambda,
};
