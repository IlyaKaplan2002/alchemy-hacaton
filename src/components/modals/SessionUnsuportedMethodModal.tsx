"use client";

import { Button, Divider, ModalFooter } from "@nextui-org/react";
import { Fragment, useContext, useMemo } from "react";

import { ModalContext } from "@/app/providers";
import ProjectInfoCard from "@/components/ProjectInfoCard";
import RequestMethodCard from "@/components/RequestMethodCard";
import RequestModalContainer from "@/components/RequestModalContainer";

export default function SessionUnsuportedMethodModal() {
  // Get request and wallet data from store
  const modalData = useContext(ModalContext);

  const requestEvent = useMemo(
    () => modalData?.modalData?.requestEvent,
    [modalData?.modalData?.requestEvent],
  );
  const requestSession = useMemo(
    () => modalData?.modalData?.requestSession,
    [modalData?.modalData?.requestSession],
  );

  const params = useMemo(() => requestEvent?.params, [requestEvent?.params]);
  const request = useMemo(() => params?.request, [params?.request]);

  const setModalOpen = useMemo(
    () => modalData?.setModalOpen || (() => {}),
    [modalData?.setModalOpen],
  );

  // Ensure request and wallet are defined
  if (!requestEvent || !requestSession) {
    return <p>Missing request data</p>;
  }

  return (
    <Fragment>
      <RequestModalContainer title="Unsuported Method">
        <ProjectInfoCard metadata={requestSession.peer.metadata} />

        <Divider />

        <RequestMethodCard methods={[request?.method as string]} />
      </RequestModalContainer>
      <ModalFooter>
        <Button
          fullWidth
          variant="flat"
          color="danger"
          onClick={() => setModalOpen(false)}
        >
          Close
        </Button>
      </ModalFooter>
    </Fragment>
  );
}
