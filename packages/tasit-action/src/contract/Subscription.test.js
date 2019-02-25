import Subscription from "./Subscription";

describe("returns the correct subscribed events", () => {
  
  it("returns empty array if no subscribed events", () => {
    sampleSubscription = new Subscription();
    assert.equal(sampleSubscription.subscribedEventNames(), []);
  });

  it("returns array with one subscribed event", () => {
    sampleSubscription = new Subscription();
    sampleSubscription._addEventListener("start", 68);
    assert.equal(sampleSubscription.subscribedEventNames(), ["start"]);
  });

  it("returns array with multiple subscribed events", () => {
    sampleSubscription = new Subscription();
    sampleSubscription._addEventListener("start", 68);
    sampleSubscription._addEventListener("construction", 57);
    sampleSubscription._addEventListener("build", 42);
    assert.equal(sampleSubscription.subscribedEventNames(), ["start", "construction", "build"]);
  });

  it("returns correct array after unsubscribing from events", () => {
    sampleSubscription = new Subscription();
    sampleSubscription._addEventListener("start", 68);
    sampleSubscription._addEventListener("construction", 57);
    sampleSubscription._addEventListener("build", 42);
    sampleSubscription.off("build");
    assert.equal(sampleSubscription.subscribedEventNames(), ["start", "construction"]);
  });
});
