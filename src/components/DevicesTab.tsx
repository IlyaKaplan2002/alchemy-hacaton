import { FC, useContext, useMemo, useState } from "react";

import { Chain } from "viem/chains";
import DeviceItem from "./DeviceItem";
import { UserContext } from "@/app/providers";
import { useInitData } from "@vkruglikov/react-telegram-web-app";

interface Props {
  chain: Chain;
  owners: `0x${string}`[];
}

const DevicesTab: FC<Props> = ({ chain, owners }) => {
  const userData = useContext(UserContext);

  const [initDataUnsafe, initData] = useInitData();

  return (
    <>
      {userData?.user?.devices && initData && initDataUnsafe && (
        <>
          {userData.user.devices.map((device) => (
            <DeviceItem
              key={device.publicKey}
              device={device}
              chain={chain}
              owners={owners}
              initData={initData}
              initDataUnsafe={initDataUnsafe}
              setUserData={userData.setUser}
              accountAddress={userData?.user && userData.user.accountAddress}
            />
          ))}
        </>
      )}
    </>
  );
};

export default DevicesTab;
