import { fakeStore, fakeMessage } from "./../../../test/fakes";
import Chance from "chance";
import { fakeUser } from "../../../test/fakes";

describe("Store model", () => {
  const chance = new Chance();
  it("get changeable message details", () => {
    const message1 = fakeMessage({});

    var message1title = message1.title;
    expect(message1.title).toEqual(message1title);
  });

  it("change message details", () => {
    const message2 = fakeMessage({});

    message2.title = "aviv is here";
    expect(message2.title).toEqual("aviv is here");
  });
});
