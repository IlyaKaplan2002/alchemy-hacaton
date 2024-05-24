import { Address, Chain } from "viem";
import { Dialog, DialogPanel, DialogTitle, Switch } from "@headlessui/react";
import { FC, useState } from "react";

import { useAccount } from "@/hooks/useAccount";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  chain: Chain;
}

const SendNativeTokenPopup: FC<Props> = ({ isOpen, onClose, chain }) => {
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
          className="flex flex-col space-y-4 rounded-lg border border-none bg-[#0b1328] bg-white p-10 outline-none"
          style={{ maxWidth: "80vw", width: "80vw" }}
        >
          <DialogTitle className="font-bold">Send native token</DialogTitle>

          <div className="flex flex-col justify-between gap-6">
            <input
              className="rounded-lg border border-[#475569] border-[#CBD5E1] bg-slate-700 p-3 text-white placeholder:text-[#E2E8F0]"
              type="text"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <input
              className="rounded-lg border border-[#475569] border-[#CBD5E1] bg-slate-700 p-3 text-white placeholder:text-[#E2E8F0]"
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

              <span className="text-sm text-gray-400 text-gray-500">
                {useGasManager ? "Use gas manager" : "Don't use gas manager"}
              </span>
            </div>

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
                  className="w-full transform rounded-lg bg-[#363FF9] p-3 font-semibold text-[#FBFDFF] transition duration-500 ease-in-out hover:scale-105"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  className="w-full transform rounded-lg bg-[#363FF9] p-3 font-semibold text-[#FBFDFF] transition duration-500 ease-in-out hover:scale-105"
                  onClick={async () => {
                    if (!client || !client.account) return;

                    setIsSendingUserOperation(true);

                    try {
                      const uo = await client.sendUserOperation({
                        uo: {
                          target: receiverAddress as Address,
                          value: BigInt(Number(amount) * 10 ** 18),
                          data: "0x",
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
                      className="text-surface inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-e-transparent align-[-0.125em] text-white motion-reduce:animate-[spin_1.5s_linear_infinite]"
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

export default SendNativeTokenPopup;
