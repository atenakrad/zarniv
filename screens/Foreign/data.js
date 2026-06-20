/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { JewelryItem } from "./types";

export const JEWELRY_INVENTORY: JewelryItem[] = [
  {
    id: "rng-01",
    name: "Aura Signature 22K Royal Sovereign Ring",
    category: "rings",
    karat: 22,
    metalType: "Gold",
    weightGram: 8.5,
    basePremiumGBP: 295,
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&auto=format&fit=crop&q=80",
    description: "Handcrafted in our London workshop, this signature signet ring displays majestic engraving with an incredible burnished gold finish. A timeless statement piece.",
    isPopular: true,
    rating: 4.9,
    reviews: 42
  },
  {
    id: "rng-02",
    name: "Classic 18K Yellow Gold Eternity Band",
    category: "rings",
    karat: 18,
    metalType: "Gold",
    weightGram: 4.2,
    basePremiumGBP: 180,
    image: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600&auto=format&fit=crop&q=80",
    description: "A solid 18K yellow gold band encrusted with micro-pavé CZ detailing. Sleek, comfortable, and perfect for stacking or as an elegant wedding band.",
    isPopular: false,
    rating: 4.7,
    reviews: 18
  },
  {
    id: "nec-01",
    name: "Hatton Garden 24K Pure Gold Herringbone Chain",
    category: "necklaces",
    karat: 24,
    metalType: "Gold",
    weightGram: 18.2,
    basePremiumGBP: 450,
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80",
    description: "A masterwork of London craftsmanship. This pure 24-karat gold liquid-flat herringbone chain flows like fluid light around the neck, secured with a reinforced premium clasp.",
    isPopular: true,
    rating: 5.0,
    reviews: 56
  },
  {
    id: "nec-02",
    name: "Elizabethan 18K Filigree Pendant Necklace",
    category: "necklaces",
    karat: 18,
    metalType: "Gold",
    weightGram: 12.0,
    basePremiumGBP: 310,
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&auto=format&fit=crop&q=80",
    description: "Inspired by classic British monarchial styles, this delicate openwork filigree medallion hangs seamlessly on a luxury 45cm diamond-cut curb chain.",
    isPopular: false,
    rating: 4.8,
    reviews: 23
  },
  {
    id: "brc-01",
    name: "Mayfair 22K Solid Hammered Cuff",
    category: "bracelets",
    karat: 22,
    metalType: "Gold",
    weightGram: 22.5,
    basePremiumGBP: 600,
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&auto=format&fit=crop&q=80",
    description: "An impressive, substantial bracelet with individually hand-hammered indentations that capture the city lights beautifully. Displays a stunning satin-gloss golden luster.",
    isPopular: true,
    rating: 4.9,
    reviews: 31
  },
  {
    id: "brc-02",
    name: "Kensington 18K Linked Cable Bracelet",
    category: "bracelets",
    karat: 18,
    metalType: "Gold",
    weightGram: 9.8,
    basePremiumGBP: 220,
    image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600&auto=format&fit=crop&q=80",
    description: "Solid, highly polished rectangular links connected together with meticulous craftsmanship. Represents the perfect blend of modern minimalism and luxury.",
    isPopular: false,
    rating: 4.6,
    reviews: 14
  },
  {
    id: "ear-01",
    name: "Classic 18K Gold Crescent Hoop Earrings",
    category: "earrings",
    karat: 18,
    metalType: "Gold",
    weightGram: 5.4,
    basePremiumGBP: 140,
    image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600&auto=format&fit=crop&q=80",
    description: "Polished luxury hoops with a comfortable click-down lock. Their crescent profile adds modern fullness and exceptional radiance to your facial frame.",
    isPopular: true,
    rating: 4.8,
    reviews: 29
  },
  {
    id: "bul-01",
    name: "London Bullion Exchange 1oz Fine Gold Bar (999.9)",
    category: "bullion",
    karat: 24,
    metalType: "Gold",
    weightGram: 31.1035,
    basePremiumGBP: 95,
    image: "https://images.unsplash.com/photo-1610375228911-c4abff6941a9?w=600&auto=format&fit=crop&q=80",
    description: "An investment-grade, LBMA-certified pure 24K gold bullion bar. Serialized and fully sealed in premium security assay card packaging with matching credentials.",
    isPopular: true,
    rating: 5.0,
    reviews: 112
  },
  {
    id: "bul-02",
    name: "Royal Mint Sovereign Gold Coin - King Charles III",
    category: "bullion",
    karat: 22,
    metalType: "Gold",
    weightGram: 7.98,
    basePremiumGBP: 60,
    image: "https://images.unsplash.com/photo-1589758438368-0ad531db3366?w=600&auto=format&fit=crop&q=80",
    description: "The world-famous sovereign gold coin minted by the Royal Mint in South Wales. Struck in 22-karat gold with a nominal legal tender value, featuring St. George and the Dragon.",
    isPopular: false,
    rating: 4.9,
    reviews: 74
  }
];

export const HISTORIC_DATA = {
  "1D": [
    { name: "09:00", price: 1821.50 },
    { name: "10:30", price: 1823.10 },
    { name: "12:00", price: 1820.40 },
    { name: "13:30", price: 1824.80 },
    { name: "15:00", price: 1826.30 },
    { name: "16:30", price: 1825.10 },
    { name: "18:00", price: 1827.90 },
    { name: "Current", price: 1829.40 },
  ],
  "1W": [
    { name: "Mon", price: 1805.20 },
    { name: "Tue", price: 1812.80 },
    { name: "Wed", price: 1810.50 },
    { name: "Thu", price: 1819.10 },
    { name: "Fri", price: 1824.40 },
    { name: "Sat", price: 1825.00 },
    { name: "Sun", price: 1829.40 },
  ],
  "1M": [
    { name: "Wk 1", price: 1780.30 },
    { name: "Wk 2", price: 1795.50 },
    { name: "Wk 3", price: 1812.20 },
    { name: "Wk 4", price: 1829.40 },
  ],
  "1Y": [
    { name: "Jan", price: 1650.00 },
    { name: "Mar", price: 1690.40 },
    { name: "May", price: 1720.80 },
    { name: "Jul", price: 1712.10 },
    { name: "Sep", price: 1765.00 },
    { name: "Nov", price: 1799.30 },
    { name: "Jan", price: 1829.40 },
  ],
  "5Y": [
    { name: "2022", price: 1410.00 },
    { name: "2023", price: 1545.00 },
    { name: "2024", price: 1680.00 },
    { name: "2025", price: 1760.00 },
    { name: "2026", price: 1829.40 },
  ]
};
