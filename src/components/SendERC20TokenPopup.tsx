import { Address, encodeFunctionData } from "viem";
import { Dialog, DialogPanel, DialogTitle, Switch } from "@headlessui/react";
import { ERC20_ABI, IERC20Token } from "./ProfileCard";
import { FC, useState } from "react";

import { polygonAmoy } from "viem/chains";
import { useAccount } from "@/hooks/useAccount";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  token: IERC20Token | null;
}

const SendERC20TokenPopup: FC<Props> = ({ isOpen, onClose, token }) => {
  const [amount, setAmount] = useState("");
  const [receiverAddress, setReceiverAddress] = useState("");
  const [isSendingUserOperation, setIsSendingUserOperation] = useState(false);
  const [isSendUserOperationError, setIsSendUserOperationError] =
    useState(false);
  const [sendUserOperationResult, setSendUserOperationResult] = useState<
    null | string
  >(null);
  const [useGasManager, setUseGasManager] = useState(false);

  const { client } = useAccount({ useGasManager });

  return (
    <Dialog
      open={isOpen}
      onClose={() => {
        onClose();
        setAmount("");
        setReceiverAddress("");
        setIsSendingUserOperation(false);
        setIsSendUserOperationError(false);
        setSendUserOperationResult(null);
      }}
      className="relative z-50"
    >
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <DialogPanel
          className="flex min-w-[400px] flex-col space-y-4 rounded-lg border border-none bg-white p-10 outline-none dark:bg-[#0F172A]"
          style={{ maxWidth: "80vw" }}
        >
          <DialogTitle className="font-bold">
            Send {token?.symbol} token
          </DialogTitle>

          <div className="flex flex-col justify-between gap-6">
            <input
              className="rounded-lg border border-[#CBD5E1] p-3 dark:border-[#475569] dark:bg-slate-700 dark:text-white dark:placeholder:text-[#E2E8F0]"
              type="text"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <input
              className="rounded-lg border border-[#CBD5E1] p-3 dark:border-[#475569] dark:bg-slate-700 dark:text-white dark:placeholder:text-[#E2E8F0]"
              type="text"
              placeholder="Receiver address"
              value={receiverAddress}
              onChange={(e) => setReceiverAddress(e.target.value)}
            />

            <div className="flex gap-2 align-middle">
              <Switch
                checked={useGasManager}
                onChange={setUseGasManager}
                className="group inline-flex h-6 w-11 items-center rounded-full bg-gray-600 transition data-[checked]:bg-blue-600"
              >
                <span className="size-4 translate-x-1 rounded-full bg-white transition group-data-[checked]:translate-x-6" />
              </Switch>

              <span className="text-sm text-gray-500 dark:text-gray-400">
                {useGasManager ? "Use gas manager" : "Don't use gas manager"}
              </span>
            </div>

            {sendUserOperationResult ? (
              <a
                href={`${polygonAmoy.blockExplorers.default.url}/tx/${sendUserOperationResult}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full transform rounded-lg bg-[#363FF9] p-3 text-center font-semibold text-[#FBFDFF] transition duration-500 ease-in-out hover:scale-105 dark:disabled:bg-[#4252C5]"
              >
                View transaction details
              </a>
            ) : (
              <div className="flex gap-4">
                <button
                  className="w-full transform rounded-lg bg-[#363FF9] p-3 font-semibold text-[#FBFDFF] transition duration-500 ease-in-out hover:scale-105"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  className="w-full transform rounded-lg bg-[#363FF9] p-3 font-semibold text-[#FBFDFF] transition duration-500 ease-in-out hover:scale-105"
                  onClick={async () => {
                    if (!client || !client.account || !token) return;

                    setIsSendingUserOperation(true);

                    try {
                      const uoCallData = encodeFunctionData({
                        abi: ERC20_ABI,
                        functionName: "transfer",
                        args: [
                          receiverAddress,
                          BigInt(Number(amount) * 10 ** token.decimals),
                        ],
                      });
                      const uo = await client.sendUserOperation({
                        uo: {
                          target: token.address as Address,
                          data: uoCallData,
                        },
                        account: client.account,
                      });

                      const txHash =
                        await client.waitForUserOperationTransaction(uo);

                      setSendUserOperationResult(txHash);
                      setAmount("");
                      setReceiverAddress("");
                    } catch (error) {
                      setIsSendUserOperationError(true);
                    } finally {
                      setIsSendingUserOperation(false);
                    }
                  }}
                >
                  {isSendingUserOperation ? (
                    <div
                      className="text-surface inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-e-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white"
                      role="status"
                    ></div>
                  ) : (
                    <>Send</>
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

export default SendERC20TokenPopup;
