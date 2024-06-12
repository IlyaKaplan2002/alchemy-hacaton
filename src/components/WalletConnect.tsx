"use client";

import { Button, Input, Spinner } from "@nextui-org/react";
import { Fragment, useContext, useEffect, useMemo, useState } from "react";

import { ModalContext } from "@/app/providers";
import QrReader from "@/components/QrReader";
import { parseUri } from "@walletconnect/utils";
import { web3wallet } from "@/helpers/walletConnect";

export default function WalletConnectPage(params: { deepLink?: string }) {
  const { deepLink } = params;
  const [uri, setUri] = useState("");
  const [loading, setLoading] = useState(false);

  const modalData = useContext(ModalContext);

  const setModalOpen = useMemo(
    () => modalData?.setModalOpen || (() => {}),
    [modalData?.setModalOpen],
  );

  async function onConnect(uri: string) {
    const { topic: pairingTopic } = parseUri(uri);
    // if for some reason, the proposal is not received, we need to close the modal when the pairing expires (5mins)
    const pairingExpiredListener = ({ topic }: { topic: string }) => {
      if (pairingTopic === topic) {
        setModalOpen(false);
        web3wallet.core.pairing.events.removeListener(
          "pairing_expire",
          pairingExpiredListener,
        );
      }
    };
    web3wallet.once("session_proposal", () => {
      web3wallet.core.pairing.events.removeListener(
        "pairing_expire",
        pairingExpiredListener,
      );
    });
    try {
      setLoading(true);
      web3wallet.core.pairing.events.on(
        "pairing_expire",
        pairingExpiredListener,
      );
      await web3wallet.pair({ uri });
    } catch (error) {
      setModalOpen(false);
    } finally {
      setLoading(false);
      setUri("");
    }
  }

  useEffect(() => {
    if (deepLink) {
      onConnect(deepLink);
    }
  }, [deepLink]);

  return (
    <Fragment>
      <>
        <QrReader onConnect={onConnect} />

        <p
          style={{
            fontSize: "13px",
            textAlign: "center",
            marginTop: "$10",
            marginBottom: "$10",
          }}
        >
          or use walletconnect uri
        </p>

        <Input
          style={{ width: "100%" }}
          variant="bordered"
          aria-label="wc url connect input"
          placeholder="e.g. wc:a281567bb3e4..."
          onChange={(e) => setUri(e.target.value)}
          value={uri}
          data-testid="uri-input"
          endContent={
            <Button
              size="sm"
              disabled={!uri}
              style={{ marginLeft: "-60px" }}
              onClick={() => onConnect(uri)}
              color="primary"
              data-testid="uri-connect-button"
            >
              {loading ? <Spinner size="md" color={"white"} /> : "Connect"}
            </Button>
          }
        />
      </>
    </Fragment>
  );
}
