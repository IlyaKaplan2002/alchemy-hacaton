import {
  EModalType,
  ModalContext,
  SessionContext,
  VerifyContext,
} from "@/app/providers";
import { useCallback, useContext, useEffect, useMemo } from "react";

import { METHODS } from "@/helpers/constants";
import { SignClientTypes } from "@walletconnect/types";
import { Web3WalletTypes } from "@walletconnect/web3wallet";
import { web3wallet } from "@/helpers/walletConnect";

export default function useWalletConnectEventsManager(initialized: boolean) {
  const modalData = useContext(ModalContext);

  const setModalOpen = useMemo(
    () => modalData?.setModalOpen || (() => {}),
    [modalData?.setModalOpen],
  );

  const setModalType = useMemo(
    () => modalData?.setModalType || (() => {}),
    [modalData?.setModalType],
  );
  const setModalData = useMemo(
    () => modalData?.setModalData || (() => {}),
    [modalData?.setModalData],
  );

  const verifyContextData = useContext(VerifyContext);

  const setVerifyContext = useMemo(
    () => verifyContextData?.setVerifyContext || (() => {}),
    [verifyContextData?.setVerifyContext],
  );

  const sessionContextData = useContext(SessionContext);

  const setSessions = useMemo(
    () => sessionContextData?.setSessions || (() => {}),
    [sessionContextData?.setSessions],
  );

  /******************************************************************************
   * 1. Open session proposal modal for confirmation / rejection
   *****************************************************************************/
  const onSessionProposal = useCallback(
    (proposal: SignClientTypes.EventArguments["session_proposal"]) => {
      console.log("session_proposal", proposal);
      // set the verify context so it can be displayed in the projectInfoCard
      setVerifyContext(proposal.verifyContext);

      setModalOpen(true);
      setModalType(EModalType.SessionProposalModal);
      setModalData({ proposal });
    },
    [setModalData, setModalOpen, setModalType, setVerifyContext],
  );
  /******************************************************************************
   * 2. Open Auth modal for confirmation / rejection
   *****************************************************************************/
  const onAuthRequest = useCallback(
    (request: Web3WalletTypes.AuthRequest) => {
      setModalOpen(true);
      setModalType(EModalType.AuthRequestModal);
      setModalData({ request });
    },
    [setModalData, setModalOpen, setModalType],
  );

  /******************************************************************************
   * 3. Open request handling modal based on method that was used
   *****************************************************************************/
  const onSessionRequest = useCallback(
    async (requestEvent: SignClientTypes.EventArguments["session_request"]) => {
      const { topic, params, verifyContext, id } = requestEvent;
      const { request } = params;
      const requestSession = web3wallet.engine.signClient.session.get(topic);
      // set the verify context so it can be displayed in the projectInfoCard

      setVerifyContext(verifyContext);

      switch (request.method) {
        case METHODS.ETH_SIGN:
        case METHODS.PERSONAL_SIGN:
          setModalOpen(true);
          setModalType(EModalType.SessionSignModal);
          setModalData({ requestEvent, requestSession });

          return;

        case METHODS.ETH_SIGN_TYPED_DATA:
        case METHODS.ETH_SIGN_TYPED_DATA_V3:
        case METHODS.ETH_SIGN_TYPED_DATA_V4:
          setModalOpen(true);
          setModalType(EModalType.SessionSignTypedDataModal);
          setModalData({ requestEvent, requestSession });

          return;

        case METHODS.ETH_SEND_TRANSACTION:
        case METHODS.ETH_SIGN_TRANSACTION:
          setModalOpen(true);
          setModalType(EModalType.SessionSendTransactionModal);
          setModalData({ requestEvent, requestSession });

          return;
        default:
          setModalOpen(true);
          setModalType(EModalType.SessionUnsuportedMethodModal);
          setModalData({ requestEvent, requestSession });

          return;
      }
    },
    [setModalData, setModalOpen, setModalType, setVerifyContext],
  );

  const onSessionAuthenticate = useCallback(
    (authRequest: SignClientTypes.EventArguments["session_authenticate"]) => {
      setModalOpen(true);
      setModalType(EModalType.SessionAuthenticateModal);
      setModalData({ authRequest });
    },
    [setModalData, setModalOpen, setModalType],
  );

  /******************************************************************************
   * Set up WalletConnect event listeners
   *****************************************************************************/

  const setListeners = useCallback(() => {
    console.log("here web3wallet", web3wallet);

    if (!web3wallet) {
      setTimeout(() => setListeners(), 1000);
      return;
    }

    if (web3wallet) {
      //sign
      console.log("here");
      web3wallet.on("session_proposal", onSessionProposal);
      web3wallet.on("session_request", onSessionRequest);
      // auth
      web3wallet.on("auth_request", onAuthRequest);
      // TODOs
      web3wallet.engine.signClient.events.on("session_ping", (data) =>
        console.log("ping", data),
      );
      web3wallet.on("session_delete", (data) => {
        console.log("session_delete event received", data);
        setSessions(Object.values(web3wallet.getActiveSessions()));
      });
      web3wallet.on("session_authenticate", onSessionAuthenticate);
      // load sessions on init
      setSessions(Object.values(web3wallet.getActiveSessions()));
    }
  }, [
    onAuthRequest,
    onSessionAuthenticate,
    onSessionProposal,
    onSessionRequest,
    setSessions,
  ]);

  useEffect(() => {
    if (!initialized) return;
    setListeners();
  }, [initialized, setListeners]);
}
