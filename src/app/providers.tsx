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
import { createConfig } from "@alchemy/aa-alchemy/config";
import { polygonAmoy } from "@alchemy/aa-core";

export const ChainContext = createContext<{
  chain: Chain;
  setChain: Dispatch<SetStateAction<Chain>>;
} | null>(null);

export const Providers = (props: PropsWithChildren) => {
  const [chain, setChain] = useState<Chain>(polygonAmoy);

  const queryClient = new QueryClient();
  const config = createConfig({
    rpcUrl: chain.id === polygonAmoy.id ? "/api/amoy/rpc" : "/api/sepolia/rpc",
    chain,
  });

  return (
    <Suspense>
      <QueryClientProvider client={queryClient}>
        <AlchemyAccountProvider config={config} queryClient={queryClient}>
          <ChainContext.Provider value={{ chain, setChain }}>
            {props.children}
          </ChainContext.Provider>
        </AlchemyAccountProvider>
      </QueryClientProvider>
    </Suspense>
  );
};
