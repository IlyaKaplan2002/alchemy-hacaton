"use client";

import { Fragment, ReactNode } from "react";
import { ModalBody, ModalHeader } from "@nextui-org/react";

/**
 * Types
 */
interface IProps {
  title?: string;
  children: ReactNode | ReactNode[];
}

/**
 * Component
 */
export default function RequestModalContainer({ children, title }: IProps) {
  return (
    <Fragment>
      {title ? (
        <ModalHeader>
          <h3>{title}</h3>
        </ModalHeader>
      ) : null}
      <ModalBody>
        <div style={{ padding: 0 }}>{children}</div>
      </ModalBody>
    </Fragment>
  );
}
