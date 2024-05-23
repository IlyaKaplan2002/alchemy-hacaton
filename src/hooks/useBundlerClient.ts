"use client";

import { ClientWithAlchemyMethods } from "@alchemy/aa-alchemy";
import { useAlchemyAccountContext } from "@alchemy/aa-alchemy/react";
import { useSyncExternalStore } from "react";
import { watchBundlerClient } from "@alchemy/aa-alchemy/config";

export type UseBundlerClientResult = ClientWithAlchemyMethods;

export const useBundlerClient = () => {
  const { config } = useAlchemyAccountContext();

  return useSyncExternalStore(
    watchBundlerClient(config),
    () => config.bundlerClient,
    () => config.bundlerClient,
  );
};
