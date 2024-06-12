"use client";

/**
 * Types
 */
interface IProps {
  methods: string[];
}

/**
 * Component
 */
export default function RequestMethodCard({ methods }: IProps) {
  return (
    <div className="flex">
      <div>
        <h5>Methods</h5>
        <p className="text-gray-400" data-testid="request-methods">
          {methods.map((method) => method).join(", ")}
        </p>
      </div>
    </div>
  );
}
