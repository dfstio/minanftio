import { vipnames } from "./vipnames";
import { reservedNames } from "./reservednames";

export function nftPrice(name) {
  const username =
    name[0] === "@" ? name.substring(1).toLowerCase() : name.toLowerCase();
  if (reservedNames.includes(username)) return "This name is reserved.";
  let category = 3;
  if (username.length <= 5) category = 2;
  if (username.length <= 3) category = 1;
  if (vipnames.includes(username)) category = 0;
  return {
    description: prices[category].description,
    price: prices[category].price,
    currency: "MINA",
  };
}

const prices = [
  {
    price: 999,
    description: "Exclusive NFT name",
  },
  {
    price: 99,
    description: "Super Short NFT Name",
  },
  {
    price: 19,
    description: "Short NFT name",
  },
  {
    price: 10,
    description: "Standard NFT name",
  },
];
