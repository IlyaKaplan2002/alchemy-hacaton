"use client";

import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  Suspense,
  createContext,
  useState,
} from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AlchemyAccountProvider } from "@alchemy/aa-alchemy/react";
import { Chain } from "viem";
import { IUser } from "@/api/apiService";
import { WebAppProvider } from "@vkruglikov/react-telegram-web-app";
import { createConfig } from "@alchemy/aa-alchemy/config";
import { polygonAmoy } from "@alchemy/aa-core";

export interface IChainContext {
  chain: Chain;
  setChain: Dispatch<SetStateAction<Chain>>;
}

export const ChainContext = createContext<IChainContext | null>(null);

export interface IUserContext {
  user: IUser | null;
  setUser: Dispatch<SetStateAction<IUser | null>>;
}

export const UserContext = createContext<IUserContext | null>(null);

export const Providers = (props: PropsWithChildren) => {
  const [chain, setChain] = useState<Chain>(polygonAmoy);
  const [user, setUser] = useState<IUser | null>(null);

  const queryClient = new QueryClient();
  const config = createConfig({
    rpcUrl: chain.id === polygonAmoy.id ? "api/amoy/rpc" : "api/sepolia/rpc",
    chain,
  });

  const chainData = { chain, setChain };
  const userData = { user, setUser };

  return (
    <Suspense>
      <WebAppProvider>
        <QueryClientProvider client={queryClient}>
          <AlchemyAccountProvider config={config} queryClient={queryClient}>
            <ChainContext.Provider value={chainData}>
              <UserContext.Provider value={userData}>
                {props.children}
              </UserContext.Provider>
            </ChainContext.Provider>
          </AlchemyAccountProvider>
        </QueryClientProvider>
      </WebAppProvider>
    </Suspense>
  );
};
