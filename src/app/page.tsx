"use client";

import { IUser, addDevice, getUsersMany } from "@/api/apiService";
import { useCallback, useEffect, useState } from "react";

import { LogInCard } from "@/components/LogInCard";
import { ProfileCard } from "@/components/ProfileCard";
import { UAParser } from "ua-parser-js";
import { useAccount } from "@/hooks/useAccount";
import { useInitData } from "@vkruglikov/react-telegram-web-app";

export default function Home() {
  const [availableAccounts, setAvailableAccounts] = useState<IUser[]>([]);
  const [availableAccountsLoaded, setAvailableAccountsLoaded] = useState(false);
  const [importAccountLoaded, setImportAccountLoaded] = useState(false);

  const [initDataUnsafe, initData] = useInitData();

  const {
    client,
    isLoading,
    login,
    signup,
    resetAccount,
    isOwner,
    exitAccount,
    ownersLoaded,
    getOwners,
    getUserData,
    owners,
  } = useAccount({
    useGasManager: true,
  });

  useEffect(() => {
    getOwners();

    const i = setInterval(() => {
      getUserData(true);
      getOwners(true);
    }, 1000);

    return () => clearInterval(i);
  }, [getOwners, getUserData]);

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

  const { importAccount } = useAccount({ useGasManager: false });

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
    if (availableAccounts.length && !client) {
      loginDevice(availableAccounts[0]);
    } else {
      setImportAccountLoaded(true);
    }
  }, [availableAccounts, client, loginDevice]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-[20px]">
      {isLoading ||
      !ownersLoaded ||
      !availableAccountsLoaded ||
      !importAccountLoaded ? (
        <div className="flex items-center justify-center">
          <div
            className="text-surface inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white"
            role="status"
          ></div>
        </div>
      ) : client ? (
        isOwner ? (
          <ProfileCard
            resetAccount={resetAccount}
            exitAccount={exitAccount}
            owners={owners}
            getOwners={getOwners}
          />
        ) : (
          <div
            className="flex min-w-80 flex-col justify-center rounded-lg bg-[#0F172A] p-10"
            style={{ maxWidth: "95vw" }}
          >
            <div className="text-center text-[18px] font-semibold">
              Please approve this device on the previous device
            </div>

            <button
              className="w-full transform rounded-lg bg-[red] p-3 font-semibold text-[#FBFDFF] transition duration-500 ease-in-out hover:scale-105"
              onClick={resetAccount}
            >
              Cancel
            </button>
          </div>
        )
      ) : (
        <LogInCard
          login={login}
          signup={signup}
          availableAccounts={availableAccounts}
        />
      )}
    </main>
  );
}
