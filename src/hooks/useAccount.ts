"use client";

import { ChainContext, UserContext } from "@/app/providers";
import {
  IUser,
  addDevice,
  createUser,
  deleteDevice,
  deleteUser,
  getUser,
  getUsersMany,
} from "@/api/apiService";
import { LocalAccountSigner, SmartAccountClient } from "@alchemy/aa-core";
import { createClient, createMnemonic } from "@/helpers/createAccount";
import { useCallback, useContext, useEffect, useState } from "react";

import { UAParser } from "ua-parser-js";
import { multiOwnerPluginActions } from "@alchemy/aa-accounts";
import { polygonAmoy } from "viem/chains";
import { useBundlerClient } from "@alchemy/aa-alchemy/react";
import { useInitData } from "@vkruglikov/react-telegram-web-app";

export interface IAccountState {
  clientWithGasManager: SmartAccountClient | null;
  clientWithoutGasManager: SmartAccountClient | null;
  isLoading: boolean;
  login: () => Promise<void>;
  signup: () => Promise<void>;
  importAccount: (accountAddress: `0x${string}`) => Promise<{
    address: `0x${string}`;
    mnemonic: string;
  }>;
  resetAccount: () => Promise<void>;
  isOwner: boolean;
  owners: `0x${string}`[];
  getOwners: () => Promise<void>;
  exitAccount: () => Promise<void>;
  ownersLoaded: boolean;
  getUserData: () => Promise<void>;
  availableAccounts: IUser[];
  availableAccountsLoaded: boolean;
  importAccountLoaded: boolean;
}

export const useAccount = (): IAccountState => {
  const [isLoading, setIsLoading] = useState(true);
  const [clientWithoutGasManager, setClientWithoutGasManager] =
    useState<SmartAccountClient | null>(null);
  const [clientWithGasManager, setClientWithGasManager] =
    useState<SmartAccountClient | null>(null);
  const [owners, setOwners] = useState<`0x${string}`[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [ownersLoaded, setOwnersLoaded] = useState(false);
  const [availableAccounts, setAvailableAccounts] = useState<IUser[]>([]);
  const [availableAccountsLoaded, setAvailableAccountsLoaded] = useState(false);
  const [importAccountLoaded, setImportAccountLoaded] = useState(false);

  const [initDataUnsafe, initData] = useInitData();

  const bundlerClient = useBundlerClient();

  useEffect(() => {
    setIsOwner(
      owners.includes(localStorage.getItem("accountOwner") as `0x${string}`) ||
        localStorage.getItem("isOwner") === "true",
    );
  }, [owners]);

  useEffect(() => {
    if (!ownersLoaded || localStorage.getItem("isOwner")) return;
    if (isOwner) {
      localStorage.setItem("isOwner", "true");
    } else {
      localStorage.removeItem("isOwner");
    }
  }, [isOwner, ownersLoaded]);

  const getAvailableAccounts = useCallback(async () => {
    if (!initData || !initDataUnsafe || isOwner || !ownersLoaded) {
      setAvailableAccountsLoaded(true);
      return;
    }

    try {
      const { data: accounts } = await getUsersMany({
        telegramData: {
          initData,
          initDataUnsafe,
        },
        data: undefined,
      });
      setAvailableAccounts(accounts);
    } catch (e) {
      console.error(e);
    } finally {
      setAvailableAccountsLoaded(true);
    }
  }, [initData, initDataUnsafe, isOwner, ownersLoaded]);

  useEffect(() => {
    getAvailableAccounts();
  }, [getAvailableAccounts]);

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

  const getUserData = useCallback(
    async (shouldLogout?: boolean) => {
      if (initData && initDataUnsafe) {
        try {
          const parser = new UAParser();
          const result = parser.getResult();

          const { data: user } = await getUser({
            telegramData: {
              initData,
              initDataUnsafe,
            },
            data: {
              publicKey: localStorage.getItem("accountOwner") as `0x${string}`,
              accountAddress: localStorage.getItem(
                "accountAddress",
              ) as `0x${string}`,
              deviceName: `${result.os.name} ${result.os.version}`,
            },
          });

          setUser(user);
        } catch (error) {
          console.log(error);

          if (
            (error as any).response.data.message === "User not found" &&
            shouldLogout
          ) {
            localStorage.removeItem("accountAddress");
            localStorage.removeItem("isOwner");
            setClientWithGasManager(null);
            setClientWithoutGasManager(null);
          }
        }
      }
    },
    [initData, initDataUnsafe],
  );

  const login = useCallback(async () => {
    setIsLoading(true);

    const mnemonic = localStorage.getItem("mnemonic");

    const accountAddress = localStorage.getItem("accountAddress");

    if (!accountAddress) {
      setIsLoading(false);

      return;
    }
    if (mnemonic) {
      if (!localStorage.getItem("accountOwner")) {
        const signer = LocalAccountSigner.mnemonicToAccountSigner(mnemonic);

        const address = await signer.getAddress();

        localStorage.setItem("accountOwner", address);
      }

      const clientWithGasManager = await createClient({
        mnemonic,
        bundlerClient,
        chain,
        accountAddress: (accountAddress as `0x${string}`) || undefined,
        useGasManager: true,
      });
      const clientWithoutGasManager = await createClient({
        mnemonic,
        bundlerClient,
        chain,
        accountAddress: (accountAddress as `0x${string}`) || undefined,
        useGasManager: false,
      });

      getUserData();

      setClientWithGasManager(clientWithGasManager);
      setClientWithoutGasManager(clientWithoutGasManager);
    }

    setIsLoading(false);
  }, [chain, getUserData]);

  useEffect(() => {
    login();
  }, [login]);

  const importAccount = useCallback(async (accountAddress: `0x${string}`) => {
    localStorage.setItem("accountAddress", accountAddress);

    if (
      localStorage.getItem("accountOwner") &&
      localStorage.getItem("mnemonic")
    ) {
      return {
        address: localStorage.getItem("accountOwner") as `0x${string}`,
        mnemonic: localStorage.getItem("mnemonic") as string,
      };
    }

    const { mnemonic, address } = await createMnemonic();

    localStorage.setItem("mnemonic", mnemonic);
    localStorage.setItem("accountOwner", address);

    return { address, mnemonic };
  }, []);

  const getOwners = useCallback(
    async (notSetLoading?: boolean) => {
      if (clientWithoutGasManager) {
        if (!notSetLoading) {
          setOwnersLoaded(false);
        }
        const pluginActionExtendedClient = clientWithoutGasManager.extend(
          multiOwnerPluginActions,
        );

        if (!pluginActionExtendedClient || !clientWithoutGasManager.account) {
          return;
        }

        const owners = await pluginActionExtendedClient.readOwners({
          account: clientWithoutGasManager.account,
        });

        setOwners(
          !owners.length && localStorage.getItem("isOwner") === "true"
            ? [localStorage.getItem("accountOwner") as `0x${string}`]
            : (owners as `0x${string}`[]),
        );

        setOwnersLoaded(true);
      } else {
        setOwnersLoaded(true);
      }
    },
    [clientWithoutGasManager],
  );

  useEffect(() => {
    getOwners();

    const i = setInterval(() => {
      getUserData(true);
      getOwners(true);
    }, 1000);

    return () => clearInterval(i);
  }, [getOwners, getUserData]);

  const loginDevice = useCallback(
    async (account: IUser) => {
      const { address } = await importAccount(account.accountAddress);
      await login();

      if (!initData || !initDataUnsafe) {
        setImportAccountLoaded(true);
        return;
      }

      const parser = new UAParser();
      const result = parser.getResult();

      try {
        await addDevice({
          telegramData: {
            initData,
            initDataUnsafe,
          },
          data: {
            deviceName: `${result.os.name} ${result.os.version}`,
            publicKey: address,
            accountAddress: account.accountAddress,
          },
        });
      } catch (error) {
      } finally {
        setImportAccountLoaded(true);
      }
    },
    [initData, initDataUnsafe, importAccount, login],
  );

  useEffect(() => {
    if (!availableAccountsLoaded) return;

    if (availableAccounts.length && !clientWithGasManager) {
      loginDevice(availableAccounts[0]);
    } else {
      setImportAccountLoaded(true);
    }
  }, [
    availableAccounts,
    availableAccountsLoaded,
    clientWithGasManager,
    loginDevice,
  ]);

  const signup = useCallback(async () => {
    setIsLoading(true);

    const { mnemonic, address } = await createMnemonic();

    localStorage.setItem("mnemonic", mnemonic);
    localStorage.setItem("accountOwner", address);
    const clientWithGasManager = await createClient({
      mnemonic,
      bundlerClient,
      chain,
      useGasManager: true,
    });
    if (!clientWithGasManager?.account) return;
    const clientWithoutGasManager = await createClient({
      mnemonic,
      bundlerClient,
      chain,
      accountAddress: clientWithGasManager.account.address,
      useGasManager: false,
    });
    localStorage.setItem("isOwner", "true");

    if (initData && initDataUnsafe && clientWithGasManager?.account?.address) {
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
            deviceName: `${result.os.name} ${result.os.version}`,
            accountAddress: clientWithGasManager.account.address,
          },
        });

        setUser(user);
      } catch (error) {
        console.log(error);
      }
    }

    setClientWithGasManager(clientWithGasManager);
    setClientWithoutGasManager(clientWithoutGasManager);

    setIsLoading(false);
  }, [bundlerClient, chain, initData, initDataUnsafe, setUser]);

  const resetAccount = useCallback(async () => {
    if (!initData || !initDataUnsafe) return;

    const parser = new UAParser();
    const result = parser.getResult();

    await deleteUser({
      telegramData: {
        initData,
        initDataUnsafe,
      },
      data: {
        publicKey: localStorage.getItem("accountOwner") as `0x${string}`,
        deviceName: `${result.os.name} ${result.os.version}`,
        accountAddress: localStorage.getItem("accountAddress") as `0x${string}`,
      },
    });

    localStorage.removeItem("accountAddress");
    localStorage.removeItem("isOwner");
    setClientWithGasManager(null);
    setClientWithoutGasManager(null);
  }, [initData, initDataUnsafe]);

  const exitAccount = useCallback(async () => {
    const pluginActionExtendedClient = clientWithGasManager?.extend(
      multiOwnerPluginActions,
    );

    if (
      !initData ||
      !initDataUnsafe ||
      !pluginActionExtendedClient ||
      !clientWithGasManager?.account
    )
      return;

    const parser = new UAParser();
    const result = parser.getResult();

    await deleteDevice({
      telegramData: {
        initData,
        initDataUnsafe,
      },
      data: {
        publicKey: localStorage.getItem("accountOwner") as `0x${string}`,
        deviceName: `${result.os.name} ${result.os.version}`,
        accountAddress: localStorage.getItem("accountAddress") as `0x${string}`,
      },
    });

    await pluginActionExtendedClient.updateOwners({
      args: [[], [localStorage.getItem("accountOwner") as `0x${string}`]],
      account: clientWithGasManager.account,
    });

    localStorage.removeItem("accountAddress");
    localStorage.removeItem("isOwner");
    setClientWithGasManager(null);
    setClientWithoutGasManager(null);
  }, [clientWithGasManager, initData, initDataUnsafe]);

  return {
    clientWithGasManager,
    clientWithoutGasManager,
    isLoading,
    login,
    signup,
    importAccount,
    resetAccount,
    isOwner,
    owners,
    getOwners,
    exitAccount,
    ownersLoaded,
    getUserData,
    availableAccounts,
    availableAccountsLoaded,
    importAccountLoaded,
  };
};
