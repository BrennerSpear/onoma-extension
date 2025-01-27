import { JSDOM } from "jsdom";
import { findFullAddress } from "../utils/dom";

// Mock the chrome API
global.chrome = {
  storage: {
    sync: {
      get: jest.fn(),
    },
  },
} as any;

describe("findFullAddress", () => {
  let dom: JSDOM;

  beforeEach(() => {
    dom = new JSDOM("<!DOCTYPE html><div></div>");
    (global as any).document = dom.window.document;
  });

  test("finds address in title attribute", () => {
    const element = document.createElement("div");
    const address = "0x123456789abcdef123456789abcdef123456789a";
    element.setAttribute("title", address);

    const result = findFullAddress(element);
    expect(result).toBe(address);
  });

  test("finds address in data attribute", () => {
    const element = document.createElement("div");
    const address = "0x123456789abcdef123456789abcdef123456789a";
    element.setAttribute("data-address", address);

    const result = findFullAddress(element);
    expect(result).toBe(address);
  });

  test("returns null for invalid address", () => {
    const element = document.createElement("div");
    element.setAttribute("title", "not an address");

    const result = findFullAddress(element);
    expect(result).toBeNull();
  });
});
