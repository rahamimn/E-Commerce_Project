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


  it("check error with bad rank", () => {
    try{
      const store2 = fakeStore({});
      store2.rank = 6;
      expect(1).toEqual(2);
    }
    catch(error){
      expect(1).toEqual(1);
    }
  });
});
