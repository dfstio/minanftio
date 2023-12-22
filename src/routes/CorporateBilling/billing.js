import { MinaNFT, api } from "minanft";

const { REACT_APP_JWT } = process.env;

export async function queryBilling(auth) {
  const JWT = auth === undefined || auth === "" ? REACT_APP_JWT : auth;
  const minanft = new api(JWT);
  const report = await minanft.queryBilling();
  return report;
}
