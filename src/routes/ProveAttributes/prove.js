import { MinaNFT, api } from "minanft";

const { REACT_APP_JWT } = process.env;

export function prepareTable(token) {
  const strings = [];

  function iterateProperties(properties, level = 0) {
    for (const key in properties) {
      console.log(`key:`, key, properties[key]);

      switch (properties[key].kind) {
        case "string":
          strings.push({
            key: key,
            value: properties[key].data,
            status: properties[key].isPrivate === "true" ? "private" : "public",
            id: strings.length,
          });
          break;

        default:
          break;
      }
    }
  }
  try {
    iterateProperties(token.properties);
  } catch (error) {
    console.error(`Error: ${error}`);
  }

  return strings;
}

export async function prove(auth) {
  console.log("queryBilling start", auth);
  const JWT = auth === undefined || auth === "" ? REACT_APP_JWT : auth;
  const minanft = new api(JWT);
  const report = await minanft.queryBilling();
  console.log("queryBilling result", report);

  /*
billedDuration
: 
141818
developer
: 
"@dfst"
id
: 
"6459034946"
jobId
: 
"6459034946.1703085063711.s1ejoc02ff4e19vfb5s6wyp25mm1615x"
jobName
: 
"mint"
jobStatus
: 
"used"
task
: 
"mint"
timeCreated
: 
1703085063711
timeFinished
: 
1703085208743
  */

  if (report.success === false) return report;
  let total = 0;
  let minted = 0;
  const table = report.result.map((row) => {
    let duration = 0;
    if (row.timeFinished !== undefined && row.timeCreated !== undefined)
      duration = row.timeFinished - row.timeCreated;
    total += row.billedDuration ?? 0;
    const billedDuration = row.billedDuration
      ? row.billedDuration.toLocaleString()
      : "0";
    if (row.task === "mint" && row.timeFinished !== undefined) minted++;
    return {
      key: row.jobId,
      id: row.id,
      jobId: row.jobId,
      jobName: row.jobName,
      jobStatus: row.jobStatus,
      task: row.task,
      developer: row.developer,
      billedDuration,
      timeCreated: row.timeCreated,
      timeFinished: row.timeFinished,
      created: new Date(row.timeCreated).toLocaleString(),
      duration: duration.toLocaleString(),
    };
  });
  return { table, total, minted, ...report };
}
