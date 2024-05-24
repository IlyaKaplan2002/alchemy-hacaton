import { FC, useState } from "react";

import { Chain } from "viem/chains";
import { multiOwnerPluginActions } from "@alchemy/aa-accounts";
import { useAccount } from "@/hooks/useAccount";

interface Props {
  chain: Chain;
}

const AddOwner: FC<Props> = ({ chain }) => {
  const [newOwnerAddress, setNewOwnerAddress] = useState("");
  const [isError, setIsError] = useState(false);
  const [sendUserOperationResult, setSendUserOperationResult] = useState<
    null | any
  >(null);
  const [isSendingUserOperation, setIsSendingUserOperation] = useState(false);

  const { client } = useAccount({ useGasManager: true });

  return (
    <div className="flex flex-col gap-8">
      <div className="text-[18px] font-semibold">Add owner</div>
      <div className="flex flex-col justify-between gap-6">
        <input
          className="rounded-lg border border-[#475569] border-[#CBD5E1] bg-slate-700 p-3 text-white placeholder:text-[#E2E8F0]"
          type="text"
          placeholder="New owner address"
          value={newOwnerAddress}
          onChange={(e) => setNewOwnerAddress(e.target.value)}
        />
        <button
          className="w-full transform rounded-lg bg-[#363FF9] p-3 font-semibold text-[#FBFDFF] transition duration-500 ease-in-out hover:scale-105"
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
                args: [[newOwnerAddress as `0x${string}`], []],
                account: client.account,
              });

              const txHash =
                await pluginActionExtendedClient.waitForUserOperationTransaction(
                  result,
                );
              setSendUserOperationResult(txHash);
              setNewOwnerAddress("");
            } catch (error) {
              setIsError(true);
            } finally {
              setIsSendingUserOperation(false);
            }
          }}
        >
          Add
        </button>

        {isSendingUserOperation && (
          // Loading spinner
          <div
            className="text-surface inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-e-transparent align-[-0.125em] text-white motion-reduce:animate-[spin_1.5s_linear_infinite]"
            role="status"
          ></div>
        )}
        {isError && "An error occurred. Try again!"}
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

export default AddOwner;
