"use client";

import { FC, useContext, useState } from "react";
import { IDevice, IUser, deleteDevice } from "@/api/apiService";
import { InitData, InitDataUnsafe } from "@vkruglikov/react-telegram-web-app";

import { AccountContext } from "@/app/page";
import { Chain } from "viem";
import { UAParser } from "ua-parser-js";
import clsx from "clsx";
import { multiOwnerPluginActions } from "@alchemy/aa-accounts";

interface Props {
  device: IDevice;
  chain: Chain;
  owners: `0x${string}`[];
  getOwners: () => Promise<void>;
  initData: InitData;
  initDataUnsafe: InitDataUnsafe;
  setUserData: (data: IUser) => void;
  accountAddress: `0x${string}` | null;
}

const DeviceItem: FC<Props> = ({
  device,
  chain,
  owners,
  getOwners,
  initData,
  initDataUnsafe,
  setUserData,
  accountAddress,
}) => {
  const [isError, setIsError] = useState(false);
  const [sendUserOperationResult, setSendUserOperationResult] = useState<
    null | any
  >(null);
  const [isSendingUserOperation, setIsSendingUserOperation] = useState(false);

  const accountContext = useContext(AccountContext);
  const client = accountContext?.clientWithGasManager || null;

  const isOwner = owners.includes(device.publicKey);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-2">
        <div className="w-full overflow-hidden text-ellipsis text-wrap rounded-lg bg-[#1F2937] p-3 text-[#CBD5E1]">
          {device.publicKey !== localStorage.getItem("accountOwner")
            ? device.deviceName
            : "This device"}
        </div>
        {device.publicKey !== localStorage.getItem("accountOwner") && (
          <button
            className={clsx(
              "transform rounded-lg p-3 font-semibold text-[#FBFDFF] transition duration-500 ease-in-out hover:scale-105",
              isOwner ? "bg-[red]" : "bg-[#363FF9]",
            )}
            onClick={async () => {
              setIsSendingUserOperation(true);
              const pluginActionExtendedClient = client?.extend(
                multiOwnerPluginActions,
              );

              if (!pluginActionExtendedClient || !client?.account) {
                setIsError(true);
                setIsSendingUserOperation(false);
                return;
              }

              try {
                const result = await pluginActionExtendedClient.updateOwners({
                  args: isOwner
                    ? [[], [device.publicKey]]
                    : [[device.publicKey], []],
                  account: client.account,
                });

                const txHash =
                  await pluginActionExtendedClient.waitForUserOperationTransaction(
                    result,
                  );
                setSendUserOperationResult(txHash);

                if (!isOwner && accountAddress) {
                  const parser = new UAParser();
                  const result = parser.getResult();

                  const { data: userData } = await deleteDevice({
                    telegramData: {
                      initData,
                      initDataUnsafe,
                    },
                    data: {
                      publicKey: device.publicKey,
                      deviceName: `${result.os.name} ${result.os.version}`,
                      accountAddress,
                    },
                  });

                  setUserData(userData);
                }

                await getOwners();
              } catch (error) {
                setIsError(true);
              } finally {
                setIsSendingUserOperation(false);
              }
            }}
          >
            {isSendingUserOperation ? (
              <div
                className="text-surface inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-e-transparent align-[-0.125em] text-white motion-reduce:animate-[spin_1.5s_linear_infinite]"
                role="status"
              ></div>
            ) : isOwner ? (
              "Revoke"
            ) : (
              "Approve"
            )}
          </button>
        )}
      </div>

      {isError && (
        <div className="text-sm/6">An error occurred. Try again!</div>
      )}
      {sendUserOperationResult && chain.blockExplorers && (
        <a
          href={`${chain.blockExplorers.default.url}/tx/${sendUserOperationResult}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full transform rounded-lg bg-[#363FF9] p-3 text-center font-semibold text-[#FBFDFF] transition duration-500 ease-in-out hover:scale-105 disabled:bg-[#4252C5]"
        >
          View transaction details
        </a>
      )}
    </div>
  );
};

export default DeviceItem;
