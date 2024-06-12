"use client";

import { EModalType, ModalContext } from "@/app/providers";
import { useCallback, useContext, useMemo } from "react";

import AuthRequestModal from "./modals/AuthRequestModal";
import LoadingModal from "./modals/LoadingModal";
import { Modal as NextModal } from "@nextui-org/react";
import SessionAuthenticateModal from "./modals/SessionAuthenticateModal";
import SessionProposalModal from "./modals/SessionProposalModal";
import SessionSendTransactionModal from "./modals/SessionSendTransactionModal";
import SessionSignModal from "./modals/SessionSignModal";
import SessionSignTypedDataModal from "./modals/SessionSignTypedDataModal";
import SessionUnsuportedMethodModal from "./modals/SessionUnsuportedMethodModal";

export default function Modal() {
  const modalData = useContext(ModalContext);

  console.log("modalData", modalData);

  const open = useMemo(
    () => modalData?.modalOpen || false,
    [modalData?.modalOpen],
  );

  const view = useMemo(
    () => modalData?.modalType || null,
    [modalData?.modalType],
  );

  const setModalOpen = useMemo(
    () => modalData?.setModalOpen || (() => {}),
    [modalData?.setModalOpen],
  );

  // handle the modal being closed by click outside
  const onClose = useCallback(() => {
    if (open) {
      setModalOpen(false);
    }
  }, [open, setModalOpen]);

  const componentView = useMemo(() => {
    switch (view) {
      case EModalType.SessionProposalModal:
        return <SessionProposalModal />;
      case EModalType.SessionSignModal:
        return <SessionSignModal />;
      case EModalType.SessionSignTypedDataModal:
        return <SessionSignTypedDataModal />;
      case EModalType.SessionSendTransactionModal:
        return <SessionSendTransactionModal />;
      case EModalType.SessionUnsuportedMethodModal:
        return <SessionUnsuportedMethodModal />;
      case EModalType.AuthRequestModal:
        return <AuthRequestModal />;
      case EModalType.LoadingModal:
        return <LoadingModal />;
      case EModalType.SessionAuthenticateModal:
        return <SessionAuthenticateModal />;
      default:
        return null;
    }
  }, [view]);

  console.log("componentView", componentView);

  return (
    <NextModal
      backdrop="blur"
      onClose={onClose}
      isOpen={open}
      className="relative z-50"
      style={{ border: "1px solid rgba(139, 139, 139, 0.4)" }}
    >
      <div
        className="fixed inset-0 flex w-screen items-center justify-center p-4"
        style={{ background: "rgba(0, 0, 0, 0.8)" }}
      >
        test
        {componentView}
      </div>
    </NextModal>
  );
}
