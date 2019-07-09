import * as Joi from "joi";
import axios, { AxiosResponse } from "axios";

type IncomingEmail = { body_plain: string; body_html: string };
type ExtractedData = { qrCodeURL: string; digits: string };

function pushbulletTokens(): string[] {
  const tokens = process.env.PUSHBULLET_TOKENS;
  if (!tokens)
    throw new Error("No Pushbullet tokens found in PUSHBULLET_TOKENS");
  return tokens.split(",");
}

export function validateBody(parsedBody: any): IncomingEmail {
  const schema = Joi.object().keys({
    body_plain: Joi.string().required(),
    body_html: Joi.string().required()
  });
  const result = schema.validate(parsedBody);
  if (result.error) throw result.error;
  return (parsedBody as any) as IncomingEmail;
}

export function extract(bodyPlain: string, bodyHTML: string): ExtractedData {
  const qrCodeURL = extractQRCodeURL(bodyHTML);
  const digits = extractDigits(bodyPlain);
  return { qrCodeURL, digits };
}

function extractFirstGroup(
  names: [string, string],
  body: string,
  re: RegExp
): string {
  const matches = body.match(re);
  if (!matches) throw new Error(`No ${names[0]} extracted from ${names[1]}`);
  const value = matches[1];
  if (!value) throw new Error("Capture group contained no data");
  return value;
}

export function extractDigits(bodyPlain: string): string {
  return extractFirstGroup(
    ["digits", "plaintext body"],
    bodyPlain,
    /enter the access code (\d+)/
  );
}

export function extractQRCodeURL(bodyHTML: string): string {
  return extractFirstGroup(
    ["QR code URL", "HTML body"],
    bodyHTML,
    /(https:\/\/app.luxerone.com\/deliveries\/qrcode\/[^"]+\/[^"]+)/
  );
}

async function pushToPushbullet(
  token: string,
  data: ExtractedData
): Promise<AxiosResponse> {
  const payload = {
    type: "link",
    title: `Luxer One package: ${data.digits}`,
    url: data.qrCodeURL
  };
  return axios.post("https://api.pushbullet.com/v2/pushes", payload, {
    headers: { "Access-Token": token }
  });
}

export async function handler(event: { body: string }) {
  const parsed = JSON.parse(event.body);
  const incoming = validateBody(parsed);
  const packageData = extract(incoming.body_plain, incoming.body_html);
  const results = await Promise.all(
    pushbulletTokens().map(token => pushToPushbullet(token, packageData))
  );
  console.log(results);
  return { statusCode: 204 };
}
