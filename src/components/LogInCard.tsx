"use client";

import { FC, useCallback, useEffect, useState } from "react";
import { IUser, addDevice, getUsersMany } from "@/api/apiService";

import { UAParser } from "ua-parser-js";
import { useAccount } from "@/hooks/useAccount";
import { useInitData } from "@vkruglikov/react-telegram-web-app";

interface Props {
  login: () => Promise<void>;
  signup: () => Promise<void>;
}

export const LogInCard: FC<Props> = ({ login, signup }) => {
  const { importAccount } = useAccount({ useGasManager: false });

  const [availableAccounts, setAvailableAccounts] = useState<IUser[]>([]);

  const [initDataUnsafe, initData] = useInitData();

  const getAvailableAccounts = useCallback(async () => {
    if (!initData || !initDataUnsafe) return;

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
    }
  }, [initData, initDataUnsafe]);

  useEffect(() => {
    getAvailableAccounts();
  }, [getAvailableAccounts]);

  const loginDevice = useCallback(
    async (account: IUser) => {
      const { address } = await importAccount(account.accountAddress);
      await login();

      if (!initData || !initDataUnsafe) return;

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
      } catch (error) {}
    },
    [initData, initDataUnsafe, importAccount, login],
  );

  useEffect(() => {
    if (availableAccounts.length) {
      loginDevice(availableAccounts[0]);
    }
  }, [availableAccounts, loginDevice]);

  return (
    <div
      className="flex min-w-80 flex-row justify-center rounded-lg bg-[#0F172A] p-10"
      style={{ maxWidth: "95vw" }}
    >
      <div className="flex flex-col gap-8" style={{ maxWidth: "100%" }}>
        <div className="text-[18px] font-semibold">
          Log in to the Embedded Accounts Demo!
        </div>
        <div className="flex flex-col justify-between gap-6">
          <button
            className="w-full transform rounded-lg bg-[#363FF9] p-3 font-semibold text-[#FBFDFF] transition duration-500 ease-in-out hover:scale-105"
            onClick={() => {
              signup();
            }}
          >
            Create a new account
          </button>

          {availableAccounts.length > 0 && (
            <div className="text-[18px] font-semibold">
              Import an existing account:
            </div>
          )}

          {availableAccounts.map((account) => (
            <button
              key={account.id}
              className="w-full transform overflow-hidden text-ellipsis rounded-lg bg-[#363FF9] p-3 font-semibold text-[#FBFDFF] transition duration-500 ease-in-out hover:scale-105"
              style={{ width: "100%" }}
              onClick={async () => {
                const { address } = await importAccount(account.accountAddress);
                await login();

                if (!initData || !initDataUnsafe) return;

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
                } catch (error) {}
              }}
            >
              {account.accountAddress}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
