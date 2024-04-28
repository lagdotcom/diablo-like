declare module "*.png" {
  const url: import("./flavours").ResourceURL;
  export default url;
}
