"use client";

import {
  JsonRpcError,
  JsonRpcResult,
  formatJsonRpcError,
  formatJsonRpcResult,
} from "@json-rpc-tools/utils";
import { useCallback, useContext, useMemo, useState } from "react";

import { AccountContext } from "@/app/accountProvider";
/* eslint-disable react-hooks/rules-of-hooks */
import { Divider } from "@nextui-org/react";
import { ModalContext } from "@/app/providers";
import PermissionDetailsCard from "../PermossionDetailsCard";
import RequestDataCard from "@/components/RequestDataCard";
import RequestMethodCard from "@/components/RequestMethodCard";
import RequestModal from "./RequestModal";
import { getSdkError } from "@walletconnect/utils";
import { getSignTypedDataParamsData } from "@/helpers/common";
import { web3wallet } from "@/helpers/walletConnect";

export default function SessionSignTypedDataModal() {
  const modalData = useContext(ModalContext);

  const requestEvent = useMemo(
    () => modalData?.modalData?.requestEvent,
    [modalData?.modalData?.requestEvent],
  );
  const requestSession = useMemo(
    () => modalData?.modalData?.requestSession,
    [modalData?.modalData?.requestSession],
  );

  const setModalOpen = useMemo(
    () => modalData?.setModalOpen || (() => {}),
    [modalData?.setModalOpen],
  );

  const accountData = useContext(AccountContext);

  const client = useMemo(
    () => accountData?.clientWithGasManager,
    [accountData?.clientWithGasManager],
  );

  const [isLoadingApprove, setIsLoadingApprove] = useState(false);
  const [isLoadingReject, setIsLoadingReject] = useState(false);

  const topic = useMemo(() => requestEvent?.topic, [requestEvent?.topic]);
  const params = useMemo(() => requestEvent?.params, [requestEvent?.params]);

  const request = useMemo(() => params?.request, [params?.request]);

  // Get data
  const data = useMemo(
    () => getSignTypedDataParamsData(request?.params),
    [request?.params],
  );

  console.log("data", data);

  const isPermissionRequest = useMemo(
    () => data?.domain?.name === "eth_getPermissions_v1",
    [data?.domain?.name],
  );

  const method = useMemo(
    () => (isPermissionRequest ? "eth_getPermissions_v1" : request?.method),
    [isPermissionRequest, request?.method],
  );

  const permissionScope = useMemo(() => {
    let result = [];
    if (isPermissionRequest) {
      result = data?.message?.scope || [];
      console.log({ result });
    }

    return result;
  }, [data?.message?.scope, isPermissionRequest]);

  // Handle approve action (logic varies based on request method)
  const onApprove = useCallback(async () => {
    if (requestEvent && topic && client?.account) {
      setIsLoadingApprove(true);

      let response: JsonRpcResult | JsonRpcError | null = null;

      try {
        const signature = await client?.signTypedData({
          typedData: data,
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
  }, [client, data, requestEvent, setModalOpen, topic]);

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
      intention="sign a message"
      metadata={requestSession.peer.metadata}
      onApprove={onApprove}
      onReject={onReject}
      approveLoader={{ active: isLoadingApprove }}
      rejectLoader={{ active: isLoadingReject }}
    >
      {isPermissionRequest && permissionScope.length > 0 ? (
        <PermissionDetailsCard scope={permissionScope} />
      ) : (
        <RequestDataCard data={data} />
      )}
      <Divider />
      <RequestMethodCard methods={[method as string]} />
    </RequestModal>
  );
}
