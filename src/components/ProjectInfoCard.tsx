"use client";

import { Avatar, Link } from "@nextui-org/react";
import { FC, PropsWithChildren, useContext } from "react";

import NewReleasesIcon from "@mui/icons-material/NewReleases";
import ReportIcon from "@mui/icons-material/Report";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import { SignClientTypes } from "@walletconnect/types";
import { VerifyContext } from "@/app/providers";

interface IProps {
  metadata: SignClientTypes.Metadata;
  intention?: string;
}

const StyledLink: FC<PropsWithChildren> = ({ children }) => (
  <span style={{ color: "#697177" }}>{children}</span>
);

const StyledVerifiedIcon: FC = () => (
  <img
    src="/icons/verified-domain.svg"
    style={{ verticalAlign: "middle", marginRight: "5px" }}
    alt="Verified Domain"
  />
);

const StyledUnknownRow: FC<PropsWithChildren> = ({ children }) => (
  <div className="flex" style={{ color: "#FFA500" }}>
    {children}
  </div>
);

const StyledUnknownContainer: FC<PropsWithChildren> = ({ children }) => (
  <div style={{ padding: "7px" }}>{children}</div>
);

const StyledInvalidRow: FC<PropsWithChildren> = ({ children }) => (
  <div className="flex" style={{ color: "#FF0000" }}>
    {children}
  </div>
);

const StyledInvalidContainer: FC<PropsWithChildren> = ({ children }) => (
  <div style={{ padding: "7px" }}>{children}</div>
);

/**
 * Components
 */
export default function ProjectInfoCard({ metadata, intention }: IProps) {
  const verifyContextData = useContext(VerifyContext);

  const validation = verifyContextData?.verifyContext?.verified.validation;

  const { icons, name, url } = metadata;

  return (
    <div style={{ textAlign: "center" }}>
      <div className="flex">
        <div>
          <Avatar style={{ margin: "auto" }} src={icons[0]} size={"lg"} />
        </div>
      </div>
      <div className="flex items-center">
        <div>
          <h3 data-testid="session-info-card-text">
            <span>{name}</span> <br />
            <h4> wants to {intention ? intention : "connect"}</h4>
          </h3>
        </div>
      </div>
      <div className="flex items-center">
        <div>
          {validation == "VALID" ? <StyledVerifiedIcon /> : null}
          <Link
            style={{ verticalAlign: "middle" }}
            href={url}
            data-testid="session-info-card-url"
          >
            <StyledLink>{url}</StyledLink>
          </Link>
        </div>
      </div>
      {verifyContextData?.verifyContext?.verified.isScam ? (
        <StyledInvalidRow>
          <div style={{ margin: "auto" }}>
            <StyledInvalidContainer>
              <NewReleasesIcon style={{ verticalAlign: "bottom" }} />
              Potential threat
            </StyledInvalidContainer>
          </div>
        </StyledInvalidRow>
      ) : validation == "UNKNOWN" ? (
        <StyledUnknownRow>
          <div style={{ margin: "auto" }}>
            <StyledUnknownContainer>
              <ReportIcon style={{ verticalAlign: "bottom" }} />
              Cannot Verify
            </StyledUnknownContainer>
          </div>
        </StyledUnknownRow>
      ) : validation == "INVALID" ? (
        <StyledInvalidRow>
          <div style={{ margin: "auto" }}>
            <StyledInvalidContainer>
              <ReportProblemIcon
                style={{ verticalAlign: "bottom", marginRight: "2px" }}
              />
              Invalid Domain
            </StyledInvalidContainer>
          </div>
        </StyledInvalidRow>
      ) : null}
    </div>
  );
}
