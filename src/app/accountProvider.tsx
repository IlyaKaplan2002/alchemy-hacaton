import { IAccountState, useAccount } from "@/hooks/useAccount";
import { PropsWithChildren, createContext } from "react";

export const AccountContext = createContext<IAccountState | null>(null);

const AccountProvider = (props: PropsWithChildren) => {
  const accountData = useAccount();

  return (
    <AccountContext.Provider value={accountData}>
      {props.children}
    </AccountContext.Provider>
  );
};

export default AccountProvider;
