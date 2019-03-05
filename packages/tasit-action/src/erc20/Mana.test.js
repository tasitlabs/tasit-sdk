import Mana from "./Mana";
import TasitContracts from "../../../tasit-contracts/dist";
const { local: localContracts } = TasitContracts;
const { MANAToken } = localContracts;
const { address: MANA_ADDRESS } = MANAToken;

describe("TasitAction.Decentraland.Mana", () => {
  it("should get the MANAToken name", async () => {
    const mana = new Mana(MANA_ADDRESS);
    const name = await mana.name();
    expect(name).to.equal("Decentraland MANA");
  });
});
