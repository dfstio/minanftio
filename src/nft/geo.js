import geoip from "geoip-country";

export async function checkGeo(ip) {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    if (!response.ok) return undefined;
    const data = await response.json();
    const geo = geoip.lookup(data.ip);
    if (geo?.country === "US") {
      return true;
    } else return false;
  } catch (error) {
    console.error(`checkGeo Error`, error);
    return undefined;
  }
}
