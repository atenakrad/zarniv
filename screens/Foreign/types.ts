/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface GoldRate {
  id: string;
  name: string; // e.g., "Gold 24K", "Silver 999", "GBP Spot Gold"
  purity: number; // e.g., 0.999, 0.916 (22K), 0.750 (18K)
  pricePerGram: number; // calculated dynamically in GBP
  change24h: number; // percentage change
  buySpread: number; // crafting markup or dealer margin (e.g., +2%)
  sellSpread: number; // scrap discount (e.g., -4%)
}

export interface JewelryItem {
  id: string;
  name: string;
  category: "rings" | "necklaces" | "bracelets" | "earrings" | "bullion";
  karat: 24 | 22 | 18 | 14 | 9 | 0; // 0 for silver / bullion
  metalType: "Gold" | "Silver" | "Platinum";
  weightGram: number;
  basePremiumGBP: number; // flat design & crafting fee
  image: string; // URL from custom placeholders or generated
  description: string;
  isPopular?: boolean;
  rating: number;
  reviews: number;
}

export interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  serviceType: "View Jewelry" | "Sell Scrap Gold" | "Bespoke Design" | "Valuation Service";
  notes?: string;
  status: "Confirmed" | "Pending";
}

export interface PriceAlert {
  id: string;
  targetPrice: number;
  karat: string; // e.g., "24K", "18K", "Spot"
  condition: "Above" | "Below";
  isActive: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}
