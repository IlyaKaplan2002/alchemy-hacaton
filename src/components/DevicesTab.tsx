import { FC, useContext, useMemo, useState } from "react";

import { Chain } from "viem/chains";
import DeviceItem from "./DeviceItem";
import NewDevicePopup from "./NewDevicePopup";
import { UserContext } from "@/app/providers";
import { useInitData } from "@vkruglikov/react-telegram-web-app";

interface Props {
  chain: Chain;
  owners: `0x${string}`[];
  getOwners: () => Promise<void>;
}

const DevicesTab: FC<Props> = ({ chain, owners, getOwners }) => {
  const userData = useContext(UserContext);

  const [initDataUnsafe, initData] = useInitData();

  const devicesToApprove = useMemo(() => {
    return (
      userData?.user?.devices?.filter(
        (device) => !owners.includes(device.publicKey),
      ) || []
    );
  }, [owners, userData?.user?.devices]);

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
              getOwners={getOwners}
              initData={initData}
              initDataUnsafe={initDataUnsafe}
              setUserData={userData.setUser}
              accountAddress={userData?.user && userData.user.accountAddress}
            />
          ))}
          <NewDevicePopup
            isOpen={!!devicesToApprove[0]}
            device={devicesToApprove[0]}
            chain={chain}
            getOwners={getOwners}
            initData={initData}
            initDataUnsafe={initDataUnsafe}
            setUserData={userData.setUser}
            accountAddress={userData?.user && userData.user.accountAddress}
          />
        </>
      )}
    </>
  );
};

export default DevicesTab;
