"use client";

import { FC, useContext } from "react";

import { AccountContext } from "@/app/page";
import { UAParser } from "ua-parser-js";
import { addDevice } from "@/api/apiService";
import { useInitData } from "@vkruglikov/react-telegram-web-app";

export const LogInCard: FC = () => {
  const accountContext = useContext(AccountContext);

  const importAccount =
    accountContext?.importAccount ||
    (async () => ({ address: "0x", mnemonic: "" }));
  const login = accountContext?.login || (async () => {});
  const signup = accountContext?.signup || (async () => {});
  const availableAccounts = accountContext?.availableAccounts || [];

  const [initDataUnsafe, initData] = useInitData();

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
