"use client";

import { Fragment, ReactNode, useContext, useMemo, useState } from "react";
import ModalFooter, { LoaderProps } from "../ModalFooter";

import { CoreTypes } from "@walletconnect/types";
import { Divider } from "@nextui-org/react";
import ProjectInfoCard from "@/components/ProjectInfoCard";
import RequestModalContainer from "../RequestModalContainer";
import ThreatPrompt from "../TheatPrompt";
import { VerifyContext } from "@/app/providers";
import VerifyInfobox from "../VerifyInfobox";

interface IProps {
  children: ReactNode;
  metadata: CoreTypes.Metadata;
  onApprove: () => void;
  onReject: () => void;
  intention?: string;
  infoBoxCondition?: boolean;
  infoBoxText?: string;
  approveLoader?: LoaderProps;
  rejectLoader?: LoaderProps;
  disableApprove?: boolean;
  disableReject?: boolean;
}
export default function RequestModal({
  children,
  metadata,
  onApprove,
  onReject,
  approveLoader,
  rejectLoader,
  intention,
  infoBoxCondition,
  infoBoxText,
  disableApprove,
  disableReject,
}: IProps) {
  const verifyContextData = useContext(VerifyContext);

  const isScam = verifyContextData?.verifyContext?.verified.isScam;

  const [threatAcknowledged, setThreatAcknowledged] = useState(false);

  const threatPromptContent = useMemo(() => {
    return (
      <ThreatPrompt
        metadata={metadata}
        onApprove={() => setThreatAcknowledged(true)}
        onReject={onReject}
      />
    );
  }, [metadata, onReject]);

  const modalContent = useMemo(() => {
    return (
      <>
        <RequestModalContainer title="">
          <ProjectInfoCard metadata={metadata} intention={intention} />
          <Divider />
          {children}
          <Divider />
          <VerifyInfobox metadata={metadata} />
        </RequestModalContainer>
        <ModalFooter
          onApprove={onApprove}
          onReject={onReject}
          approveLoader={approveLoader}
          rejectLoader={rejectLoader}
          infoBoxCondition={infoBoxCondition}
          infoBoxText={infoBoxText}
          disableApprove={disableApprove}
          disableReject={disableReject}
        />
      </>
    );
  }, [
    approveLoader,
    children,
    infoBoxCondition,
    infoBoxText,
    intention,
    metadata,
    onApprove,
    onReject,
    rejectLoader,
    disableApprove,
    disableReject,
  ]);
  return (
    <Fragment>
      {isScam && !threatAcknowledged ? threatPromptContent : modalContent}
    </Fragment>
  );
}
