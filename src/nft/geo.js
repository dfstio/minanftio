export async function checkGeo() {
  try {
    const token = process.env.REACT_APP_IPINFO_TOKEN;
    if (token === undefined)
      throw new Error("REACT_APP_IPINFO_TOKEN is not defined");
    const response = await fetch(`https://ipinfo.io?token=${token}`);
    if (!response.ok) return undefined;
    const result = await response.json();
    const isUS = result?.country === "US";
    console.log("IPINFO", isUS, result);
    return isUS;
  } catch (error) {
    return undefined;
  }
}
