import Action from "./Action";
import Subscription from "./Subscription";

describe("subscribing to an event before sending tx", () => {

    it("gives error if no subscribed events", () => {
        if(this.subscribedEventNames() === []){
            assert.ifError(this.on("confirmation", () => {}));
        }
    });

});