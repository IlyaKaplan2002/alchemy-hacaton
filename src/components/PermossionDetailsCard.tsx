"use client";

type PermissionAction = {
  description: string;
};

interface IProps {
  scope: PermissionAction[];
}

export default function PermissionDetailsCard({ scope }: IProps) {
  return (
    <div className="flex">
      <div>
        <h5>Dapp is requesting following permissions</h5>
        {scope.map((action, index) => {
          return (
            <p className="text-gray-400" key={index}>
              {action.description}
            </p>
          );
        })}
      </div>
    </div>
  );
}
