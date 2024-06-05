import axios, { AxiosResponse } from "axios";

import { InitDataUnsafe } from "@vkruglikov/react-telegram-web-app";
import { axiosInstance } from "./axios.instance";

export interface IRequest<T = undefined> {
  telegramData: {
    initData: string;
    initDataUnsafe: InitDataUnsafe;
  };
  data: T;
}

export interface IDevice {
  id: number;
  publicKey: `0x${string}`;
  deviceName: string;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUser {
  id: number;
  tgId: number;
  devices: IDevice[];
  accountAddress: `0x${string}`;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGetUserDto {
  publicKey: string;
  deviceName: string;
  accountAddress?: string;
}

export const getUsersMany = async (
  data: IRequest,
): Promise<AxiosResponse<IUser[]>> => {
  return axiosInstance.post("/user/get-many", data);
};

export const getUser = async (
  data: IRequest<IGetUserDto>,
): Promise<AxiosResponse<IUser>> => {
  return axiosInstance.post("/user/get", data);
};

export const createUser = async (
  data: IRequest<IGetUserDto>,
): Promise<AxiosResponse<IUser>> => {
  return axiosInstance.post("/user/create", data);
};

export const addDevice = async (
  data: IRequest<IGetUserDto>,
): Promise<AxiosResponse<IUser>> => {
  return axiosInstance.post("/user/add-device", data);
};

export const deleteDevice = async (
  data: IRequest<IGetUserDto>,
): Promise<AxiosResponse<IUser>> => {
  return axiosInstance.post("/user/delete-device", data);
};

export const deleteUser = async (
  data: IRequest<IGetUserDto>,
): Promise<AxiosResponse<IUser>> => {
  return axiosInstance.post("/user/delete", data);
};

export const getCountry = async (): Promise<
  AxiosResponse<{
    country: string;
  }>
> => {
  return axios.get("https://api.country.is");
};
