import { ethers } from 'ethers';

// Replace these with your actual details
const CONTRACT_ADDRESS = "0xYourContractAddressHere";
const VENDORGUARD_ABI = [
  "function balances(address) view returns (uint256)",
  "function getLockedFunds(address) view returns (uint256)",
  "function withdrawFunds() public"
];

export const getMerchantData = async () => {
  if (typeof window.ethereum !== 'undefined') {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, VENDORGUARD_ABI, signer);

      const rawBalance = await contract.balances(address);
      const rawEscrow = await contract.getLockedFunds(address);

      return {
        balance: ethers.utils.formatEther(rawBalance),
        pending: ethers.utils.formatEther(rawEscrow),
        address: address
      };
    } catch (error) {
      console.error("Blockchain fetch error:", error);
      return null;
    }
  }
  return null;
};