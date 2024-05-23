import { Address } from "viem";
import { polygonAmoy } from "viem/chains";
import { useAccount } from "@/hooks/useAccount";
import { useState } from "react";

const SendNativeToken = () => {
  const [amount, setAmount] = useState("");
  const [receiverAddress, setReceiverAddress] = useState("");
  const [isSendingUserOperation, setIsSendingUserOperation] = useState(false);
  const [isSendUserOperationError, setIsSendUserOperationError] =
    useState(false);
  const [sendUserOperationResult, setSendUserOperationResult] = useState<
    null | string
  >(null);

  const { client } = useAccount({ useGasManager: false });

  return (
    <div className="flex flex-col gap-8">
      <div className="text-[18px] font-semibold">Send native token</div>
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

              const txHash = await client.waitForUserOperationTransaction(uo);

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
          Send
        </button>

        {isSendingUserOperation && (
          // Loading spinner
          <div
            className="text-surface inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-e-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white"
            role="status"
          ></div>
        )}
        {isSendUserOperationError && "An error occurred. Try again!"}
        {sendUserOperationResult && (
          <a
            href={`${polygonAmoy.blockExplorers.default.url}/tx/${sendUserOperationResult}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full transform rounded-lg bg-[#363FF9] p-3 text-center font-semibold text-[#FBFDFF] transition duration-500 ease-in-out hover:scale-105 dark:disabled:bg-[#4252C5]"
          >
            View transaction details
          </a>
        )}
      </div>
    </div>
  );
};

export default SendNativeToken;
