import { CircleDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets';

const client = new CircleDeveloperControlledWalletsClient({
  apiKey: "dummy-api-key"
});

console.log("Methods on CircleDeveloperControlledWalletsClient instance:");
const methods = [];
let obj = client;
while (obj) {
  Object.getOwnPropertyNames(obj).forEach(prop => {
    if (typeof client[prop] === 'function' || typeof obj[prop] === 'object') {
      methods.push(prop);
    }
  });
  obj = Object.getPrototypeOf(obj);
}
console.log(Array.from(new Set(methods)));
