"use client";

import { FC, useState } from "react";

import ImportAccountPopup from "./ImportAccountPopup";
import { useAccount } from "@/hooks/useAccount";
import { useInitData } from "@vkruglikov/react-telegram-web-app";

interface Props {
  login: () => Promise<void>;
  signup: () => Promise<void>;
}

export const LogInCard: FC<Props> = ({ login, signup }) => {
  const { importAccount } = useAccount({ useGasManager: false });

  const [initDataUnsafe, initData] = useInitData();

  console.log(initDataUnsafe, initData, "initDataUnsafe, initData");

  const [keyData, setKeyData] = useState<{
    address: string;
    mnemonic: string;
  } | null>(null);

  return (
    <div className="flex min-w-80 flex-row justify-center rounded-lg bg-[#0F172A] p-10">
      <div className="flex flex-col gap-8">
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

          <button
            className="w-full transform rounded-lg bg-[#363FF9] p-3 font-semibold text-[#FBFDFF] transition duration-500 ease-in-out hover:scale-105"
            onClick={async () => {
              const keyData = await importAccount();
              setKeyData(keyData);
            }}
          >
            Import an existing account
          </button>

          <ImportAccountPopup
            isOpen={!!keyData}
            onClose={() => setKeyData(null)}
            keyData={keyData || { address: "", mnemonic: "" }}
            login={login}
          />
        </div>
      </div>
    </div>
  );
};
