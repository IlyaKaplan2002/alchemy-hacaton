import { LocalAccountSigner, SmartAccountClient } from "@alchemy/aa-core";
import { createClient, createMnemonic } from "@/helpers/createAccount";
import { useCallback, useContext, useEffect, useState } from "react";

import { ChainContext } from "@/app/providers";
import { polygon } from "viem/chains";
import { useBundlerClient } from "@alchemy/aa-alchemy/react";

interface Props {
  useGasManager: boolean;
}

export const useAccount = ({ useGasManager }: Props) => {
  const [isLoading, setIsLoading] = useState(true);
  const [client, setClient] = useState<SmartAccountClient | null>(null);
  const bundlerClient = useBundlerClient();

  const chainData = useContext(ChainContext);

  const chain = chainData?.chain || polygon;

  const login = useCallback(async () => {
    setIsLoading(true);

    const mnemonic = localStorage.getItem("mnemonic");
    const accountAddress = localStorage.getItem("accountAddress");
    if (mnemonic) {
      const client = await createClient({
        mnemonic,
        bundlerClient,
        chain,
        accountAddress: (accountAddress as `0x${string}`) || undefined,
        useGasManager,
      });
      setClient(client);
    }
    setIsLoading(false);
  }, [bundlerClient, chain, useGasManager]);

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

    localStorage.setItem("mnemonic", mnemonic);
    const client = await createClient({ mnemonic, bundlerClient, chain });
    setClient(client);

    setIsLoading(false);
  }, [bundlerClient, chain]);

  const resetAccount = useCallback(() => {
    localStorage.removeItem("mnemonic");
    localStorage.removeItem("accountAddress");
    setClient(null);
  }, []);

  return { client, isLoading, login, signup, importAccount, resetAccount };
};
