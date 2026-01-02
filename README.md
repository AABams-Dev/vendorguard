# VendorGuard 🛡️ 
### *The Trust-Bridge for Social Commerce*

VendorGuard is a professional escrow-based payment platform designed to eliminate fraud in social media commerce (Instagram, WhatsApp, X). By acting as a secure intermediary, VendorGuard protects buyers from "pay-before-delivery" scams and protects sellers from "payment-on-delivery" losses.

---

## 🚀 The Problem & Solution

### The Friction
- **Buyer Risk:** Customers fear being blocked after payment or receiving low-quality items.
- **Seller Risk:** Merchants lose money on logistics when buyers change their minds after dispatch.

### The VendorGuard Solution: "The Safe-Link"
VendorGuard provides a **Secure Escrow Link**. Funds are held securely in a smart-contract-style logic and are only released to the merchant once the buyer confirms receipt of the goods.

---

## ✨ Core Features

- **Merchant Dashboard:** A high-end fintech interface to track revenue flow, merchant trust scores, and network health.
- **Secure Link Generator:** Instant generation of payment links with item details, pricing, and lock durations.
- **Escrow-as-a-Service:** Funds are partitioned into *Withdrawable Balance* vs. *Locked Escrow* to ensure transparency.
- **Developer Suite:** API access and webhook configurations for custom storefront integrations.
- **On-Chain Ready:** Built with Ethers.js integration for Base Network settlements.

---

## 🛠️ Technical Stack

- **Frontend:** React.js (Vite)
- **Styling:** Tailwind CSS (Modern "Dark-Mode" Fintech UI)
- **Icons:** Lucide-React
- **Charts:** Recharts (Revenue & Flow Visualization)
- **Blockchain:** Ethers.js (Base Mainnet ready)
- **State Management:** React Hooks (Memoization for performance)

---

## 📖 User Flow

1. **Create:** Merchant generates a "Safe-Link" for a product (e.g., *Custom Sneakers – 0.05 ETH*).
2. **Secure:** Buyer pays via the link; VendorGuard holds funds in escrow.
3. **Notify:** Merchant receives a "Payment Secured" notification and ships the item.
4. **Release:** Buyer confirms delivery, and funds are moved to the Merchant's withdrawable balance.
5. **Settle:** Merchant claims funds to their wallet.

---

## ⚙️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/AABams-Dev/vendorguard.git](https://github.com/AABams-Dev/vendorguard.git)