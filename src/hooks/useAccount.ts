import { LocalAccountSigner, SmartAccountClient } from "@alchemy/aa-core";
import { createClient, createMnemonic } from "@/helpers/createAccount";
import { useCallback, useContext, useEffect, useState } from "react";

import { ChainContext } from "@/app/providers";
import { multiOwnerPluginActions } from "@alchemy/aa-accounts";
import { polygon } from "viem/chains";
import { useBundlerClient } from "@alchemy/aa-alchemy/react";

interface Props {
  useGasManager: boolean;
}

export const useAccount = ({ useGasManager }: Props) => {
  const [isLoading, setIsLoading] = useState(true);
  const [client, setClient] = useState<SmartAccountClient | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  console.log(isOwner, "isOwner");

  const bundlerClient = useBundlerClient();

  const chainData = useContext(ChainContext);

  const chain = chainData?.chain || polygon;

  const login = useCallback(async () => {
    setIsLoading(true);

    const mnemonic = localStorage.getItem("mnemonic");

    const accountAddress = localStorage.getItem("accountAddress");
    if (mnemonic) {
      if (!localStorage.getItem("accountOwner")) {
        const signer = LocalAccountSigner.mnemonicToAccountSigner(mnemonic);

        const address = await signer.getAddress();

        localStorage.setItem("accountOwner", address);
      }

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

  const importAccount = useCallback(async (accountAddress: `0x${string}`) => {
    const { mnemonic, address } = await createMnemonic();

    localStorage.setItem("accountAddress", accountAddress);
    localStorage.setItem("mnemonic", mnemonic);
    localStorage.setItem("accountOwner", address);

    return { address, mnemonic };
  }, []);

  useEffect(() => {
    login();
  }, [login]);

  const getIsOwner = useCallback(async () => {
    if (client && localStorage.getItem("accountOwner")) {
      const pluginActionExtendedClient = client.extend(multiOwnerPluginActions);

      if (!pluginActionExtendedClient || !client.account) {
        return;
      }

      console.log({
        account: client.account,
        address: localStorage.getItem("accountOwner") as `0x${string}`,
      });

      const owners = await pluginActionExtendedClient.readOwners({
        account: client.account,
      });

      console.log(owners, "owners");

      const isOwner = await pluginActionExtendedClient.isOwnerOf({
        account: client.account,
        address: localStorage.getItem("accountOwner") as `0x${string}`,
      });

      setIsOwner(isOwner);
    }
  }, [client]);

  useEffect(() => {
    getIsOwner();
  }, [getIsOwner]);

  const signup = useCallback(async () => {
    setIsLoading(true);

    const { mnemonic, address } = await createMnemonic();

    localStorage.setItem("mnemonic", mnemonic);
    localStorage.setItem("accountOwner", address);
    const client = await createClient({ mnemonic, bundlerClient, chain });
    setClient(client);

    setIsLoading(false);
  }, [bundlerClient, chain]);

  const resetAccount = useCallback(() => {
    localStorage.removeItem("mnemonic");
    localStorage.removeItem("accountAddress");
    setClient(null);
  }, []);

  return {
    client,
    isLoading,
    login,
    signup,
    importAccount,
    resetAccount,
    isOwner,
  };
};
