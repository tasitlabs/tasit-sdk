import Mana from "./Mana";

import { local as localAddresses } from "../../../tasit-contracts/3rd-parties/decentraland/addresses";
const { MANAToken: MANA_ADDRESS } = localAddresses;

describe("TasitAction.Decentraland.Mana", () => {
  it("should get the MANAToken name", async function() {
    const mana = new Mana(MANA_ADDRESS);
    const name = await mana.name();
    expect(name).to.equal("Decentraland MANA");
  });
});
