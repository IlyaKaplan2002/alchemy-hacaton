import { useState } from "react";

const ExportAccount = () => {
  const [isExported, setIsExported] = useState(false);

  return (
    <div className="flex flex-col">
      {!isExported ? (
        <button
          className="w-full transform rounded-lg bg-[#363FF9] p-3 font-semibold text-[#FBFDFF] transition duration-500 ease-in-out hover:scale-105 disabled:bg-[#4252C5] disabled:bg-[#C0D4FF] disabled:hover:scale-100"
          onClick={() => setIsExported(true)}
        >
          Show seed phrase
        </button>
      ) : (
        <>
          <strong>Seed Phrase</strong>
          <p>{localStorage.getItem("mnemonic")}</p>
        </>
      )}
    </div>
  );
};

export default ExportAccount;
