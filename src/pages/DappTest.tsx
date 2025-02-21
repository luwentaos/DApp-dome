// import InfoContractInteraction from '@/components/InfoContractInteraction';
// import { useEffect } from 'react';
// import { useAccount } from 'wagmi';
// const DappTest = () => {
//   const { address, isConnecting, isDisconnected } = useAccount();
//   useEffect(() => {
//     console.log('🍊 ', address);
//   }, [address]);
//   if (isConnecting) return <div>Connecting...</div>;
//   if (isDisconnected) return <div>Disconnected</div>;
//   return <InfoContractInteraction />;
// };
// export default DappTest;

import SaveingDefiInterface from "@/components/common/SaveingDefiInterface";
import MetaMaskCard from "@/components/connectorCards/MetaMaskCard";

const DappTest = () => {
  return (
    <>
      <MetaMaskCard />
      <hr />
      <SaveingDefiInterface />
    </>
  );
}

export default DappTest;