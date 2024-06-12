import { isAddress, isHexString, toUtf8String } from "ethers";

export function convertHexToUtf8(value: string) {
  if (isHexString(value)) {
    return toUtf8String(value);
  }

  return value;
}

export function getSignParamsMessage(params: string[]) {
  const message = params.filter((p) => !isAddress(p))[0];

  return convertHexToUtf8(message);
}

export function getSignTypedDataParamsData(params: string[]) {
  const data = params.filter((p) => !isAddress(p))[0];

  if (typeof data === "string") {
    return JSON.parse(data);
  }

  return data;
}
