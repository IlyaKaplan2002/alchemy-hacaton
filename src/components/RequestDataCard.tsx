"use client";

import { CodeBlock, codepen } from "react-code-blocks";

/**
 * Types
 */
interface IProps {
  data: Record<string, unknown>;
}

/**
 * Component
 */
export default function RequestDataCard({ data }: IProps) {
  return (
    <div className="flex">
      <div>
        <h5>Data</h5>
        <CodeBlock
          showLineNumbers={false}
          text={JSON.stringify(data, null, 2)}
          theme={codepen}
          language="json"
        />
      </div>
    </div>
  );
}
