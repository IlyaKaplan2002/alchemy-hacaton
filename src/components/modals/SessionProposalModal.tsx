"use client";

import {
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { ModalContext, SessionContext, UserContext } from "@/app/providers";
import { buildApprovedNamespaces, getSdkError } from "@walletconnect/utils";

import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";
import { METHODS } from "@/helpers/constants";
import RequestModal from "./RequestModal";
import { SignClientTypes } from "@walletconnect/types";
import { web3wallet } from "@/helpers/walletConnect";

const StyledText: FC<PropsWithChildren> = ({ children }) => (
  <h4 style={{ fontWeight: 400 }}>{children}</h4>
);

const StyledSpan: FC<PropsWithChildren> = ({ children }) => (
  <span style={{ fontWeight: 400 }}>{children}</span>
);

export default function SessionProposalModal() {
  const modalData = useContext(ModalContext);

  const setModalOpen = useMemo(
    () => modalData?.setModalOpen || (() => {}),
    [modalData?.setModalOpen],
  );

  const proposal = useMemo(
    () =>
      modalData?.modalData
        ?.proposal as SignClientTypes.EventArguments["session_proposal"],
    [modalData?.modalData?.proposal],
  );

  const sessionData = useContext(SessionContext);

  const setSessions = useMemo(
    () => sessionData?.setSessions || (() => {}),
    [sessionData?.setSessions],
  );

  const userData = useContext(UserContext);

  const [isLoadingApprove, setIsLoadingApprove] = useState(false);
  const [isLoadingReject, setIsLoadingReject] = useState(false);

  const supportedNamespaces = useMemo(() => {
    // eip155
    const eip155Chains = ["eip155:137", "eip155:42161"];
    const eip155Methods = Object.values(METHODS);

    return {
      eip155: {
        chains: eip155Chains,
        methods: eip155Methods,
        events: ["accountsChanged", "chainChanged"],
        accounts: eip155Chains
          .map((chain) => `${chain}:${userData?.user?.accountAddress}`)
          .flat(),
      },
    };
  }, [userData?.user?.accountAddress]);

  const namespaces = useMemo(() => {
    try {
      return buildApprovedNamespaces({
        proposal: proposal.params,
        supportedNamespaces,
      });
    } catch (e) {}
  }, [proposal.params, supportedNamespaces]);

  const onApprove = useCallback(async () => {
    if (proposal && namespaces) {
      setIsLoadingApprove(true);
      try {
        await web3wallet.approveSession({
          id: proposal.id,
          namespaces,
        });
        setSessions(Object.values(web3wallet.getActiveSessions()));
      } catch (e) {
        setIsLoadingApprove(false);

        return;
      }
    }
    setIsLoadingApprove(false);
    setModalOpen(false);
  }, [namespaces, proposal, setModalOpen, setSessions]);

  // Hanlde reject action
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const onReject = useCallback(async () => {
    if (proposal) {
      try {
        setIsLoadingReject(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await web3wallet.rejectSession({
          id: proposal.id,
          reason: getSdkError("USER_REJECTED_METHODS"),
        });
      } catch (e) {
        setIsLoadingReject(false);
        return;
      }
    }
    setIsLoadingReject(false);
    setModalOpen(false);
  }, [proposal, setModalOpen]);

  return (
    <RequestModal
      metadata={proposal.params.proposer.metadata}
      onApprove={onApprove}
      onReject={onReject}
      approveLoader={{ active: isLoadingApprove }}
      rejectLoader={{ active: isLoadingReject }}
      infoBoxText={`The session cannot be approved because the wallet does not the support some or all of the proposed chains. Please inspect the console for more information.`}
    >
      <div className="flex">
        <div>
          <StyledText>Requested permissions</StyledText>
        </div>
      </div>
      <div className="flex">
        <div>
          <DoneIcon style={{ verticalAlign: "bottom" }} />{" "}
          <StyledSpan>View your balance and activity</StyledSpan>
        </div>
      </div>
      <div className="flex">
        <div>
          <DoneIcon style={{ verticalAlign: "bottom" }} />{" "}
          <StyledSpan>Send approval requests</StyledSpan>
        </div>
      </div>
      <div className="flex">
        <div style={{ color: "gray" }}>
          <CloseIcon style={{ verticalAlign: "bottom" }} />
          <StyledSpan>Move funds without permission</StyledSpan>
        </div>
      </div>
    </RequestModal>
  );
}
