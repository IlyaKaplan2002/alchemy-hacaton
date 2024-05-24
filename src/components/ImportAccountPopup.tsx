import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { FC, useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  keyData: { address: string; mnemonic: string };
  login: () => Promise<void>;
}

const ImportAccountPopup: FC<Props> = ({
  isOpen,
  onClose,
  keyData: { address, mnemonic },
  login,
}) => {
  const [accountAddress, setAccountAddress] = useState("");

  return (
    <Dialog
      open={isOpen}
      onClose={() => {
        onClose();
        setAccountAddress("");
      }}
      className="relative z-50"
    >
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <DialogPanel
          className="flex flex-col space-y-4 rounded-lg border border-none bg-white p-10 outline-none dark:bg-[#0b1328]"
          style={{ maxWidth: "80vw", width: "80vw" }}
        >
          <DialogTitle className="font-bold">Import account</DialogTitle>

          <div className="flex flex-col justify-between gap-6">
            <p className="text-gray-500 dark:text-gray-400">
              Step 1: Enter account address
            </p>
            <input
              className="rounded-lg border border-[#CBD5E1] p-3 dark:border-[#475569] dark:bg-slate-700 dark:text-white dark:placeholder:text-[#E2E8F0]"
              type="text"
              placeholder="Account address"
              value={accountAddress}
              onChange={(e) => setAccountAddress(e.target.value)}
            />

            <p className="text-gray-500 dark:text-gray-400">
              Step 2: Approve new key in a previous account
            </p>
            <div className="flex flex-col gap-2">
              <div>New key</div>

              <div className="flex gap-2">
                <div className="overflow-hidden text-ellipsis text-wrap rounded-lg p-3 dark:bg-[#1F2937] dark:text-[#CBD5E1]">
                  {address}
                </div>
                <button
                  className="transform rounded-lg bg-[#363FF9] p-3 font-semibold text-[#FBFDFF] transition duration-500 ease-in-out hover:scale-105"
                  onClick={() => navigator.clipboard.writeText(address || "")}
                >
                  Copy
                </button>
              </div>
            </div>

            <button
              className="w-full transform rounded-lg bg-[#363FF9] p-3 font-semibold text-[#FBFDFF] transition duration-500 ease-in-out hover:scale-105"
              onClick={async () => {
                localStorage.setItem("accountAddress", accountAddress);
                localStorage.setItem("mnemonic", mnemonic);
                onClose();
                login();
              }}
            >
              Done
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default ImportAccountPopup;
