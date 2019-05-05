import { fakeStore } from "./../../../test/fakes";
import Chance from "chance";
import { fakeUser } from "../../../test/fakes";

describe("Store model", () => {
  const chance = new Chance();
  it("get changeable store details", () => {
    const store1 = fakeStore({});

    var store_name = store1.name;
    expect(store1.name).toEqual(store_name);
  });

  it("chenge the name", () => {
    const store1 = fakeStore({});

    store1.name = "aviv the king";
    expect(store1.name).toEqual("aviv the king");
  });

  it("chenge the name", () => {
    const store1 = fakeStore({});

    store1.name = "aviv the king";
    expect(store1.name).toEqual("aviv the king");
  });

  it('get changeable user details', () => {
    const store = fakeStore({});

    expect(store.getStoreDetails()).toMatchObject({
      id: store.id,
      name: store.name,
      rank: store.rank,
    });
  });
});
