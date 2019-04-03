import { fakeStore, fakeReview } from "./../../../test/fakes";
import Chance from "chance";
import { fakeUser } from "../../../test/fakes";

describe("Store model", () => {
  const chance = new Chance();
  it("get changeable review details", () => {
    const review1 = fakeReview({});

    var review_date = review1.date;
    expect(review1.date).toEqual(review_date);
  });

  it("change review details", () => {
    const review1 = fakeReview({});

    review1.rank = 5;
    expect(review1.rank).toEqual(5);
  });
});
