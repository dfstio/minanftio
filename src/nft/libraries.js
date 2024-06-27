export async function loadLibraries() {
  const o1js = await import("o1js");
  const minanft = await import("minanft");
  return { o1js, minanft };
}
