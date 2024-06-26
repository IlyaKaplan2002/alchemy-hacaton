"use client";

import { Address, Chain } from "viem";
import { FC, useContext, useState } from "react";

import { AccountContext } from "@/app/accountProvider";

interface Props {
  chain: Chain;
}

const SendNativeToken: FC<Props> = ({ chain }) => {
  const [amount, setAmount] = useState("");
  const [receiverAddress, setReceiverAddress] = useState("");
  const [isSendingUserOperation, setIsSendingUserOperation] = useState(false);
  const [isSendUserOperationError, setIsSendUserOperationError] =
    useState(false);
  const [sendUserOperationResult, setSendUserOperationResult] = useState<
    null | string
  >(null);

  const accountContext = useContext(AccountContext);
  const client = accountContext?.clientWithoutGasManager || null;

  return (
    <div className="flex flex-col gap-8">
      <div className="text-[18px] font-semibold">Send native token</div>
      <div className="flex flex-col justify-between gap-6">
        <input
          className="rounded-lg border border-[#475569] bg-slate-700 p-3 text-white placeholder:text-[#E2E8F0]"
          type="text"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <input
          className="rounded-lg border border-[#475569] bg-slate-700 p-3 text-white placeholder:text-[#E2E8F0]"
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
            className="text-surface inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-e-transparent align-[-0.125em] text-white motion-reduce:animate-[spin_1.5s_linear_infinite]"
            role="status"
          ></div>
        )}
        {isSendUserOperationError && "An error occurred. Try again!"}
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
    </div>
  );
};

export default SendNativeToken;
