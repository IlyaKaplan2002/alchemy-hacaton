"use client";

import { ModalContext, UserContext } from "@/app/providers";
/* eslint-disable react-hooks/rules-of-hooks */
import { useCallback, useContext, useMemo, useState } from "react";

import { AccountContext } from "@/app/accountProvider";
import { Code } from "@nextui-org/react";
import RequestModal from "./RequestModal";
import { getSdkError } from "@walletconnect/utils";
import { web3wallet } from "@/helpers/walletConnect";

export default function AuthRequestModal() {
  const [isLoadingApprove, setIsLoadingApprove] = useState(false);
  const [isLoadingReject, setIsLoadingReject] = useState(false);

  //   const accountData = useContext(AccountContext);
  const userData = useContext(UserContext);

  const accountData = useContext(AccountContext);

  const client = useMemo(
    () => accountData?.clientWithoutGasManager,
    [accountData?.clientWithoutGasManager],
  );

  // Get request and wallet data from store
  const modalData = useContext(ModalContext);

  const request = useMemo(
    () => modalData?.modalData?.request,
    [modalData?.modalData],
  );
  const setModalOpen = useMemo(
    () => modalData?.setModalOpen || (() => {}),
    [modalData?.setModalOpen],
  );

  // Ensure request and wallet are defined
  if (!request) {
    return <p>Missing request data</p>;
  }

  const address = useMemo(
    () => userData?.user?.accountAddress,
    [userData?.user],
  );
  const iss = `did:pkh:eip155:1:${address}`;

  // Get required request data
  const { params } = request;

  const message = web3wallet.formatMessage(params.cacaoPayload, iss);

  // Handle approve action (logic varies based on request method)
  const onApprove = useCallback(async () => {
    if (request && client?.account) {
      setIsLoadingApprove(true);
      const signature = await client.signMessage({
        message,
        account: client.account,
      });
      await web3wallet.respondAuthRequest(
        {
          id: request.id,
          signature: {
            s: signature,
            t: "eip191",
          },
        },
        iss,
      );
      setIsLoadingApprove(false);
      setModalOpen(false);
    }
  }, [request, client, message, iss, setModalOpen]);

  // Handle reject action
  const onReject = useCallback(async () => {
    if (request) {
      setIsLoadingReject(true);
      await web3wallet.respondAuthRequest(
        {
          id: request.id,
          error: getSdkError("USER_REJECTED"),
        },
        iss,
      );
      setIsLoadingReject(false);
      setModalOpen(false);
    }
  }, [request, iss, setModalOpen]);

  return (
    <RequestModal
      intention="request a signature"
      metadata={request.params.requester.metadata}
      onApprove={onApprove}
      onReject={onReject}
      approveLoader={{ active: isLoadingApprove }}
      rejectLoader={{ active: isLoadingReject }}
    >
      <div className="flex">
        <div>
          <h5>Message</h5>
          <Code>
            <p className="text-gray-400">{message}</p>
          </Code>
        </div>
      </div>
    </RequestModal>
  );
}
