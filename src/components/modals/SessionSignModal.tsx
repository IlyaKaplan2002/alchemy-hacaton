"use client";

import {
  JsonRpcError,
  JsonRpcResult,
  formatJsonRpcError,
  formatJsonRpcResult,
} from "@json-rpc-tools/utils";
import { useCallback, useContext, useMemo, useState } from "react";

import { AccountContext } from "@/app/accountProvider";
import { ModalContext } from "@/app/providers";
import RequestModal from "./RequestModal";
import { getSdkError } from "@walletconnect/utils";
import { getSignParamsMessage } from "@/helpers/common";
import { web3wallet } from "@/helpers/walletConnect";

export default function SessionSignModal() {
  // Get request and wallet data from store

  const modalData = useContext(ModalContext);

  const setModalOpen = useMemo(
    () => modalData?.setModalOpen || (() => {}),
    [modalData?.setModalOpen],
  );

  const requestEvent = useMemo(
    () => modalData?.modalData?.requestEvent,
    [modalData?.modalData?.requestEvent],
  );
  const requestSession = useMemo(
    () => modalData?.modalData?.requestSession,
    [modalData?.modalData?.requestSession],
  );

  const [isLoadingApprove, setIsLoadingApprove] = useState(false);
  const [isLoadingReject, setIsLoadingReject] = useState(false);

  const topic = useMemo(() => requestEvent?.topic, [requestEvent?.topic]);
  const params = useMemo(() => requestEvent?.params, [requestEvent?.params]);
  const request = useMemo(() => params?.request, [params?.request]);

  const accountData = useContext(AccountContext);

  const client = useMemo(
    () => accountData?.clientWithoutGasManager,
    [accountData?.clientWithoutGasManager],
  );

  // Get message, convert it to UTF8 string if it is valid hex
  const message = useMemo(
    () => (request?.params ? getSignParamsMessage(request.params) : ""),
    [request?.params],
  );

  // Handle approve action (logic varies based on request method)
  const onApprove = useCallback(async () => {
    if (requestEvent && topic && client?.account) {
      setIsLoadingApprove(true);

      let response: JsonRpcResult | JsonRpcError | null = null;

      try {
        const signature = await client.signMessage({
          message,
          account: client.account,
        });

        response = formatJsonRpcResult(requestEvent.id, signature);
      } catch (error: any) {
        response = formatJsonRpcError(requestEvent.id, error.message);
      }

      try {
        await web3wallet.respondSessionRequest({
          topic,
          response,
        });
      } catch (e) {
        setIsLoadingApprove(false);

        return;
      }
      setIsLoadingApprove(false);
      setModalOpen(false);
    }
  }, [client, message, requestEvent, setModalOpen, topic]);

  // Handle reject action
  const onReject = useCallback(async () => {
    if (requestEvent && topic) {
      setIsLoadingReject(true);
      const response = formatJsonRpcError(
        requestEvent.id,
        getSdkError("USER_REJECTED").message,
      );
      try {
        await web3wallet.respondSessionRequest({
          topic,
          response,
        });
      } catch (e) {
        setIsLoadingReject(false);

        return;
      }
      setIsLoadingReject(false);
      setModalOpen(false);
    }
  }, [requestEvent, setModalOpen, topic]);

  // Ensure request and wallet are defined
  if (!requestEvent || !requestSession) {
    return <p>Missing request data</p>;
  }

  return (
    <RequestModal
      intention="request a signature"
      metadata={requestSession.peer.metadata}
      onApprove={onApprove}
      onReject={onReject}
      approveLoader={{ active: isLoadingApprove }}
      rejectLoader={{ active: isLoadingReject }}
    >
      <div className="flex">
        <div>
          <h5>Message</h5>
          <p className="text-gray-400" data-testid="request-message-text">
            {message}
          </p>
        </div>
      </div>
    </RequestModal>
  );
}
