"use client";

import { Divider, Link } from "@nextui-org/react";
import { FC, PropsWithChildren } from "react";

import { CoreTypes } from "@walletconnect/types";
import NewReleasesIcon from "@mui/icons-material/NewReleases";
import RequestModalContainer from "@/components/RequestModalContainer";

interface IProps {
  metadata: CoreTypes.Metadata;
  onApprove: () => void;
  onReject: () => void;
}

const StyledLink: FC<PropsWithChildren> = ({ children }) => (
  <span style={{ color: "#697177" }}>{children}</span>
);

const StyledProceedButton: FC<PropsWithChildren & { onClick: () => void }> = ({
  children,
  onClick,
}) => (
  <p
    style={{
      margin: "10px auto",
      padding: "10px",
      color: "#FF0000",
      cursor: "pointer",
    }}
    onClick={onClick}
  >
    {children}
  </p>
);

const StyledCloseButton: FC<PropsWithChildren> = ({ children }) => (
  <p
    style={{
      margin: "auto",
      padding: "10px",
      border: "1px solid #FF0000",
      borderRadius: "30px",
      cursor: "pointer",
    }}
  >
    {children}
  </p>
);

export default function ThreatPrompt({
  metadata,
  onApprove,
  onReject,
}: IProps) {
  const { url } = metadata;

  return (
    <RequestModalContainer title="">
      <div style={{ textAlign: "center", padding: "20px" }}>
        <div className="flex">
          <div>
            <NewReleasesIcon
              sx={{ fontSize: "55px", color: "$error" }}
              color="error"
            />
          </div>
        </div>
        <div className="flex items-center">
          <div>
            <h3>Website flagged</h3>
          </div>
        </div>
        <div className="flex items-center">
          <div>
            <Link
              style={{ verticalAlign: "middle" }}
              href={url}
              data-testid="session-info-card-url"
            >
              <StyledLink>{url}</StyledLink>
            </Link>
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <Divider />
          <p>
            This website you`re trying to connect is flagged as malicious by
            multiple security providers. Approving may lead to loss of funds.
          </p>
          <div className="flex">
            <StyledProceedButton onClick={onApprove}>
              Proceed anyway
            </StyledProceedButton>
          </div>
          <div className="flex">
            <div
              style={{ margin: "auto", cursor: "pointer" }}
              onClick={onReject}
            >
              <StyledCloseButton>Close</StyledCloseButton>
            </div>
          </div>
        </div>
      </div>
    </RequestModalContainer>
  );
}
