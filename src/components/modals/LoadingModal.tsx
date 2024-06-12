"use client";

import { Divider, Spinner } from "@nextui-org/react";
import { useContext, useMemo } from "react";

import { ModalContext } from "@/app/providers";
import RequestModalContainer from "@/components/RequestModalContainer";

export default function LoadingModal() {
  const modalData = useContext(ModalContext);

  const message = useMemo(
    () => modalData?.modalData?.loadingMessage || "",
    [modalData?.modalData?.loadingMessage],
  );

  return (
    <RequestModalContainer title="">
      <div style={{ textAlign: "center", padding: "20px" }}>
        <div className="flex">
          <div>
            <Spinner size="lg" />
          </div>
        </div>
        <div className="flex items-center">
          <div>
            <h3>Loading your request...</h3>
          </div>
        </div>
        {message ? (
          <div style={{ textAlign: "center" }}>
            <Divider />
            <p>{message}</p>
          </div>
        ) : null}
      </div>
    </RequestModalContainer>
  );
}
