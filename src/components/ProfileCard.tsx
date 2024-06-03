"use client";

import { ChainContext, UserContext } from "@/app/providers";
import {
  FC,
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from "@headlessui/react";
import { polygonAmoy, sepolia } from "@alchemy/aa-core";

import DevicesTab from "./DevicesTab";
import NewDevicePopup from "./NewDevicePopup";
import SendERC20TokenPopup from "./SendERC20TokenPopup";
import SendNativeTokenPopup from "./SendNativeTokenPopup";
import clsx from "clsx";
import { useAccount } from "@/hooks/useAccount";
import { useInitData } from "@vkruglikov/react-telegram-web-app";

export const ERC20_ABI = [
  {
    constant: true,
    inputs: [],
    name: "symbol",
    outputs: [
      {
        name: "",
        type: "string",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        name: "_to",
        type: "address",
      },
      {
        name: "_value",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        name: "",
        type: "bool",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [
      {
        name: "",
        type: "uint8",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      {
        name: "_owner",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        name: "balance",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
];

export interface IERC20Token {
  symbol: string;
  decimals: number;
  address: `0x${string}`;
  balance: number;
}

interface Props {
  resetAccount: () => void;
  exitAccount: () => void;
}

export const ProfileCard: FC<Props> = ({ resetAccount, exitAccount }) => {
  const [balance, setBalance] = useState(0);
  const [tokenAddress, setTokenAddress] = useState("");
  const [importedTokens, setImportedTokens] = useState<IERC20Token[]>([]);
  const [tokensWithBalances, setTokensWithBalances] = useState<IERC20Token[]>(
    [],
  );
  const [erc20DialogToken, setERC20DialogToken] = useState<IERC20Token | null>(
    null,
  );
  const [isNativeTokenDialogOpen, setIsNativeTokenDialogOpen] = useState(false);

  const [initDataUnsafe, initData] = useInitData();

  const chainContext = useContext(ChainContext);

  const chain = chainContext?.chain || polygonAmoy;
  const setChain = chainContext?.setChain || (() => {});

  const { client, owners, getOwners } = useAccount({ useGasManager: false });

  const userData = useContext(UserContext);

  const handleImportToken = useCallback(async () => {
    if (!client) return;

    const symbol = await client.readContract({
      functionName: "symbol",
      address: tokenAddress as `0x${string}`,
      abi: ERC20_ABI,
    });

    const decimals = await client.readContract({
      functionName: "decimals",
      address: tokenAddress as `0x${string}`,
      abi: ERC20_ABI,
    });

    setImportedTokens((prev) => {
      const newImportedTokens: IERC20Token[] = [
        ...prev,
        {
          symbol: symbol as string,
          decimals: Number(decimals),
          address: tokenAddress as `0x${string}`,
          balance: 0,
        },
      ];

      localStorage.setItem(
        `importedTokens.${chain.id}`,
        JSON.stringify(newImportedTokens),
      );

      return newImportedTokens;
    });
    setTokenAddress("");
  }, [chain.id, client, tokenAddress]);

  useEffect(() => {
    const newImportedTokens = localStorage.getItem(
      `importedTokens.${chain.id}`,
    );

    if (newImportedTokens) {
      setImportedTokens(JSON.parse(newImportedTokens));
    }
  }, [chain.id]);

  const devicesToApprove = useMemo(() => {
    return (
      userData?.user?.devices?.filter(
        (device) =>
          !owners.includes(device.publicKey) &&
          device.publicKey !== localStorage.getItem("accountOwner"),
      ) || []
    );
  }, [owners, userData?.user?.devices]);

  const getERC20Balances = useCallback(async () => {
    if (!client?.account?.address) return;

    const balances: IERC20Token[] = await Promise.all(
      importedTokens.map(async (token) => {
        const balance = await client.readContract({
          functionName: "balanceOf",
          address: token.address as `0x${string}`,
          abi: ERC20_ABI,
          args: [client.account?.address],
        });

        return {
          ...token,
          balance: Number(balance) / 10 ** token.decimals,
        };
      }),
    );

    setTokensWithBalances(balances);
  }, [client, importedTokens]);

  useEffect(() => {
    getERC20Balances();
  }, [getERC20Balances]);

  const getBalance = useCallback(async () => {
    if (!client?.account?.address) return;

    const balanceGwei = await client.getBalance({
      address: client.account?.address as `0x${string}`,
    });

    setBalance(Number(balanceGwei) / 10 ** 18);
  }, [client]);

  useEffect(() => {
    getBalance();
  }, [getBalance]);

  return (
    <>
      <TabGroup
        className="w-full rounded-lg bg-[#0F172A] p-10"
        style={{ maxWidth: "95vw" }}
      >
        <TabList className="mb-5 ml-auto mr-auto flex w-fit">
          <Tab as={Fragment}>
            {({ hover, selected }) => (
              <button
                className={clsx(
                  "mr-5 rounded-lg py-1.5 pl-3 pr-3 text-left text-sm/6 text-white focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25",
                  (selected || hover) && "bg-white/5",
                )}
              >
                Account
              </button>
            )}
          </Tab>
          <Tab as={Fragment}>
            {({ hover, selected }) => (
              <button
                className={clsx(
                  "mr-5 rounded-lg py-1.5 pl-3 pr-3 text-left text-sm/6 text-white focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25",
                  (selected || hover) && "bg-white/5",
                )}
              >
                Device management
              </button>
            )}
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel
            className="flex flex-col gap-8"
            style={{
              width: "100%",
            }}
          >
            <Listbox value={chain} onChange={setChain}>
              <ListboxButton className="relative block w-full rounded-lg bg-white/5 py-1.5 pl-3 pr-8 text-left text-sm/6 text-white focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25">
                {chain.name}
              </ListboxButton>
              <ListboxOptions
                anchor="bottom"
                className="w-[var(--button-width)] rounded-xl border border-white/5 bg-[#0b1328] p-1 [--anchor-gap:var(--spacing-1)] focus:outline-none"
              >
                {[polygonAmoy, sepolia].map((chain) => (
                  <ListboxOption
                    key={chain.id}
                    value={chain}
                    className="group flex cursor-default select-none items-center gap-2 rounded-lg px-3 py-1.5 data-[focus]:bg-white/10"
                  >
                    {chain.name}
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </Listbox>

            <div className="flex justify-between">
              <div className="text-lg font-semibold">
                Welcome to your profile!
              </div>
              <button
                onClick={() => {
                  getBalance();
                  getERC20Balances();
                }}
                className=" transform rounded-lg bg-[#363FF9] p-3 font-semibold text-[#FBFDFF] transition duration-500 ease-in-out hover:scale-105"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                  />
                </svg>
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div>Account address</div>
                <div className="flex gap-2">
                  <div className="overflow-hidden text-ellipsis text-wrap rounded-lg bg-[#1F2937] p-3 text-[#CBD5E1]">
                    {client?.account?.address}
                  </div>
                  <button
                    className="transform rounded-lg bg-[#363FF9] p-3 font-semibold text-[#FBFDFF] transition duration-500 ease-in-out hover:scale-105"
                    onClick={() =>
                      navigator.clipboard.writeText(
                        client?.account?.address || "",
                      )
                    }
                  >
                    Copy
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div>Native balance</div>
                <div className="flex gap-2">
                  <div className="w-full text-wrap rounded-lg bg-[#1F2937] p-3 text-[#CBD5E1]">
                    {balance}
                  </div>
                  <button
                    className="transform rounded-lg bg-[#363FF9] p-3 font-semibold text-[#FBFDFF] transition duration-500 ease-in-out hover:scale-105"
                    onClick={() => setIsNativeTokenDialogOpen(true)}
                  >
                    Send
                  </button>
                </div>
              </div>
              {tokensWithBalances.map((token) => (
                <div className="flex flex-col gap-2" key={token.address}>
                  <div>{token.symbol} balance</div>
                  <div className="flex gap-2">
                    <div className="w-full text-wrap rounded-lg bg-[#1F2937] p-3 text-[#CBD5E1]">
                      {token.balance}
                    </div>

                    <button
                      className="transform rounded-lg bg-[#363FF9] p-3 font-semibold text-[#FBFDFF] transition duration-500 ease-in-out hover:scale-105"
                      onClick={() => setERC20DialogToken(token)}
                    >
                      Send
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-8">
              <div className="text-[18px] font-semibold">
                Import ERC20 token
              </div>
              <div className="flex flex-col justify-between gap-6">
                <input
                  className="rounded-lg border border-[#475569] bg-slate-700 p-3 text-white placeholder:text-[#E2E8F0]"
                  type="text"
                  placeholder="Enter token address"
                  value={tokenAddress}
                  onChange={(e) => setTokenAddress(e.target.value)}
                />
                <button
                  className="w-full transform rounded-lg bg-[#363FF9] p-3 font-semibold text-[#FBFDFF] transition duration-500 ease-in-out hover:scale-105"
                  onClick={handleImportToken}
                >
                  Import
                </button>
              </div>
            </div>

            <SendERC20TokenPopup
              isOpen={!!erc20DialogToken}
              onClose={() => setERC20DialogToken(null)}
              token={erc20DialogToken}
              chain={chain}
            />

            <SendNativeTokenPopup
              isOpen={isNativeTokenDialogOpen}
              onClose={() => setIsNativeTokenDialogOpen(false)}
              chain={chain}
            />

            {/* <AddOwner chain={chain} /> */}

            <div className="flex gap-4">
              <button
                className="w-full transform rounded-lg bg-[red] p-3 font-semibold text-[#FBFDFF] transition duration-500 ease-in-out hover:scale-105"
                onClick={exitAccount}
              >
                Exit
              </button>

              <button
                className="w-full transform rounded-lg bg-[red] p-3 font-semibold text-[#FBFDFF] transition duration-500 ease-in-out hover:scale-105"
                onClick={resetAccount}
              >
                Delete Account
              </button>
            </div>
          </TabPanel>
          <TabPanel
            className="flex flex-col gap-8"
            style={{
              width: "100%",
            }}
          >
            <DevicesTab chain={chain} owners={owners} getOwners={getOwners} />
          </TabPanel>
        </TabPanels>
      </TabGroup>
      {userData?.user?.devices &&
        initData &&
        initDataUnsafe &&
        devicesToApprove[0] &&
        owners.length && (
          <NewDevicePopup
            isOpen={!!devicesToApprove[0]}
            device={devicesToApprove[0]}
            chain={chain}
            getOwners={getOwners}
            initData={initData}
            initDataUnsafe={initDataUnsafe}
            setUserData={userData.setUser}
            accountAddress={userData?.user && userData.user.accountAddress}
          />
        )}
    </>
  );
};
