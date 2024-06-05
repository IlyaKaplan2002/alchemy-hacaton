"use client";

import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { FC, useCallback, useContext, useState } from "react";
import { IDevice, IUser, deleteDevice } from "@/api/apiService";
import { InitData, InitDataUnsafe } from "@vkruglikov/react-telegram-web-app";

import { AccountContext } from "@/app/accountProvider";
import { Chain } from "viem";
import { UAParser } from "ua-parser-js";
import { multiOwnerPluginActions } from "@alchemy/aa-accounts";

interface Props {
  isOpen: boolean;
  device: IDevice;
  chain: Chain;

  initData: InitData;
  initDataUnsafe: InitDataUnsafe;
  setUserData: (data: IUser) => void;
  accountAddress: `0x${string}` | null;
}

const NewDevicePopup: FC<Props> = ({
  isOpen,
  device,
  chain,
  initData,
  initDataUnsafe,
  setUserData,
  accountAddress,
}) => {
  const [isSendingUserOperation, setIsSendingUserOperation] = useState(false);
  const [isSendUserOperationError, setIsSendUserOperationError] =
    useState(false);
  const [sendUserOperationResult, setSendUserOperationResult] = useState<
    null | string
  >(null);

  const accountContext = useContext(AccountContext);
  const client = accountContext?.clientWithGasManager || null;

  const decline = useCallback(async () => {
    if (!accountAddress) return;

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

    setIsSendingUserOperation(false);
  }, [accountAddress, device.publicKey, initData, initDataUnsafe, setUserData]);

  const approve = useCallback(async () => {
    setIsSendingUserOperation(true);
    const pluginActionExtendedClient = client?.extend(multiOwnerPluginActions);

    if (!pluginActionExtendedClient || !client?.account) {
      setIsSendUserOperationError(true);
      setIsSendingUserOperation(false);
      return;
    }

    try {
      const result = await pluginActionExtendedClient.updateOwners({
        args: [[device.publicKey], []],
        account: client.account,
      });

      const txHash =
        await pluginActionExtendedClient.waitForUserOperationTransaction(
          result,
        );
      setSendUserOperationResult(txHash);
    } catch (error) {
      setIsSendUserOperationError(true);
    } finally {
      setIsSendingUserOperation(false);
    }
  }, [client, device.publicKey]);

  return (
    <Dialog
      open={isOpen}
      onClose={() => {
        setIsSendingUserOperation(false);
      }}
      className="relative z-50"
    >
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <DialogPanel
          className="flex flex-col space-y-4 rounded-lg border border-none bg-[#0F172A] p-10 outline-none"
          style={{ maxWidth: "80vw", width: "80vw" }}
        >
          <DialogTitle className="font-bold">New device detected</DialogTitle>

          <div className="flex flex-col justify-between gap-6">
            {sendUserOperationResult && chain.blockExplorers ? (
              <a
                href={`${chain.blockExplorers.default.url}/tx/${sendUserOperationResult}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full transform rounded-lg bg-[#363FF9] p-3 text-center font-semibold text-[#FBFDFF] transition duration-500 ease-in-out hover:scale-105 disabled:bg-[#4252C5]"
              >
                View transaction details
              </a>
            ) : (
              <div className="flex gap-4">
                <button
                  className="w-full transform rounded-lg bg-[red] p-3 font-semibold text-[#FBFDFF] transition duration-500 ease-in-out hover:scale-105"
                  onClick={decline}
                >
                  Decline
                </button>
                <button
                  className="w-full transform rounded-lg bg-[#363FF9] p-3 font-semibold text-[#FBFDFF] transition duration-500 ease-in-out hover:scale-105"
                  onClick={approve}
                >
                  {isSendingUserOperation ? (
                    <div
                      className="text-surface inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-e-transparent align-[-0.125em] text-white motion-reduce:animate-[spin_1.5s_linear_infinite]"
                      role="status"
                    ></div>
                  ) : (
                    <>Approve</>
                  )}
                </button>
              </div>
            )}

            {isSendUserOperationError && "An error occurred. Try again!"}
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default NewDevicePopup;
