"use client";

import { LogInCard } from "@/components/LogInCard";
import { ProfileCard } from "@/components/ProfileCard";
import { useAccount } from "@/hooks/useAccount";
import { useEffect } from "react";

export default function Home() {
  const {
    client,
    isLoading,
    login,
    signup,
    resetAccount,
    isOwner,
    exitAccount,
    ownersLoaded,
    getOwners,
    getUserData,
    owners,
  } = useAccount({
    useGasManager: true,
  });

  useEffect(() => {
    if (!client) {
      getOwners();
      getUserData(true);

      return;
    }

    let notSetLoading = false;
    const i = setInterval(() => {
      getUserData(true);
      getOwners(notSetLoading);
      notSetLoading = true;
    }, 1000);

    return () => clearInterval(i);
  }, [getOwners, getUserData, client]);

  console.log(client, isOwner);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-[20px]">
      {isLoading || !ownersLoaded ? (
        <div className="flex items-center justify-center">
          <div
            className="text-surface inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white"
            role="status"
          ></div>
        </div>
      ) : client ? (
        isOwner ? (
          <ProfileCard
            resetAccount={resetAccount}
            exitAccount={exitAccount}
            owners={owners}
            getOwners={getOwners}
          />
        ) : (
          <div
            className="flex min-w-80 flex-col justify-center rounded-lg bg-[#0F172A] p-10"
            style={{ maxWidth: "95vw" }}
          >
            <div className="text-center text-[18px] font-semibold">
              Please approve this device on the previous device
            </div>

            <button
              className="w-full transform rounded-lg bg-[red] p-3 font-semibold text-[#FBFDFF] transition duration-500 ease-in-out hover:scale-105"
              onClick={resetAccount}
            >
              Cancel
            </button>
          </div>
        )
      ) : (
        <LogInCard
          login={login}
          signup={signup}
          isOwner={isOwner}
          ownersLoaded={ownersLoaded}
        />
      )}
    </main>
  );
}
