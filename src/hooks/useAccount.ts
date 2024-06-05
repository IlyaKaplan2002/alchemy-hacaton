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
import { useCallback, useContext, useEffect, useMemo, useState } from "react";

import { UAParser } from "ua-parser-js";
import { multiOwnerPluginActions } from "@alchemy/aa-accounts";
import { polygonAmoy } from "viem/chains";
import { useBundlerClient } from "@alchemy/aa-alchemy/react";
import { useInitData } from "@vkruglikov/react-telegram-web-app";
import { useWhyDidYouUpdate } from "ahooks";

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
  isLoggedIn: boolean;
  isSignupLoading: boolean;
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
  const [clientLoaded, setClientLoaded] = useState(false);
  const [isSignupLoading, setIsSignupLoading] = useState(false);
  const [importAccountLoaded, setImportAccountLoaded] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [initDataUnsafe, initData] = useInitData();

  const bundlerClient = useBundlerClient();

  const chainData = useContext(ChainContext);
  const userData = useContext(UserContext);

  const chain = useMemo(
    () => chainData?.chain || polygonAmoy,
    [chainData?.chain],
  );
  const setUser = useCallback(
    (user: IUser) => {
      if (userData) {
        userData.setUser(user);
      }
    },
    [userData],
  );
  const accountAddress = useMemo(
    () => userData?.user?.accountAddress || null,
    [userData?.user?.accountAddress],
  );

  useEffect(() => {
    setIsOwner(
      owners.includes(localStorage.getItem("accountOwner") as `0x${string}`) ||
        localStorage.getItem("isOwner") === "true",
    );
  }, [owners]);

  useEffect(() => {
    if (!ownersLoaded || localStorage.getItem("isOwner") || isSignupLoading)
      return;

    if (isOwner) {
      localStorage.setItem("isOwner", "true");
    } else {
      console.log(
        "here123",
        ownersLoaded,
        isSignupLoading,
        localStorage.getItem("isOwner"),
        isOwner,
      );
      localStorage.removeItem("isOwner");
    }
  }, [isOwner, isSignupLoading, ownersLoaded]);

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

  useWhyDidYouUpdate("getAvailableAccounts", {
    initData,
    initDataUnsafe,
    isOwner,
    ownersLoaded,
  });

  useEffect(() => {
    getAvailableAccounts();
  }, [getAvailableAccounts]);

  const getUserData = useCallback(
    async (notSetLoading?: boolean) => {
      if (!initData || !initDataUnsafe) {
        setIsLoading(false);
        return;
      }
      try {
        if (!notSetLoading) {
          setIsLoading(true);
        }
        const parser = new UAParser();
        const result = parser.getResult();

        const { data: user } = await getUser({
          telegramData: {
            initData,
            initDataUnsafe,
          },
          data: {
            publicKey: localStorage.getItem("accountOwner") as `0x${string}`,
            deviceName: `${result.os.name} ${result.os.version}`,
          },
        });

        setUser(user);
        setIsLoggedIn(true);
        setIsSignupLoading(false);
      } catch (error) {
        console.log(error);

        if ((error as any).response.data.message === "User not found") {
          localStorage.removeItem("isOwner");
          setClientWithGasManager(null);
          setClientWithoutGasManager(null);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [initData, initDataUnsafe],
  );

  const login = useCallback(async () => {
    const mnemonic = localStorage.getItem("mnemonic");

    if (!accountAddress) {
      if (!isLoading) {
        setClientLoaded(true);
      }
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

      setClientWithGasManager(clientWithGasManager);
      setClientWithoutGasManager(clientWithoutGasManager);
    }
    setClientLoaded(true);
  }, [accountAddress, chain, isLoading]);

  useWhyDidYouUpdate("login", {
    accountAddress,
    bundlerClient,
    chain,
  });

  useEffect(() => {
    console.log("here1");
    login();
  }, [login]);

  const importAccount = useCallback(async (accountAddress: `0x${string}`) => {
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
      if (!clientWithoutGasManager) {
        if (!isLoading && clientLoaded) {
          setOwnersLoaded(true);
        }
        return;
      }
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
    },
    [clientLoaded, clientWithoutGasManager, isLoading],
  );

  useEffect(() => {
    console.log("here");
    getUserData();

    const i = setInterval(() => {
      getUserData(true);
    }, 1000);

    return () => clearInterval(i);
  }, [getUserData]);

  useEffect(() => {
    console.log("here2");

    getOwners();

    const i = setInterval(() => {
      getOwners(true);
    }, 1000);

    return () => clearInterval(i);
  }, [getOwners]);

  useWhyDidYouUpdate("useEffect", {
    getUserData,
    getOwners,
  });

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
    setIsSignupLoading(true);

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
    console.log("setting isOwner");
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
  }, [bundlerClient, chain, initData, initDataUnsafe, setUser]);

  const resetAccount = useCallback(async () => {
    if (!initData || !initDataUnsafe || !accountAddress) return;

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
        accountAddress,
      },
    });

    localStorage.removeItem("isOwner");
    setClientWithGasManager(null);
    setClientWithoutGasManager(null);
    setIsLoggedIn(false);
  }, [accountAddress, initData, initDataUnsafe]);

  const exitAccount = useCallback(async () => {
    const pluginActionExtendedClient = clientWithGasManager?.extend(
      multiOwnerPluginActions,
    );

    if (
      !initData ||
      !initDataUnsafe ||
      !pluginActionExtendedClient ||
      !clientWithGasManager?.account ||
      !accountAddress
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
        accountAddress,
      },
    });

    await pluginActionExtendedClient.updateOwners({
      args: [[], [localStorage.getItem("accountOwner") as `0x${string}`]],
      account: clientWithGasManager.account,
    });

    localStorage.removeItem("isOwner");
    setClientWithGasManager(null);
    setClientWithoutGasManager(null);
  }, [accountAddress, clientWithGasManager, initData, initDataUnsafe]);

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
    isLoggedIn,
    isSignupLoading,
  };
};
