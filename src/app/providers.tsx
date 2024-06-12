"use client";

import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  Suspense,
  createContext,
  useState,
} from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionTypes, SignClientTypes, Verify } from "@walletconnect/types";

import { AlchemyAccountProvider } from "@alchemy/aa-alchemy/react";
import { Chain } from "viem";
import { IUser } from "@/api/apiService";
import { NextUIProvider } from "@nextui-org/react";
import { Web3WalletTypes } from "@walletconnect/web3wallet";
import { WebAppProvider } from "@vkruglikov/react-telegram-web-app";
import { createConfig } from "@alchemy/aa-alchemy/config";
import { polygonAmoy } from "@alchemy/aa-core";
import { updateSignClientChainId } from "@/helpers/walletConnect";

export interface IChainContext {
  chain: Chain;
  setChain: (chain: Chain) => void;
}

export interface ModalData {
  proposal?: SignClientTypes.EventArguments["session_proposal"];
  requestEvent?: SignClientTypes.EventArguments["session_request"];
  requestSession?: SessionTypes.Struct;
  request?: Web3WalletTypes.AuthRequest;
  loadingMessage?: string;
  authRequest?: SignClientTypes.EventArguments["session_authenticate"];
}

export enum EModalType {
  SessionProposalModal = "SessionProposalModal",
  AuthRequestModal = "AuthRequestModal",
  SessionSignModal = "SessionSignModal",
  SessionSignTypedDataModal = "SessionSignTypedDataModal",
  SessionSendTransactionModal = "SessionSendTransactionModal",
  SessionUnsuportedMethodModal = "SessionUnsuportedMethodModal",
  SessionAuthenticateModal = "SessionAuthenticateModal",
  LoadingModal = "LoadingModal",
}

export const ChainContext = createContext<IChainContext | null>(null);

export interface IUserContext {
  user: IUser | null;
  setUser: Dispatch<SetStateAction<IUser | null>>;
}

export const UserContext = createContext<IUserContext | null>(null);

export interface IModalContext {
  modalOpen: boolean;
  setModalOpen: Dispatch<SetStateAction<boolean>>;
  modalType: EModalType | null;
  setModalType: Dispatch<SetStateAction<EModalType | null>>;
  modalData: ModalData | null;
  setModalData: Dispatch<SetStateAction<ModalData | null>>;
}

export const ModalContext = createContext<IModalContext | null>(null);

export interface IVerifyContext {
  verifyContext: Verify.Context | null;
  setVerifyContext: Dispatch<SetStateAction<Verify.Context | null>>;
}

export const VerifyContext = createContext<IVerifyContext | null>(null);

export interface ISessionsContext {
  sessions: SessionTypes.Struct[];
  setSessions: Dispatch<SetStateAction<SessionTypes.Struct[]>>;
}

export const SessionContext = createContext<ISessionsContext | null>(null);

export const Providers = (props: PropsWithChildren) => {
  const [chain, setChain] = useState<Chain>(polygonAmoy);
  const [user, setUser] = useState<IUser | null>(null);
  const [verifyContext, setVerifyContext] = useState<Verify.Context | null>(
    null,
  );
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalType, setModalType] = useState<EModalType | null>(null);
  const [modalData, setModalData] = useState<ModalData | null>(null);
  const [sessions, setSessions] = useState<SessionTypes.Struct[]>([]);

  const queryClient = new QueryClient();
  const config = createConfig({
    rpcUrl: chain.id === polygonAmoy.id ? "api/amoy/rpc" : "api/sepolia/rpc",
    chain,
  });

  const chainData = {
    chain,
    setChain: async (chain: Chain) => {
      if (!user) return;
      setChain(chain);
      await updateSignClientChainId(`eip155:${chain.id}`, user.accountAddress);
    },
  };
  const userData = { user, setUser };

  return (
    <Suspense>
      <WebAppProvider>
        <QueryClientProvider client={queryClient}>
          <AlchemyAccountProvider config={config} queryClient={queryClient}>
            <NextUIProvider>
              <ChainContext.Provider value={chainData}>
                <UserContext.Provider value={userData}>
                  <ModalContext.Provider
                    value={{
                      modalOpen,
                      setModalOpen,
                      modalType,
                      setModalType,
                      modalData,
                      setModalData,
                    }}
                  >
                    <VerifyContext.Provider
                      value={{ verifyContext, setVerifyContext }}
                    >
                      <SessionContext.Provider
                        value={{ sessions, setSessions }}
                      >
                        {props.children}
                      </SessionContext.Provider>
                    </VerifyContext.Provider>
                  </ModalContext.Provider>
                </UserContext.Provider>
              </ChainContext.Provider>
            </NextUIProvider>
          </AlchemyAccountProvider>
        </QueryClientProvider>
      </WebAppProvider>
    </Suspense>
  );
};
