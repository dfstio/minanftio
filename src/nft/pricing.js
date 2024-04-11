import { vipnames } from "./vipnames";
import { isReservedName } from "./reservednames";

function nftPrice(name) {
  const username =
    name[0] === "@" ? name.substring(1).toLowerCase() : name.toLowerCase();
  if (isReservedName(username)) return "This name is reserved.";
  let category = 3;
  if (username.length <= 5) category = 2;
  if (username.length <= 3) category = 1;
  if (vipnames.includes(username)) category = 0;
  return prices[category].description + ": " + prices[category].price + " MINA";
}

const prices = [
  {
    price: 999,
    description: "Exclusive Avatar NFT name",
  },
  {
    price: 99,
    description: "Super Short Avatar NFT Name",
  },
  {
    price: 19,
    description: "Short Avatar NFT name",
  },
  {
    price: 10,
    description: "Avatar NFT name",
  },
];

export { nftPrice };
