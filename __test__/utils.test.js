import { serialize } from "../src/utils";

describe("serialize", () => {
  it("serializes objects with a single property", () => {
    expect(serialize({ a: 1 })).toEqual("a=1");
  });

  it("serializes objects with multiple properties", () => {
    expect(serialize({ a: 1, b: 2 })).toEqual("a=1&b=2");
  });

  it("serializes string properties", () => {
    expect(serialize({ a: "asdf123 bean pile" })).toEqual(
      "a=asdf123%20bean%20pile"
    );
  });
});
