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
import { WebAppProvider } from "@vkruglikov/react-telegram-web-app";
import { createConfig } from "@alchemy/aa-alchemy/config";
import { polygon } from "@alchemy/aa-core";

export const ChainContext = createContext<{
  chain: Chain;
  setChain: Dispatch<SetStateAction<Chain>>;
} | null>(null);

export const Providers = (props: PropsWithChildren) => {
  const [chain, setChain] = useState<Chain>(polygon);

  const queryClient = new QueryClient();
  const config = createConfig({
    rpcUrl: chain.id === polygon.id ? "/api/polygon/rpc" : "/api/arbitrum/rpc",
    chain,
  });

  return (
    <Suspense>
      <WebAppProvider>
        <QueryClientProvider client={queryClient}>
          <AlchemyAccountProvider config={config} queryClient={queryClient}>
            <ChainContext.Provider value={{ chain, setChain }}>
              {props.children}
            </ChainContext.Provider>
          </AlchemyAccountProvider>
        </QueryClientProvider>
      </WebAppProvider>
    </Suspense>
  );
};
