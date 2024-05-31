import { FC, useContext } from "react";

import { Chain } from "viem/chains";
import DeviceItem from "./DeviceItem";
import { UserContext } from "@/app/providers";

interface Props {
  chain: Chain;
  owners: `0x${string}`[];
  getOwners: () => Promise<void>;
}

const DevicesTab: FC<Props> = ({ chain, owners, getOwners }) => {
  const userData = useContext(UserContext);

  return (
    <>
      {userData?.user?.devices &&
        userData.user.devices.map((device) => (
          <DeviceItem
            key={device.publicKey}
            device={device}
            chain={chain}
            owners={owners}
            getOwners={getOwners}
          />
        ))}
    </>
  );
};

export default DevicesTab;
