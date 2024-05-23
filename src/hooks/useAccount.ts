import { LocalAccountSigner, SmartAccountClient } from "@alchemy/aa-core";
import { createClient, createMnemonic } from "@/helpers/createAccount";
import { useCallback, useEffect, useState } from "react";

import { useBundlerClient } from "@alchemy/aa-alchemy/react";

interface Props {
  useGasManager: boolean;
}

export const useAccount = ({ useGasManager }: Props) => {
  const [isLoading, setIsLoading] = useState(true);
  const [client, setClient] = useState<SmartAccountClient | null>(null);
  const bundlerClient = useBundlerClient();

  const login = useCallback(async () => {
    setIsLoading(true);

    console.log("here");

    const mnemonic = localStorage.getItem("mnemonic");
    const accountAddress = localStorage.getItem("accountAddress");
    if (mnemonic) {
      console.log(useGasManager);
      const client = await createClient({
        mnemonic,
        bundlerClient,
        accountAddress: (accountAddress as `0x${string}`) || undefined,
        useGasManager,
      });
      setClient(client);
    }
    setIsLoading(false);
  }, [bundlerClient, useGasManager]);

  const importAccount = useCallback(async () => {
    const mnemonic = createMnemonic();

    const signer = LocalAccountSigner.mnemonicToAccountSigner(mnemonic);

    return { address: await signer.getAddress(), mnemonic };
  }, []);

  useEffect(() => {
    login();
  }, [login]);

  const signup = useCallback(async () => {
    setIsLoading(true);

    const mnemonic = createMnemonic();
    console.log(mnemonic);
    localStorage.setItem("mnemonic", mnemonic);
    const client = await createClient({ mnemonic, bundlerClient });
    setClient(client);

    setIsLoading(false);
  }, [bundlerClient]);

  const resetAccount = useCallback(() => {
    localStorage.removeItem("mnemonic");
    localStorage.removeItem("accountAddress");
    setClient(null);
  }, []);

  return { client, isLoading, login, signup, importAccount, resetAccount };
};
