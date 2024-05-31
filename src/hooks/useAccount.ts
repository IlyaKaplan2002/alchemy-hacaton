"use client";

import { ChainContext, UserContext } from "@/app/providers";
import { IUser, createUser, getUser } from "@/api/apiService";
import { LocalAccountSigner, SmartAccountClient } from "@alchemy/aa-core";
import { createClient, createMnemonic } from "@/helpers/createAccount";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";

import { UAParser } from "ua-parser-js";
import { multiOwnerPluginActions } from "@alchemy/aa-accounts";
import { polygonAmoy } from "viem/chains";
import { useBundlerClient } from "@alchemy/aa-alchemy/react";
import { useInitData } from "@vkruglikov/react-telegram-web-app";
import { useWhyDidYouUpdate } from "ahooks";

interface Props {
  useGasManager: boolean;
}

export const useAccount = ({ useGasManager }: Props) => {
  const [isLoading, setIsLoading] = useState(true);
  const [client, setClient] = useState<SmartAccountClient | null>(null);
  const [owners, setOwners] = useState<`0x${string}`[]>([]);
  const [isOwner, setIsOwner] = useState(false);

  const [initDataUnsafe, initData] = useInitData();

  const bundlerClient = useBundlerClient();

  useEffect(() => {
    setIsOwner(
      owners.includes(localStorage.getItem("accountOwner") as `0x${string}`) ||
        localStorage.getItem("isOwner") === "true",
    );
  }, [owners]);

  const chainData = useContext(ChainContext);
  const userData = useContext(UserContext);

  const chain = chainData?.chain || polygonAmoy;
  const setUser = useCallback(
    (user: IUser) => {
      if (userData) {
        userData.setUser(user);
      }
    },
    [userData],
  );

  const login = useCallback(async () => {
    setIsLoading(true);

    const mnemonic = localStorage.getItem("mnemonic");

    const accountAddress = localStorage.getItem("accountAddress");
    if (mnemonic) {
      if (!localStorage.getItem("accountOwner")) {
        const signer = LocalAccountSigner.mnemonicToAccountSigner(mnemonic);

        const address = await signer.getAddress();

        localStorage.setItem("accountOwner", address);
      }

      const client = await createClient({
        mnemonic,
        bundlerClient,
        chain,
        accountAddress: (accountAddress as `0x${string}`) || undefined,
        useGasManager,
      });

      if (initData && initDataUnsafe && client?.account?.address) {
        const parser = new UAParser();
        const result = parser.getResult();

        try {
          const { data: user } = await getUser({
            telegramData: {
              initData,
              initDataUnsafe,
            },
            data: {
              publicKey: localStorage.getItem("accountOwner") as `0x${string}`,
              accountAddress: client.account.address,
              deviceName: `${result.device.vendor} ${result.device.model}`,
            },
          });

          setUser(user);
        } catch (error) {
          console.log(error);
        }
      }

      setClient(client);
    }

    setIsLoading(false);
  }, [bundlerClient, chain, useGasManager]);

  useWhyDidYouUpdate("useAccount", {
    bundlerClient,
    chain,
    initData,
    initDataUnsafe,
    setUser,
    useGasManager,
  });

  const importAccount = useCallback(async (accountAddress: `0x${string}`) => {
    const { mnemonic, address } = await createMnemonic();

    localStorage.setItem("accountAddress", accountAddress);
    localStorage.setItem("mnemonic", mnemonic);
    localStorage.setItem("accountOwner", address);

    return { address, mnemonic };
  }, []);

  useEffect(() => {
    login();
  }, [login]);

  const getOwners = useCallback(async () => {
    if (client) {
      const pluginActionExtendedClient = client.extend(multiOwnerPluginActions);

      if (!pluginActionExtendedClient || !client.account) {
        return;
      }

      const owners = await pluginActionExtendedClient.readOwners({
        account: client.account,
      });

      setOwners(owners as `0x${string}`[]);
    }
  }, [client]);

  useEffect(() => {
    getOwners();
  }, [getOwners]);

  const signup = useCallback(async () => {
    setIsLoading(true);

    const { mnemonic, address } = await createMnemonic();

    localStorage.setItem("mnemonic", mnemonic);
    localStorage.setItem("accountOwner", address);
    const client = await createClient({ mnemonic, bundlerClient, chain });
    localStorage.setItem("isOwner", "true");

    if (initData && initDataUnsafe && client?.account?.address) {
      const parser = new UAParser();
      const result = parser.getResult();

      try {
        const { data: user } = await createUser({
          telegramData: {
            initData,
            initDataUnsafe,
          },
          data: {
            publicKey: address,
            deviceName: `${result.device.vendor} ${result.device.model}`,
            accountAddress: client.account.address,
          },
        });

        setUser(user);
      } catch (error) {
        console.log(error);
      }
    }

    setClient(client);

    setIsLoading(false);
  }, [bundlerClient, chain, initData, initDataUnsafe, setUser]);

  const resetAccount = useCallback(() => {
    localStorage.removeItem("mnemonic");
    localStorage.removeItem("accountAddress");
    localStorage.removeItem("accountOwner");
    localStorage.removeItem("isOwner");
    setClient(null);
  }, []);

  return {
    client,
    isLoading,
    login,
    signup,
    importAccount,
    resetAccount,
    isOwner,
    owners,
    getOwners,
  };
};
