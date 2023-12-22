import { MinaNFT, api } from "minanft";

const { REACT_APP_JWT } = process.env;

export async function queryBilling(auth) {
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

  return report;
}
