'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import { apiRequest, StoreProduct } from '@/app/api';
import { Heart } from 'lucide-react';

type CatalogProduct = {
  id: string | number;
  _id?: string;
  category: string;
  title: string;
  description: string;
  fullDefinition?: string;
  price: string | number;
  image: string;
  stock?: number;
};

export default function ProductsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('featured');
  const [wishlistIds, setWishlistIds] = useState<(string | number)[]>([]);

  const [detailProduct, setDetailProduct] = useState<CatalogProduct | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    void Promise.resolve().then(() => {
      const savedUser = localStorage.getItem('user');
      if (savedUser) setUser(JSON.parse(savedUser));
      const savedCart = JSON.parse(localStorage.getItem('cart') || '[]') as { quantity?: number }[];
      setCartCount(savedCart.reduce((sum, item) => sum + (item.quantity || 1), 0));
      const savedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]') as { id: string | number }[];
      setWishlistIds(savedWishlist.map((item) => item.id));
    });
  }, []);

  const [products, setProducts] = useState<CatalogProduct[]>([
    {
      id: 1,
      category: 'CLOTHING',
      title: "Men's Italian Tailored Tuxedo Suit",
      description: 'High-grade wool blended luxury two-piece tuxedo suit.',
      fullDefinition: 'Designed in Italy, this premium tuxedo suit is crafted from 100% fine wool blend. Perfect for weddings, galas, and high-profile formal events. Includes a tailored blazer jacket and matching trousers with satin lapel details.',
      price: 'ETB 1500',
      image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500'
    },
    {
      id: 2,
      category: 'CLOTHING',
      title: "Women's Floral Summer Dress",
      description: 'Breathable cotton blend dress designed for elegance and comfort.',
      fullDefinition: 'Lightweight and airy, this floral summer dress features a flattering A-line cut, adjustable straps, and skin-friendly organic cotton fabric designed for warm sunny days and outdoor gatherings.',
      price: 'ETB 2800',
      image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500'
    },
    {
      id: 3,
      category: 'CLOTHING',
      title: 'Unisex Streetwear Hoodie & Joggers',
      description: 'Soft fleece warm tracksuits for daily casual lifestyle.',
      fullDefinition: 'Heavyweight cotton-fleece blend tracksuit designed for maximum coziness. Features deep pockets, an adjustable drawstring hood, and ribbed cuffs for a snug modern streetwear look.',
      price: 'ETB 3400',
      image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500'
    },
    {
      id: 4,
      category: 'CLOTHING',
      title: 'Classic Vintage Denim Jacket',
      description: 'Vintage styled unisex blue denim coat for cool weather.',
      fullDefinition: 'Authentic rugged denim jacket with vintage wash treatment. Equipped with durable metal button closures, chest pockets, and reinforced stitching for lifelong durability.',
      price: 'ETB 2600',
      image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500'
    },
    {
      id: 5,
      category: 'CLOTHING',
      title: 'Winter Puffer Jacket Waterproof',
      description: 'Warm windproof padded coat designed for cold weather.',
      fullDefinition: 'Engineered for extreme cold and rainy weather conditions. Features synthetic down insulation, waterproof outer shell fabric, and an adjustable hood for maximum warmth.',
      price: 'ETB 3800',
      image: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=500'
    },
    {
      id: 6,
      category: 'CLOTHING',
      title: 'Casual Organic Cotton T-Shirt',
      description: '100% Organic breathable cotton t-shirt for daily wear.',
      fullDefinition: 'Crafted from sustainable organic cotton fibers, offering a soft touch against the skin, superior breathability, and enduring shape retention wash after wash.',
      price: 'ETB 1200',
      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500'
    },
    {
      id: 7,
      category: 'CLOTHING',
      title: 'Executive Leather Trench Coat',
      description: 'Premium brown leather jacket with inner fleece lining.',
      fullDefinition: 'Sophisticated executive trench coat tailored from genuine full-grain leather. Designed to deliver both professional elegance and dependable winter wind protection.',
      price: 'ETB 8900',
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500'
    },
    {
      id: 8,
      category: 'CLOTHING',
      title: 'Traditional Ethiopian Cultural Dress',
      description: 'Handwoven Habesha dress featuring intricate colorful embroidery.',
      fullDefinition: 'Authentic Ethiopian Habesha kemis woven from high-grade cotton yarn. Beautiful handmade tibeb embroidery adorns the neckline and borders for weddings and holidays.',
      price: 'ETB 6500',
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500'
    },
    {
      id: 9,
      category: 'CLOTHING',
      title: "Women's Evening Satin Gown",
      description: 'Elegant silk satin dinner gown suitable for weddings and events.',
      fullDefinition: 'Flowing silk satin evening gown with a graceful silhouette, floor-length hem, and delicate shoulder draping designed to turn heads at evening celebrations.',
      price: 'ETB 5200',
      image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=500'
    },
    {
      id: 10,
      category: 'CLOTHING',
      title: 'Sporty Track Jacket & Pants',
      description: 'Lightweight athletic outerwear for workouts and outdoor running.',
      fullDefinition: 'Moisture-wicking athletic tracksuit designed for morning jogs, gym workouts, and active daily routines. Features zippered side pockets and stretchable fabric.',
      price: 'ETB 2900',
      image: 'https://images.unsplash.com/photo-1483721063318-7b9d16a5b28a?w=500'
    },
    {
      id: 11,
      category: 'SHOES',
      title: 'Nike Air Max Running Shoes',
      description: 'Lightweight athletic sneakers with max air cushion support.',
      fullDefinition: 'Engineered for runners and athletes. Features revolutionary Nike Air cushioning units in the heel for impact absorption, breathable mesh upper, and a high-traction rubber outsole.',
      price: 'ETB 4800',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'
    },
    {
      id: 12,
      category: 'SHOES',
      title: 'Leather Formal Oxford Shoes',
      description: 'Handcrafted genuine oxfords ideal for formal outfit combinations.',
      fullDefinition: 'Made from premium full-grain cowhide leather with a polished finish. Features cushioned inner insoles for all-day wearability at corporate meetings and formal dinners.',
      price: 'ETB 4200',
      image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=500'
    },
    {
      id: 13,
      category: 'SHOES',
      title: 'Adidas Ultraboost Athletic Sneakers',
      description: 'Responsive boost midsole offering max comfort for sports.',
      fullDefinition: 'High-performance running shoes featuring energy-returning Boost cushioning and Primeknit upper that wraps your foot in adaptive support.',
      price: 'ETB 5500',
      image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=500'
    },
    {
      id: 14,
      category: 'SHOES',
      title: 'High-Top Basketball Shoes',
      description: 'Durable rubber sole sneakers with optimal ankle lock support.',
      fullDefinition: 'Designed for basketball courts with reinforced ankle collars, impact-dispersing midsole cushioning, and multi-directional traction tread patterns.',
      price: 'ETB 4900',
      image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=500'
    },
    {
      id: 15,
      category: 'SHOES',
      title: "Women's High Heel Leather Pumps",
      description: 'Classic black pointed-toe heels for office and formal wear.',
      fullDefinition: 'Timeless stiletto pumps crafted with genuine patent leather uppers, comfortable arch support, and sleek pointed toes for professional sophistication.',
      price: 'ETB 3600',
      image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500'
    },
    {
      id: 16,
      category: 'SHOES',
      title: 'Casual Canvas Low-Top Sneakers',
      description: 'Everyday comfortable canvas shoes for college and casual outings.',
      fullDefinition: 'Classic low-top canvas sneakers featuring flexible rubber soles, reinforced toe caps, and breathable cotton lining for relaxed everyday wear.',
      price: 'ETB 2100',
      image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=500'
    },
    {
      id: 17,
      category: 'SHOES',
      title: 'Waterproof Mountain Hiking Boots',
      description: 'Rugged leather trail boots with slip-resistant rubber grip.',
      fullDefinition: 'Built for rocky terrain and wet weather trails. Features waterproof membrane construction, steel shank support, and deep lug outsoles for secure footing.',
      price: 'ETB 6200',
      image: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=500'
    },
    {
      id: 18,
      category: 'SHOES',
      title: 'Casual Slip-On Leather Loafers',
      description: 'Breathable soft leather loafers suitable for relaxed weekends.',
      fullDefinition: 'Easy slip-on leather footwear combining soft suede textures, cushioned footbeds, and lightweight flexible soles for effortless weekend styling.',
      price: 'ETB 3000',
      image: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=500'
    },
    {
      id: 19,
      category: 'PHONES',
      title: 'Samsung Galaxy S24 Ultra',
      description: 'Flagship Samsung smartphone with Titanium frame and Galaxy AI.',
      fullDefinition: 'The ultimate Android experience featuring a durable titanium chassis, 200MP pro-grade camera system, powerful Snapdragon 8 Gen 3 processor, and integrated Galaxy AI capabilities for real-time translation and photo editing.',
      price: 'ETB 85000',
      image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500'
    },
    {
      id: 20,
      category: 'PHONES',
      title: 'Apple iPhone 15 Pro Max',
      description: 'A17 Pro chip, Titanium design, and 5x optical telephoto camera.',
      fullDefinition: 'Aerospace-grade titanium design featuring the groundbreaking A17 Pro chip for console-level mobile gaming, a customizable Action button, and an advanced 5x telephoto camera system.',
      price: 'ETB 95000',
      image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500'
    },
    {
      id: 21,
      category: 'PHONES',
      title: 'Infinix Zero 30 5G',
      description: 'Ultra-smooth curved AMOLED display with 4K vlog recording.',
      fullDefinition: 'Designed for content creators featuring a 50MP front vlogging camera capable of 4K 60fps recording, 144Hz curved AMOLED display, and fast charging.',
      price: 'ETB 26000',
      image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500'
    },
    {
      id: 22,
      category: 'PHONES',
      title: 'Google Pixel 8 Pro',
      description: 'Best-in-class Google AI photography and pure Android experience.',
      fullDefinition: 'Powered by Google Tensor G3 with advanced computational photography features like Magic Eraser, Video Boost, and 7 years of software security updates.',
      price: 'ETB 52000',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500'
    },
    {
      id: 23,
      category: 'PHONES',
      title: 'Xiaomi Redmi Note 13 Pro+',
      description: '200MP OIS camera, 120W fast charging, and IP68 water resistance.',
      fullDefinition: 'Flagship features at an accessible price. Includes 200MP main camera with optical image stabilization, curved 1.5K display, and 120W HyperCharge technology.',
      price: 'ETB 29500',
      image: 'https://images.unsplash.com/photo-1567581935884-3349723552ca?w=500'
    },
    {
      id: 24,
      category: 'PHONES',
      title: 'OnePlus 12 5G Flagship',
      description: 'Snapdragon 8 Gen 3 with Hasselblad Camera for Mobile.',
      fullDefinition: 'Exceptional performance flagship featuring the 4th generation Hasselblad Camera for Mobile, massive 5400mAh battery, and stunning ProXDR display.',
      price: 'ETB 68000',
      image: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=500'
    },
    {
      id: 25,
      category: 'PHONES',
      title: 'Tecno Camon 30 Premier',
      description: 'Periscope telephoto lens with 70W fast charging battery.',
      fullDefinition: 'Features a unique dual-chip imaging system with polaroid-inspired styling, periscope zoom capabilities, and a bright 120Hz LTPO AMOLED display.',
      price: 'ETB 24500',
      image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=500'
    },
    {
      id: 26,
      category: 'PHONES',
      title: 'Samsung Galaxy Z Fold 5',
      description: 'Revolutionary foldable glass screen for multi-tasking productivity.',
      fullDefinition: 'Unfold a massive tablet-sized workspace in your pocket. Features Flex Hinge design, S Pen support, and powerful multi-window app execution.',
      price: 'ETB 110000',
      image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=500'
    },
    {
      id: 27,
      category: 'ELECTRONICS',
      title: 'Apple MacBook Pro M3 Max',
      description: 'Supercharged power for software developers and video creators.',
      fullDefinition: 'Equipped with the M3 Max chip, stunning Liquid Retina XDR display, up to 22 hours of battery life, and massive memory bandwidth designed to compile heavy software code and render 8K videos effortlessly.',
      price: 'ETB 165000',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500'
    },
    {
      id: 28,
      category: 'ELECTRONICS',
      title: 'Dell XPS 15 Touchscreen',
      description: 'OLED 4K display, Intel Core i9, and sleek aluminum chassis.',
      fullDefinition: 'High-performance Windows laptop featuring a vibrant 4K OLED touch display, premium CNC machined aluminum body, discrete graphics, and thermal architecture optimized for intensive computing tasks.',
      price: 'ETB 115000',
      image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500'
    },
    {
      id: 29,
      category: 'ELECTRONICS',
      title: 'HP Spectre x360 Convertible',
      description: 'Versatile 2-in-1 laptop with pen touch support and long battery.',
      fullDefinition: 'Gem-cut gemstone aluminum chassis with 360-degree hinge flexibility. Includes active stylus pen support for digital sketching and note-taking.',
      price: 'ETB 82000',
      image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500'
    },
    {
      id: 30,
      category: 'ELECTRONICS',
      title: 'Lenovo ThinkPad X1 Carbon',
      description: 'Ultra-light business laptop with world-class durability and keyboard.',
      fullDefinition: 'The gold standard for enterprise professionals. Features military-grade durability testing, legendary spill-resistant keyboard, and enterprise security features.',
      price: 'ETB 78000',
      image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500'
    },
    {
      id: 31,
      category: 'ELECTRONICS',
      title: 'ASUS ROG Strix Gaming Laptop',
      description: 'NVIDIA RTX 4080 GPU, high refresh rate, and RGB cooling system.',
      fullDefinition: 'Built for hardcore gamers and 3D renderers. Powered by NVIDIA GeForce RTX 40 series graphics, liquid metal cooling, and 240Hz fast IPS display panel.',
      price: 'ETB 128000',
      image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500'
    },
    {
      id: 32,
      category: 'ELECTRONICS',
      title: 'iPad Pro 12.9 M2 Display',
      description: 'Liquid Retina XDR display with Apple Pencil 2 support.',
      fullDefinition: 'Ultimate iPad experience with M2 chip performance, ProMotion technology, Thunderbolt connectivity, and desktop-class application support.',
      price: 'ETB 72000',
      image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500'
    },
    {
      id: 33,
      category: 'ELECTRONICS',
      title: 'Sony Bravia 65" 4K OLED TV',
      description: 'Immersive HDR cinema picture with Dolby Atmos audio speaker.',
      fullDefinition: 'Transform your living room into a cinema hall. Features Cognitive Processor XR, self-lit OLED contrast, and acoustic surface audio technology.',
      price: 'ETB 135000',
      image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=500'
    },
    {
      id: 34,
      category: 'ELECTRONICS',
      title: 'PlayStation 5 Console Slim',
      description: 'Next-generation 4K 120Hz gaming with DualSense wireless controller.',
      fullDefinition: 'Experience lightning-fast loading with an ultra-high speed SSD, deeper immersion with haptic feedback, adaptive triggers, and 3D Audio.',
      price: 'ETB 65000',
      image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500'
    },
    {
      id: 35,
      category: 'AUTOMOTIVE',
      title: 'Toyota Land Cruiser V8',
      description: 'Luxury 4x4 off-road SUV built for all Ethiopian terrain conditions.',
      fullDefinition: 'Legendary off-road reliability combined with supreme cabin luxury. Features a robust V8 engine, advanced multi-terrain select system, leather seating, and spacious 7-passenger capacity.',
      price: 'ETB 14500000',
      image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=500'
    },
    {
      id: 36,
      category: 'AUTOMOTIVE',
      title: 'Tesla Model 3 Electric Vehicle',
      description: 'Fully electric sedan with autopilot, long range, and luxury interior.',
      fullDefinition: 'Next-generation electric vehicle offering instantaneous torque, zero emissions, minimalist glass roof cabin, autopilot safety features, and exceptional driving range per single charge.',
      price: 'ETB 4200000',
      image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=500'
    },
    {
      id: 37,
      category: 'AUTOMOTIVE',
      title: 'Hyundai Tucson SUV 2024',
      description: 'Modern compact SUV with sleek styling and excellent fuel efficiency.',
      fullDefinition: 'Parametric hidden lights design, spacious interior legroom, advanced driver assistance systems, and smooth automatic transmission.',
      price: 'ETB 5100000',
      image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500'
    },
    {
      id: 38,
      category: 'AUTOMOTIVE',
      title: 'Mercedes-Benz C-Class Coupe',
      description: 'High-performance luxury coupe with premium leather comfort.',
      fullDefinition: 'Exquisite German craftsmanship featuring panoramic sunroof, Burmester surround sound system, turbocharged engine, and sporty AMG styling elements.',
      price: 'ETB 8900000',
      image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=500'
    },
    {
      id: 39,
      category: 'AUTOMOTIVE',
      title: 'Suzuki Swift Compact City Car',
      description: 'Popular city car with outstanding maneuverability and economy.',
      fullDefinition: 'Compact hatchback tailored for urban navigation. Offers incredible fuel economy, easy parking dimensions, and dependable engine performance.',
      price: 'ETB 2300000',
      image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c351?w=500'
    },
    {
      id: 40,
      category: 'AUTOMOTIVE',
      title: 'Ford Mustang Sports Edition V8',
      description: 'Iconic American muscle sports car featuring a V8 Turbo engine.',
      fullDefinition: 'Breathtaking muscle car performance with aggressive styling, roaring V8 exhaust note, track apps, and high-performance Brembo brakes.',
      price: 'ETB 9800000',
      image: 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?w=500'
    },
    {
      id: 41,
      category: 'AUTOMOTIVE',
      title: 'BMW X5 xDrive40i Luxury SUV',
      description: 'Executive luxury crossover with adaptive air suspension.',
      fullDefinition: 'Dynamic performance meets refined luxury. Features BMW Live Cockpit Professional, panoramic sky lounge LED roof, and intelligent all-wheel drive.',
      price: 'ETB 11200000',
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=500'
    },
    {
      id: 42,
      category: 'AUTOMOTIVE',
      title: 'Audi A6 Executive Sedan',
      description: 'Sophisticated German engineering with Quattro all-wheel drive.',
      fullDefinition: 'Elegant executive saloon featuring dual touch screen MMI response systems, matrix LED headlights, and plush leather upholstery.',
      price: 'ETB 7800000',
      image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=500'
    },
    {
      id: 43,
      category: 'ACCESSORIES',
      title: 'Sony Noise Canceling Headphones',
      description: 'Industry leading noise cancellation with immersive bass.',
      fullDefinition: 'Blocks out ambient noise using dual noise sensor technology. Delivers crystal-clear hands-free calling, 30-hour battery life with quick charging, and ultra-comfortable plush ear cushions.',
      price: 'ETB 14500',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'
    },
    {
      id: 44,
      category: 'ACCESSORIES',
      title: 'Apple Watch Series 9 GPS',
      description: 'Advanced health tracking, ECG, altitude sensor, and fitness analytics.',
      fullDefinition: 'Your essential companion for a healthy life. Features a bright Always-On Retina display, blood oxygen sensor, ECG app, sleep staging, and advanced workout metrics.',
      price: 'ETB 21500',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'
    },
    {
      id: 45,
      category: 'ACCESSORIES',
      title: 'Leather Waterproof Travel Backpack',
      description: 'Dedicated 15.6 inch laptop sleeve with USB charging port.',
      fullDefinition: 'Crafted from water-resistant PU leather and durable fabric. Includes an integrated external USB charging port, padded laptop compartment, and ergonomic breathable back support.',
      price: 'ETB 3200',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500'
    },
    {
      id: 46,
      category: 'ACCESSORIES',
      title: 'Professional DSLR Camera & Lens',
      description: '4K video filming and 24.1MP full-frame image sensor.',
      fullDefinition: 'Capture breathtaking cinematic 4K videos and high-resolution photographs. Comes with an interchangeable 18-55mm zoom lens, fast autofocus system, and Wi-Fi sharing capabilities.',
      price: 'ETB 62000',
      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500'
    },
    {
      id: 47,
      category: 'ACCESSORIES',
      title: 'Ray-Ban Polarized Sunglasses',
      description: 'Classic UV protection sunglasses for driving and outdoor outings.',
      fullDefinition: 'Iconic frame design equipped with polarized glass lenses that eliminate glare, enhance visual clarity, and provide 100% UV400 protection.',
      price: 'ETB 3500',
      image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500'
    },
    {
      id: 48,
      category: 'ACCESSORIES',
      title: 'Smart Home Wireless Speaker',
      description: '360 degree spatial sound audio with Google Assistant integration.',
      fullDefinition: 'Room-filling audio speaker with voice control intelligence, multi-room audio pairing, and fabric acoustic wrap design.',
      price: 'ETB 5800',
      image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=500'
    },
    {
      id: 49,
      category: 'ACCESSORIES',
      title: 'Rolex Submariner Classic Watch',
      description: 'Luxury stainless steel automatic mechanical wristwatch.',
      fullDefinition: 'Prestigious Swiss-made diving watch crafted from Oystersteel with scratch-resistant Cerachrom bezel insert and self-winding perpetual movement.',
      price: 'ETB 450000',
      image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500'
    },
    {
      id: 50,
      category: 'ACCESSORIES',
      title: 'Wireless Charging Power Bank 20000mAh',
      description: 'Fast charging dual USB-C battery pack for all phones.',
      fullDefinition: 'High-capacity portable charger supporting 22.5W fast wired charging and magnetic wireless pad charging for smartphones on the go.',
      price: 'ETB 2200',
      image: 'https://images.unsplash.com/photo-1609592424109-dd9892f1b177?w=500'
    },
    {
      id: 51,
      category: 'ACCESSORIES',
      title: 'Leather Designer Travel Wallet',
      description: 'Genuine leather passport holder with RFID blocking safety.',
      fullDefinition: 'Keep your travel essentials secure and organized. Features slots for boarding passes, credit cards, passport, and RFID theft-blocking lining.',
      price: 'ETB 1800',
      image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500'
    },
    {
      id: 52,
      category: 'ACCESSORIES',
      title: 'AirPods Pro 2 Noise Canceling',
      description: 'Active noise cancellation with spatial audio surround sound.',
      fullDefinition: 'Powered by the Apple H2 chip for smarter noise cancellation, three-dimensional spatial audio, touch control volume adjustment, and MagSafe charging case.',
      price: 'ETB 16500',
      image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500'
    }
  ]);

  useEffect(() => {
    let isMounted = true;
    apiRequest<StoreProduct[]>('/api/products')
      .then((apiProducts) => {
        if (isMounted && apiProducts.length) {
          setProducts(apiProducts.map((product) => ({
            ...product,
            id: product._id,
            price: `ETB ${product.price.toLocaleString()}`,
            fullDefinition: product.description,
          })));
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);

  const handleOpenDetails = (product: CatalogProduct) => {
    setDetailProduct(product);
    setIsDetailOpen(true);
  };

  const handleAddToCart = (product: CatalogProduct) => {
    const currentCart = JSON.parse(localStorage.getItem('cart') || '[]') as Array<CatalogProduct & { quantity?: number; productId?: string | null; id?: string | number; _id?: string }>; 
    const productId = product._id || product.id;
    const normalizedProductId = productId == null ? null : String(productId);

    const existing = currentCart.find((item) => {
      const itemId = item.productId ?? item._id ?? item.id;
      return itemId !== undefined && itemId !== null && normalizedProductId !== null && String(itemId) === normalizedProductId;
    });

    const updatedCart = existing
      ? currentCart.map((item) => {
          const itemId = item.productId ?? item._id ?? item.id;
          if (itemId !== undefined && itemId !== null && normalizedProductId !== null && String(itemId) === normalizedProductId) {
            return { ...item, quantity: (item.quantity || 1) + 1 };
          }
          return item;
        })
      : [...currentCart, { ...product, id: product.id, _id: product._id, productId: normalizedProductId, quantity: 1 }];

    localStorage.setItem('cart', JSON.stringify(updatedCart));
    setCartCount(updatedCart.reduce((sum: number, item: { quantity?: number }) => sum + (item.quantity || 1), 0));
  };

  const handleBuyNow = (product: CatalogProduct) => {
    handleAddToCart(product);
    localStorage.setItem('buyNow', '1');
    router.push('/cart');
  };

  const toggleWishlist = (product: CatalogProduct) => {
    const current = JSON.parse(localStorage.getItem('wishlist') || '[]') as CatalogProduct[];
    const alreadySaved = current.some((item) => item.id === product.id);
    const next = alreadySaved ? current.filter((item) => item.id !== product.id) : [...current, product];
    localStorage.setItem('wishlist', JSON.stringify(next));
    setWishlistIds(next.map((item) => item.id));
  };

  const searchWords = searchTerm.toLowerCase().trim().split(/\s+/).filter((word) => word.length > 0);

  const sortProducts = (items: CatalogProduct[]) => [...items].sort((left, right) => {
    if (sortOrder === 'price-asc' || sortOrder === 'price-desc') {
      const leftPrice = Number(String(left.price).replace(/[^0-9.]/g, '')) || 0;
      const rightPrice = Number(String(right.price).replace(/[^0-9.]/g, '')) || 0;
      return sortOrder === 'price-asc' ? leftPrice - rightPrice : rightPrice - leftPrice;
    }
    return 0;
  });

  const productSearchText = (product: CatalogProduct) =>
    `${product.title} ${product.category}`.toLowerCase();

  const searchMatchCount = (product: CatalogProduct) =>
    searchWords.filter((word) => productSearchText(product).includes(word)).length;

  const matchesSearch = (product: CatalogProduct) =>
    searchWords.length > 0 && searchMatchCount(product) === searchWords.length;

  const mainSearchMatches = sortProducts(products.filter((product) =>
    matchesSearch(product)
  ));

  const searchSuggestions = searchTerm.trim()
    ? products.filter(matchesSearch).slice(0, 6).map(({ id, title, category }) => ({ id, title, category }))
    : [];

  const relatedCategories = new Set(mainSearchMatches.map((product) => product.category));
  const visibleRelatedProducts = searchTerm.trim() !== ''
    ? mainSearchMatches.length > 0
      ? sortProducts(products.filter((product) =>
          !mainSearchMatches.some((match) => match.id === product.id) &&
          relatedCategories.has(product.category)
        )).slice(0, 8)
      : products
          .filter((product) => searchWords.length > 1 && searchMatchCount(product) >= 2)
          .sort((left, right) => searchMatchCount(right) - searchMatchCount(left))
          .slice(0, 8)
    : [];

  const defaultProducts = sortProducts(products.filter((product) => {
    return selectedCategory === 'ALL' || product.category === selectedCategory;
  }));

  const categories = ['ALL', ...new Set([...products.map((product) => product.category), 'CLOTHING', 'SHOES', 'PHONES', 'ELECTRONICS', 'AUTOMOTIVE', 'ACCESSORIES'])];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        cartCount={cartCount}
        user={user}
        searchTerm={searchTerm}
        onSearchChange={(event) => setSearchTerm(event.target.value)}
        searchSuggestions={searchSuggestions}
        onSuggestionSelect={setSearchTerm}
      />

      {/* Free Delivery Banner */}
      <div className="bg-emerald-600 text-white py-2 px-4 text-center font-bold text-xs shadow-sm flex justify-center items-center gap-2">
        <span>🚚 Free Delivery on All Orders across </span>
        <span className="bg-white text-emerald-700 px-2 py-0.5 rounded-full text-[10px] uppercase font-extrabold animate-pulse">
          Limited Time
        </span>
      </div>

      {

      }
      <div className="max-w-7xl mx-auto px-6 pt-6 flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            {cat === '' ? '' : cat}
          </button>
        ))}
      </div>

      <div className="mx-auto flex max-w-7xl justify-end px-6 pt-3">
        <label className="flex items-center gap-2 text-xs text-gray-600">
          Sort by
          <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} className="border border-gray-300 bg-white px-3 py-2 text-xs text-gray-800">
            <option value="featured">Featured</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </label>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-6 space-y-10">
        {searchTerm.trim() !== '' ? (
          <>
            {/*  (Direct Results) */}
            <section>
              <h2 className="text-xl font-bold text-indigo-950 mb-4">
                🔍 Direct Results for &quot;{searchTerm}&quot; ({mainSearchMatches.length})
              </h2>

              {mainSearchMatches.length === 0 ? (
                <p className="text-gray-500 text-sm bg-white p-4 rounded-xl border border-gray-200">
                 
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  {mainSearchMatches.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white rounded-xl shadow-md border-2 border-indigo-500 overflow-hidden flex flex-col justify-between"
                    >
                      <div className="cursor-pointer" onClick={() => handleOpenDetails(product)}>
                        <img src={product.image} alt={product.title} className="w-full h-44 object-cover hover:opacity-95 transition" />
                        <div className="p-4">
                          <span className="text-xs font-semibold text-indigo-600 tracking-wider">
                            {product.category}
                          </span>
                          <h3 className="text-sm font-bold text-gray-800 mt-1 line-clamp-2 hover:text-indigo-600">
                            {product.title}
                          </h3>
                          <p className="text-xs text-gray-500 mt-2 line-clamp-2">{product.description}</p>
                          <span className="text-[11px] text-indigo-500 font-semibold mt-2 inline-block">ℹ️ Click for full details</span>
                        </div>
                      </div>
                      <div className="p-4 pt-0 flex items-center justify-between border-t border-gray-100 mt-2 pt-3">
                        <span className="text-sm font-extrabold text-gray-900">{product.price}</span>
                        <div className="flex items-center gap-2">
                          <button type="button" aria-label={`${wishlistIds.includes(product.id) ? 'Remove' : 'Add'} ${product.title} ${wishlistIds.includes(product.id) ? 'from' : 'to'} wishlist`} onClick={() => toggleWishlist(product)} className="p-2 text-rose-700 hover:bg-rose-50" title="Toggle wishlist"><Heart size={16} fill={wishlistIds.includes(product.id) ? 'currentColor' : 'none'} /></button>
                          <div className="flex flex-col gap-2">
                            <button type="button" onClick={() => handleAddToCart(product)} className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-medium px-3 py-2 rounded-lg transition cursor-pointer">Add to Cart</button>
                            <button type="button" onClick={() => handleBuyNow(product)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-medium px-3 py-2 rounded-lg transition cursor-pointer">Buy Now</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {
              
            }
            {visibleRelatedProducts.length > 0 && (
              <section className="pt-4">
                <h2 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
                  <span>✨ Extra Recommended Products You Might Like</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  {visibleRelatedProducts.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white rounded-xl shadow-sm border border-purple-200 overflow-hidden flex flex-col justify-between hover:shadow-md transition"
                    >
                      <div className="cursor-pointer" onClick={() => handleOpenDetails(product)}>
                        <img src={product.image} alt={product.title} className="w-full h-44 object-cover hover:opacity-95 transition" />
                        <div className="p-4">
                          <span className="text-xs font-semibold text-purple-600 tracking-wider">
                            {product.category}
                          </span>
                          <h3 className="text-sm font-bold text-gray-800 mt-1 line-clamp-2 hover:text-purple-600">
                            {product.title}
                          </h3>
                          <p className="text-xs text-gray-500 mt-2 line-clamp-2">{product.description}</p>
                          <span className="text-[11px] text-purple-500 font-semibold mt-2 inline-block">ℹ️ Click for full details</span>
                        </div>
                      </div>

                      <div className="p-4 pt-0 flex items-center justify-between border-t border-gray-100 mt-2 pt-3">
                        <span className="text-sm font-extrabold text-gray-900">{product.price}</span>
                        <div className="flex items-center gap-2">
                          <button type="button" aria-label={`${wishlistIds.includes(product.id) ? 'Remove' : 'Add'} ${product.title} ${wishlistIds.includes(product.id) ? 'from' : 'to'} wishlist`} onClick={() => toggleWishlist(product)} className="p-2 text-rose-700 hover:bg-rose-50" title="Toggle wishlist"><Heart size={16} fill={wishlistIds.includes(product.id) ? 'currentColor' : 'none'} /></button>
                          <div className="flex flex-col gap-2">
                            <button type="button" onClick={() => handleAddToCart(product)} className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-medium px-3 py-2 rounded-lg transition cursor-pointer">Add to Cart</button>
                            <button type="button" onClick={() => handleBuyNow(product)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-medium px-3 py-2 rounded-lg transition cursor-pointer">Buy Now</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Showing {defaultProducts.length} Products
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {defaultProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col justify-between hover:shadow-md transition"
                >
                  <div className="cursor-pointer" onClick={() => handleOpenDetails(product)}>
                    <img src={product.image} alt={product.title} className="w-full h-44 object-cover hover:opacity-95 transition" />
                    <div className="p-4">
                      <span className="text-xs font-semibold text-indigo-600 tracking-wider">
                        {product.category}
                      </span>
                      <h3 className="text-sm font-bold text-gray-800 mt-1 line-clamp-2 hover:text-indigo-600">
                        {product.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-2 line-clamp-2">{product.description}</p>
                      <span className="text-[11px] text-indigo-500 font-semibold mt-2 inline-block">ℹ️ Click for full details</span>
                    </div>
                  </div>

                  <div className="p-4 pt-0 flex items-center justify-between border-t border-gray-100 mt-2 pt-3">
                    <span className="text-sm font-extrabold text-gray-900">{product.price}</span>
                    <div className="flex items-center gap-2">
                      <button type="button" aria-label={`${wishlistIds.includes(product.id) ? 'Remove' : 'Add'} ${product.title} ${wishlistIds.includes(product.id) ? 'from' : 'to'} wishlist`} onClick={() => toggleWishlist(product)} className="p-2 text-rose-700 hover:bg-rose-50" title="Toggle wishlist"><Heart size={16} fill={wishlistIds.includes(product.id) ? 'currentColor' : 'none'} /></button>
                      <div className="flex flex-col gap-2">
                        <button type="button" onClick={() => handleAddToCart(product)} className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-medium px-3 py-2 rounded-lg transition cursor-pointer">Add to Cart</button>
                        <button type="button" onClick={() => handleBuyNow(product)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-medium px-3 py-2 rounded-lg transition cursor-pointer">Buy Now</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {

      }
      {isDetailOpen && detailProduct && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsDetailOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold text-lg cursor-pointer bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center"
            >
              ✕
            </button>

            <img src={detailProduct.image} alt={detailProduct.title} className="w-full h-60 object-cover rounded-xl mb-4 shadow-md" />

            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">
              {detailProduct.category}
            </span>
            <h2 className="text-xl font-extrabold text-gray-900 mt-2">{detailProduct.title}</h2>
            <p className="text-lg font-black text-emerald-600 mt-1">{detailProduct.price}</p>

            <div className="mt-4 border-t border-gray-100 pt-4">
              <h4 className="text-xs font-bold text-gray-700 uppercase mb-1">Overview / Description:</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{detailProduct.description}</p>
            </div>

            <div className="mt-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
              <h4 className="text-xs font-bold text-indigo-950 uppercase mb-1">📖 Full Product Definition & Specifications:</h4>
              <p className="text-xs text-gray-700 leading-relaxed">{detailProduct.fullDefinition || detailProduct.description}</p>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setIsDetailOpen(false);
                  handleBuyNow(detailProduct);
                }}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-sm transition shadow-md cursor-pointer"
              >
                Buy Now ({detailProduct.price})
              </button>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-5 py-3 rounded-xl text-sm transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {

      }
    </div>
  );
}