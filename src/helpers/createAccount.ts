import {
  AlchemySmartAccountClient,
  AlchemySmartAccountClientConfig,
  ClientWithAlchemyMethods,
  alchemyActions,
  alchemyFeeEstimator,
  alchemyGasManagerMiddleware,
  alchemyUserOperationSimulator,
} from "@alchemy/aa-alchemy";
import { Chain, Transport, http } from "viem";
import {
  LocalAccountSigner,
  SmartContractAccount,
  SmartContractAccountWithSigner,
  UserOperationContext,
  createSmartAccountClientFromExisting,
  getDefaultUserOperationFeeOptions,
  isSmartAccountWithSigner,
} from "@alchemy/aa-core";
import {
  accountLoupeActions,
  createMultiOwnerModularAccount,
  multiOwnerPluginActions,
  pluginManagerActions,
} from "@alchemy/aa-accounts";
import { english, generateMnemonic } from "viem/accounts";

import { polygonAmoy } from "viem/chains";

export const createMnemonic = () => {
  return generateMnemonic(english);
};

export const createClient = async ({
  mnemonic,
  bundlerClient,
  accountAddress,
  chain,
  useGasManager,
}: {
  mnemonic: string;
  bundlerClient: ClientWithAlchemyMethods;
  chain: Chain;
  accountAddress?: `0x${string}`;
  useGasManager?: boolean;
}) => {
  const rpcTransport = http(
    chain.id === polygonAmoy.id ? "/api/amoy/rpc" : "/ap/sepolia/rpc",
  );

  const signer = LocalAccountSigner.mnemonicToAccountSigner(mnemonic);

  const config: CreateAlchemySmartAccountClientFromRpcClient = useGasManager
    ? {
        opts: {
          txMaxRetries: 20,
        },
        gasManagerConfig: {
          policyId:
            chain.id === polygonAmoy.id
              ? (process.env
                  .NEXT_PUBLIC_AMOY_ALCHEMY_GAS_MANAGER_POLICY_ID as string)
              : (process.env
                  .NEXT_PUBLIC_SEPOLIA_ALCHEMY_GAS_MANAGER_POLICY_ID as string),
        },
        account: await createMultiOwnerModularAccount({
          transport: rpcTransport,
          chain,
          signer,
          accountAddress,
        }),
        client: bundlerClient,
      }
    : {
        opts: {
          txMaxRetries: 20,
        },
        account: await createMultiOwnerModularAccount({
          transport: rpcTransport,
          chain,
          signer,
          accountAddress,
        }),
        client: bundlerClient,
      };

  console.log(config);

  const client = createAlchemySmartAccountClientFromRpcClient(config);

  if (!client.account) return null;

  localStorage.setItem("accountAddress", client.account.address);

  return client
    .extend(multiOwnerPluginActions)
    .extend(pluginManagerActions)
    .extend(accountLoupeActions);
};

export type CreateAlchemySmartAccountClientFromRpcClient<
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  TContext extends UserOperationContext | undefined =
    | UserOperationContext
    | undefined,
> = Omit<
  AlchemySmartAccountClientConfig<Transport, Chain, TAccount, TContext>,
  "rpcUrl" | "chain" | "apiKey" | "jwt"
> & { client: ClientWithAlchemyMethods };

export function getSignerTypeHeader<
  TAccount extends SmartContractAccountWithSigner,
>(account: TAccount) {
  return { "Alchemy-Aa-Sdk-Signer": account.getSigner().signerType };
}

export function createAlchemySmartAccountClientFromRpcClient({
  opts,
  account,
  useSimulation,
  gasManagerConfig,
  feeEstimator,
  gasEstimator,
  customMiddleware,
  signUserOperation,
  client,
}: CreateAlchemySmartAccountClientFromRpcClient): AlchemySmartAccountClient {
  const feeOptions =
    opts?.feeOptions ?? getDefaultUserOperationFeeOptions(client.chain);

  const scaClient = createSmartAccountClientFromExisting({
    account,
    client,
    type: "AlchemySmartAccountClient",
    opts: {
      ...opts,
      feeOptions,
    },
    customMiddleware: async (struct, args) => {
      if (isSmartAccountWithSigner(args.account)) {
        client.updateHeaders(getSignerTypeHeader(args.account));
      }

      return customMiddleware ? customMiddleware(struct, args) : struct;
    },
    feeEstimator: feeEstimator ?? alchemyFeeEstimator(client),
    userOperationSimulator: useSimulation
      ? alchemyUserOperationSimulator(client)
      : undefined,
    gasEstimator,
    ...(gasManagerConfig &&
      alchemyGasManagerMiddleware(client, {
        ...gasManagerConfig,
        gasEstimationOptions: {
          ...gasManagerConfig.gasEstimationOptions,
          disableGasEstimation:
            gasManagerConfig.gasEstimationOptions?.disableGasEstimation ??
            false,
          fallbackFeeDataGetter:
            gasManagerConfig.gasEstimationOptions?.fallbackFeeDataGetter ??
            feeEstimator,
          fallbackGasEstimator:
            gasManagerConfig.gasEstimationOptions?.fallbackGasEstimator ??
            gasEstimator,
        },
      })),
    signUserOperation,
  }).extend(alchemyActions);

  if (account && isSmartAccountWithSigner(account)) {
    client.updateHeaders(getSignerTypeHeader(account));
  }

  return scaClient;
}
