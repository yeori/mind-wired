export const uuid = (len: number = 16) => {
  let id = "";
  while (id.length < len) {
    id += Math.random().toString(36).substring(2);
  }
  return id.substring(0, len);
};
