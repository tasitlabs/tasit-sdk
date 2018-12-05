import { Account } from "./index";
import { expect, assert } from "chai";

describe("Account", function() {
	it("should create a random wallet", async function() {
		let w = await Account.create();
		expect(w.address).to.have.lengthOf(42);
	});
});
