"use client";

import { Checkbox, Code } from "@nextui-org/react";
import { ModalContext, SessionContext, UserContext } from "@/app/providers";
import {
  buildAuthObject,
  getSdkError,
  populateAuthPayload,
} from "@walletconnect/utils";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";

import { AccountContext } from "@/app/accountProvider";
import { METHODS } from "@/helpers/constants";
import RequestModal from "./RequestModal";
import { web3wallet } from "@/helpers/walletConnect";

export default function SessionAuthenticateModal() {
  // Get request and wallet data from store
  const modalData = useContext(ModalContext);

  const authRequest = useMemo(
    () => modalData?.modalData?.authRequest,
    [modalData?.modalData],
  );

  const setModalOpen = useMemo(
    () => modalData?.setModalOpen || (() => {}),
    [modalData?.setModalOpen],
  );

  const userData = useContext(UserContext);

  const address = useMemo(
    () => userData?.user?.accountAddress,
    [userData?.user],
  );

  const accountData = useContext(AccountContext);

  const client = useMemo(
    () => accountData?.clientWithoutGasManager,
    [accountData?.clientWithoutGasManager],
  );

  const sessionContextData = useContext(SessionContext);

  const setSessions = useMemo(
    () => sessionContextData?.setSessions || (() => {}),
    [sessionContextData?.setSessions],
  );

  const [messages, setMessages] = useState<
    { authPayload: any; message: string; id: number; iss: string }[]
  >([]);
  const [supportedChains] = useState<string[]>(["eip155:137", "eip155:42161"]);
  const [supportedMethods] = useState<string[]>(Object.values(METHODS));
  const [signStrategy, setSignStrategy] = useState(1);
  // Ensure request and wallet are defined

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const getMessageToSign = useCallback(
    (authPayload: any, iss: any) => {
      const message = web3wallet.engine.signClient.formatAuthMessage({
        request: authPayload,
        iss,
      });
      console.log("message", message);
      return message;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [address],
  );

  useEffect(() => {
    if (!authRequest?.params?.authPayload) return;
    console.log("authRequest", authRequest);
    console.log("supportedChains", supportedChains);
    const newAuthPayload = populateAuthPayload({
      authPayload: authRequest?.params?.authPayload,
      chains: supportedChains,
      methods: supportedMethods,
    });

    if (signStrategy === 1) {
      try {
        console.log("newAuthPayload", newAuthPayload);
        const iss = `${newAuthPayload.chains[0]}:${address}`;
        const message = getMessageToSign(newAuthPayload, iss);
        setMessages([
          {
            authPayload: newAuthPayload,
            message,
            id: authRequest.id,
            iss,
          },
        ]);
      } catch (e) {
        console.log("error", e);

        setModalOpen(false);
      }
    } else if (signStrategy === 2) {
      const messagesToSign: any[] = [];
      newAuthPayload.chains.forEach((chain: string) => {
        const iss = `${chain}:${address}`;
        const message = web3wallet.engine.signClient.formatAuthMessage({
          request: newAuthPayload,
          iss,
        });
        messagesToSign.push({
          authPayload: newAuthPayload,
          message,
          iss,
          id: authRequest.id,
        });
      });
      setMessages(messagesToSign);
    }
  }, [
    address,
    authRequest,
    getMessageToSign,
    setModalOpen,
    signStrategy,
    supportedChains,
    supportedMethods,
  ]);

  // Handle approve action (logic varies based on request method)
  const onApprove = useCallback(async () => {
    if (messages.length && client?.account) {
      const signedAuths = [];
      for (const message of messages) {
        const signature = await client.signMessage({
          message: message.message,
          account: client.account,
        });
        const signedCacao = buildAuthObject(
          message.authPayload,
          {
            t: "eip191",
            s: signature,
          },
          message.iss,
        );
        signedAuths.push(signedCacao);
      }

      await web3wallet.engine.signClient.approveSessionAuthenticate({
        id: messages[0].id,
        auths: signedAuths,
      });
      setSessions(Object.values(web3wallet.getActiveSessions()));
      setModalOpen(false);
    }
  }, [client, messages, setModalOpen, setSessions]);

  // Handle reject action
  const onReject = useCallback(async () => {
    if (authRequest?.params?.authPayload) {
      await web3wallet.engine.signClient.rejectSessionAuthenticate({
        id: authRequest.id,
        reason: getSdkError("USER_REJECTED"),
      });

      setModalOpen(false);
    }
  }, [authRequest, setModalOpen]);

  return (
    <RequestModal
      intention="request a signature"
      metadata={authRequest?.params?.requester.metadata!}
      onApprove={onApprove}
      onReject={onReject}
    >
      <div className="grid">
        <div>
          <Checkbox
            onChange={() => setSignStrategy(1)}
            checked={signStrategy === 1}
          >
            Sign One
          </Checkbox>
        </div>
        <div style={{ marginLeft: "10px" }}>
          <Checkbox
            onChange={() => setSignStrategy(2)}
            checked={signStrategy === 2}
          >
            Sign All
          </Checkbox>
        </div>
      </div>
      <div className="flex">
        <div>
          <h5>Messages to Sign ({messages.length})</h5>
          {messages.map((message, index) => {
            console.log("@loop messageToSign", message);
            return (
              <Code key={index}>
                <p className="text-gray-400">{message.message}</p>
              </Code>
            );
          })}
        </div>
      </div>
    </RequestModal>
  );
}
