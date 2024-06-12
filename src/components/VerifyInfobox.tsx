"use client";

import { CSSProperties, FC, PropsWithChildren, useContext } from "react";

import NewReleasesIcon from "@mui/icons-material/NewReleases";
import ReportIcon from "@mui/icons-material/Report";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import { SignClientTypes } from "@walletconnect/types";
import { VerifyContext } from "@/app/providers";

/**
 * Types
 */
interface IProps {
  metadata: SignClientTypes.Metadata;
}

/**
 * Styles
 */

const StyledContainer: FC<PropsWithChildren & { style: CSSProperties }> = ({
  children,
  style,
}) => (
  <div
    style={{
      ...style,
      padding: "7px",
      borderRadius: "30px",
      marginTop: "10px",
      marginBottom: "10px",
    }}
  >
    {children}
  </div>
);

const StyledUnknownRow: FC<PropsWithChildren> = ({ children }) => (
  <StyledContainer style={{ color: "#FFA500", border: "0.5px solid #FFA500" }}>
    {children}
  </StyledContainer>
);

const StyledUnknownContainer: FC<PropsWithChildren> = ({ children }) => (
  <div style={{ textAlign: "initial" }}>{children}</div>
);

const StyledInvalidRow: FC<PropsWithChildren> = ({ children }) => (
  <StyledContainer style={{ color: "#FF0000", border: "0.5px solid #FF0000" }}>
    {children}
  </StyledContainer>
);

const StyledInvalidContainer: FC<PropsWithChildren> = ({ children }) => (
  <div style={{ textAlign: "initial" }}>{children}</div>
);

const StyledDescription: FC<PropsWithChildren> = ({ children }) => (
  <p style={{ margin: "auto", fontSize: "15px" }}>{children}</p>
);

/**
 * Components
 */
export default function VerifyInfobox({ metadata }: IProps) {
  const verifyContextData = useContext(VerifyContext);

  const validation = verifyContextData?.verifyContext?.verified.validation;

  return (
    <div style={{ textAlign: "center" }}>
      {verifyContextData?.verifyContext?.verified.isScam ? (
        <StyledInvalidRow>
          <div style={{ margin: "auto" }}>
            <NewReleasesIcon style={{ verticalAlign: "bottom" }} />
          </div>
          <div style={{ margin: "auto" }}>
            <div className="flex">Known secury risk</div>
            <div className="flex">
              <StyledInvalidContainer>
                <StyledDescription>
                  This website is flagged as unsafe by multiple security
                  reports. Leave immediately to protect your assets.
                </StyledDescription>
              </StyledInvalidContainer>
            </div>
          </div>
        </StyledInvalidRow>
      ) : validation == "UNKNOWN" ? (
        <StyledUnknownRow>
          <div style={{ margin: "auto" }}>
            <ReportIcon style={{ verticalAlign: "bottom" }} />
          </div>
          <div style={{ margin: "auto" }}>
            <div className="flex">
              <StyledUnknownContainer>Unknown domain</StyledUnknownContainer>
            </div>
            <div className="flex">
              <StyledUnknownContainer>
                <StyledDescription>
                  This domain cannot be verified. Please check the request
                  carefully before approving.
                </StyledDescription>
              </StyledUnknownContainer>
            </div>
          </div>
        </StyledUnknownRow>
      ) : validation == "INVALID" ? (
        <StyledInvalidRow>
          <div style={{ margin: "auto" }}>
            <ReportProblemIcon style={{ verticalAlign: "bottom" }} />
          </div>
          <div style={{ margin: "auto" }}>
            <div className="flex">
              <>Domain mismatch</>
            </div>
            <div className="flex">
              <StyledInvalidContainer>
                <StyledDescription>
                  This website has a domain that does not match the sender of
                  this request. Approving may lead to loss of funds.
                </StyledDescription>
              </StyledInvalidContainer>
            </div>
          </div>
        </StyledInvalidRow>
      ) : null}
    </div>
  );
}
