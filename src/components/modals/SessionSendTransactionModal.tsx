"use client";

import {
  JsonRpcError,
  JsonRpcResult,
  formatJsonRpcError,
  formatJsonRpcResult,
} from "@json-rpc-tools/utils";
import { useCallback, useContext, useMemo, useState } from "react";

import { AccountContext } from "@/app/accountProvider";
import { Divider } from "@nextui-org/react";
import { ModalContext } from "@/app/providers";
import RequestDataCard from "../RequestDataCard";
import RequestMethodCard from "../RequestMethodCard";
import RequestModal from "./RequestModal";
import { fromHex } from "viem";
import { getSdkError } from "@walletconnect/utils";
import { web3wallet } from "@/helpers/walletConnect";

export default function SessionSendTransactionModal() {
  const [isLoadingApprove, setIsLoadingApprove] = useState(false);
  const [isLoadingReject, setIsLoadingReject] = useState(false);

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

  const setModalOpen = useMemo(
    () => modalData?.setModalOpen || (() => {}),
    [modalData?.setModalOpen],
  );

  const topic = useMemo(() => requestEvent?.topic, [requestEvent?.topic]);
  const params = useMemo(() => requestEvent?.params, [requestEvent?.params]);
  const request = useMemo(() => params?.request, [params?.request]);
  const transaction = useMemo(
    () =>
      request?.params[0] as {
        from: `0x${string}`;
        to: `0x${string}`;
        data: `0x${string}`;
        nonce: `0x${string}`;
        gasPrice: `0x${string}`;
        gasLimit: `0x${string}`;
        value: `0x${string}`;
      },
    [request?.params],
  );

  const accountData = useContext(AccountContext);

  const client = useMemo(
    () => accountData?.clientWithGasManager,
    [accountData?.clientWithGasManager],
  );

  // Handle approve action
  const onApprove = useCallback(async () => {
    if (requestEvent && topic && client?.account) {
      setIsLoadingApprove(true);
      try {
        let response: JsonRpcResult | JsonRpcError | null = null;
        try {
          const uo = await client.sendUserOperation({
            uo: {
              target: transaction.to,
              // value: BigInt(
              //   Number(fromHex(transaction.value, "bigint")) * 10 ** 18,
              // ),
              value: BigInt(0.002 * 10 ** 18), // 0.001 ETH
              data: transaction.data,
            },
            account: client.account,
          });

          const txHash = await client.waitForUserOperationTransaction(uo);
          response = formatJsonRpcResult(requestEvent.id, txHash);
        } catch (error: any) {
          response = formatJsonRpcError(requestEvent.id, error.message);
        }

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
  }, [
    client,
    requestEvent,
    setModalOpen,
    topic,
    transaction.data,
    transaction.to,
  ]);

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

  return request && requestSession ? (
    <RequestModal
      intention="sign a transaction"
      metadata={requestSession?.peer.metadata}
      onApprove={onApprove}
      onReject={onReject}
      approveLoader={{ active: isLoadingApprove }}
      rejectLoader={{ active: isLoadingReject }}
    >
      <RequestDataCard data={transaction} />
      <Divider />
      <RequestMethodCard methods={[request.method]} />
    </RequestModal>
  ) : (
    <p>Request not found</p>
  );
}
