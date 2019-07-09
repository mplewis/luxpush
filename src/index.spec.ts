import {
  extractDigits,
  extractQRCodeURL,
  extract,
  validateBody,
  handler
} from "./index";
import { readFileSync } from "fs";
import { join } from "path";

const read = (path: string) => readFileSync(join(__dirname, path)).toString();

const bodyPlain = read("./spec/fixtures/body.txt");
const bodyHTML = read("./spec/fixtures/body.html");

describe("extractDigits", () => {
  it("extracts digits", () => {
    expect(extractDigits(bodyPlain)).toEqual("842851");
  });

  it("throws errors", () => {
    expect(() => extractDigits("invalid body")).toThrowError(
      "No digits extracted from plaintext body"
    );
  });
});

describe("extractQRCodeURL", () => {
  it("extracts the QR code URL", () => {
    expect(extractQRCodeURL(bodyHTML)).toEqual(
      "https://app.luxerone.com/deliveries/qrcode/12341234/52a863be86e619dab0301a62f3dbaca8a061c2f6"
    );
  });

  it("throws errors", () => {
    expect(() => extractQRCodeURL("<html>invalid body</html>")).toThrowError(
      "No QR code URL extracted from HTML body"
    );
  });
});

describe("extract", () => {
  it("extracts QR code URL and digits", () => {
    expect(extract(bodyPlain, bodyHTML)).toEqual({
      digits: "842851",
      qrCodeURL:
        "https://app.luxerone.com/deliveries/qrcode/12341234/52a863be86e619dab0301a62f3dbaca8a061c2f6"
    });
  });
});

describe("validateBody", () => {
  it("validates properly-structured payloads", () => {
    expect(
      validateBody({ body_plain: "123456", body_html: "<html></html>" })
    ).toEqual({ body_plain: "123456", body_html: "<html></html>" });
  });

  it("fails with malformed payloads", () => {
    expect(() =>
      validateBody({ body_plain: "123456" })
    ).toThrowErrorMatchingInlineSnapshot(
      `"child \\"body_html\\" fails because [\\"body_html\\" is required]"`
    );
  });
});
