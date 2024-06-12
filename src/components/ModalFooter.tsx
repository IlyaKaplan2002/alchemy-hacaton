"use client";

import { Button, ModalFooter as ModalFooterUI } from "@nextui-org/react";
import { useContext, useMemo } from "react";

import { VerifyContext } from "@/app/providers";

export interface LoaderProps {
  color?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger";
  active?: boolean;
}
interface Props {
  onApprove: () => void;
  onReject: () => void;
  infoBoxCondition?: boolean;
  infoBoxText?: string;
  approveLoader?: LoaderProps;
  rejectLoader?: LoaderProps;
  disableApprove?: boolean;
  disableReject?: boolean;
}

export default function ModalFooter({
  onApprove,
  approveLoader,
  onReject,
  rejectLoader,
  infoBoxCondition,
  infoBoxText,
  disableApprove,
  disableReject,
}: Props) {
  const verifyContextData = useContext(VerifyContext);

  const validation = verifyContextData?.verifyContext?.verified?.validation;

  const approveButtonColor: any = useMemo(() => {
    switch (validation) {
      case "INVALID":
        return "danger";
      case "UNKNOWN":
        return "warning";
      default:
        return "success";
    }
  }, [validation]);

  return (
    <ModalFooterUI>
      {infoBoxCondition && (
        <div className="flex" style={{ textAlign: "initial" }}>
          <span>{infoBoxText || ""}</span>
        </div>
      )}
      <div className="flex items-center justify-between">
        <Button
          fullWidth
          style={{ color: "white", backgroundColor: "grey" }}
          onPress={onReject}
          data-testid="session-reject-button"
          disabled={disableReject || rejectLoader?.active}
          variant="flat"
        >
          Reject
        </Button>
        <Button
          fullWidth
          color={approveButtonColor}
          disabled={disableApprove || approveLoader?.active}
          onPress={onApprove}
          data-testid="session-approve-button"
          variant="flat"
          isLoading={approveLoader && approveLoader.active}
        >
          Approve
        </Button>
      </div>
    </ModalFooterUI>
  );
}
