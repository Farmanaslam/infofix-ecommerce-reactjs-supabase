import { Product, User, Order, Branch } from "./types";

export const CATEGORIES = [
  "Custom Cooling",
  "Processor",
  "CPU Cooler",
  "Motherboard",
  "Graphics Card",
  "RAM",
  "Storage",
  "SMPS",
  "Cabinet",
  "Monitor",
  "Peripherals",
  "Laptop",
  "Mini PC",
];

export const SUBCATEGORIES: Record<
  string,
  { groups: { label: string; items: string[] }[] }
> = {
  Processor: {
    groups: [
      {
        label: "AMD",
        items: [
          "Ryzen 3",
          "Ryzen 5",
          "Ryzen 7",
          "Ryzen 9",
          "Ryzen Threadripper",
        ],
      },
      {
        label: "AMD Series",
        items: [
          "AMD 9000 Series",
          "AMD 8000 Series",
          "AMD 7000 Series",
          "AMD 5000 Series",
          "AMD 4000 Series",
          "AMD 3000 Series",
        ],
      },
      {
        label: "Intel",
        items: [
          "Core i3",
          "Core i5",
          "Core i7",
          "Core i9",
          "Core Ultra 5",
          "Core Ultra 7",
          "Core Ultra 9",
        ],
      },
      {
        label: "Intel Gen",
        items: [
          "Intel 14th Gen",
          "Intel 13th Gen",
          "Intel 12th Gen",
          "Intel 11th Gen",
          "Intel 10th Gen",
        ],
      },
    ],
  },
  "CPU Cooler": {
    groups: [
      {
        label: "Type",
        items: ["Air Cooler", "AIO Liquid Cooler", "Custom Loop"],
      },
    ],
  },
  Motherboard: {
    groups: [
      {
        label: "Platform",
        items: ["Intel Motherboard", "AMD Motherboard"],
      },
      {
        label: "Form Factor",
        items: ["ATX", "Micro ATX", "Mini ITX"],
      },
    ],
  },
  "Graphics Card": {
    groups: [
      {
        label: "Brand",
        items: ["NVIDIA", "AMD Radeon"],
      },
      {
        label: "NVIDIA Series",
        items: [
          "RTX 4000 Series",
          "RTX 3000 Series",
          "GTX 1600 Series",
          "GTX 1000 Series",
        ],
      },
      {
        label: "AMD Series",
        items: ["RX 7000 Series", "RX 6000 Series", "RX 5000 Series"],
      },
    ],
  },
  RAM: {
    groups: [
      {
        label: "Type",
        items: ["DDR5", "DDR4", "DDR3"],
      },
      {
        label: "Capacity",
        items: ["4GB", "8GB", "16GB", "32GB", "64GB"],
      },
    ],
  },
  Storage: {
    groups: [
      {
        label: "Type",
        items: [
          "SSD",
          "HDD",
          "NVMe SSD",
          "External SSD",
          "External HDD",
          "Pen Drive",
        ],
      },
      {
        label: "Capacity",
        items: ["256GB", "512GB", "1TB", "2TB", "4TB"],
      },
    ],
  },
  SMPS: {
    groups: [
      {
        label: "Wattage",
        items: ["Up to 500W", "500W - 750W", "750W - 1000W", "1000W+"],
      },
      {
        label: "Rating",
        items: ["80+ Bronze", "80+ Gold", "80+ Platinum", "80+ Titanium"],
      },
    ],
  },
  Cabinet: {
    groups: [
      {
        label: "Form Factor",
        items: ["Full Tower", "Mid Tower", "Mini Tower", "Mini ITX"],
      },
    ],
  },
  Monitor: {
    groups: [
      {
        label: "Size",
        items: ['Up to 24"', '25" - 27"', '28" - 32"', '32"+'],
      },
      {
        label: "Type",
        items: [
          "Gaming Monitor",
          "Professional Monitor",
          "4K Monitor",
          "Curved Monitor",
        ],
      },
    ],
  },
  Peripherals: {
    groups: [
      {
        label: "Type",
        items: [
          "Keyboard",
          "Mouse",
          "Headset",
          "Webcam",
          "Mouse Pad",
          "Speaker",
          "UPS",
          "Printer",
        ],
      },
    ],
  },
  Laptop: {
    groups: [
      {
        label: "Brand",
        items: ["Dell", "HP", "Lenovo", "Acer", "Asus", "Apple", "MSI"],
      },
      {
        label: "Type",
        items: [
          "Gaming Laptop",
          "Business Laptop",
          "Student Laptop",
          "Refurbished Laptop",
        ],
      },
    ],
  },
  "Custom Cooling": {
    groups: [
      {
        label: "Type",
        items: [
          "Fans",
          "Radiators",
          "Water Blocks",
          "Tubing & Fittings",
          "Reservoirs",
        ],
      },
    ],
  },
  "Mini PC": {
    groups: [
      {
        label: "Type",
        items: ["Barebone Mini PC", "Ready-to-Use Mini PC", "NUC"],
      },
    ],
  },
};

export const OPERATORS: User[] = [
  {
    id: "admin1",
    name: "Sarah Chen",
    role: "MANAGER",
    avatar: "https://i.pravatar.cc/150?u=sarah",
  },
  {
    id: "admin2",
    name: "Marcus Thorne",
    role: "INVENTORY",
    avatar: "https://i.pravatar.cc/150?u=marcus",
  },
  {
    id: "admin3",
    name: "Elena Rodriguez",
    role: "SUPPORT",
    avatar: "https://i.pravatar.cc/150?u=elena",
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Nebula Pro Headphones",
    description:
      "Immersive noise-canceling headphones with spatial audio and 40-hour battery life.",
    price: 299.99,
    category: "Peripherals",
    stock: 45,
    image: "https://picsum.photos/seed/nebula/600/600",
    rating: 4.8,
    reviews: 128,
    condition: "New",
    retailPrice: 249.99,
  },
  {
    id: "2",
    name: "Eco-Smart Watch Series X",
    description:
      "Track your health, sleep, and fitness with our most advanced sensor array yet.",
    price: 199.5,
    category: "Peripherals",
    stock: 12,
    image: "https://picsum.photos/seed/watch/600/600",
    rating: 4.5,
    reviews: 89,
    condition: "Refurbished",
    retailPrice: 249.99,
  },
  {
    id: "3",
    name: "Minimalist Canvas Backpack",
    description:
      "Durable, waterproof, and stylish. Perfect for daily commutes or weekend trips.",
    price: 75.0,
    category: "Peripherals",
    stock: 100,
    image: "https://picsum.photos/seed/bag/600/600",
    rating: 4.7,
    reviews: 215,
    condition: "New",
    retailPrice: 200.99,
  },
  {
    id: "4",
    name: "Artisan Ceramic Pour-Over Kit",
    description:
      "Elevate your morning ritual with hand-crafted ceramics for the perfect brew.",
    price: 45.99,
    category: "Custom Cooling",
    stock: 28,
    image: "https://picsum.photos/seed/coffee/600/600",
    rating: 4.9,
    reviews: 56,
    condition: "New",
    retailPrice: 749.99,
  },
  {
    id: "5",
    name: "Sonic Whitening Toothbrush",
    description:
      "30,000 vibrations per minute for a dentist-clean feel every single day.",
    price: 120.0,
    category: "Peripherals",
    stock: 64,
    image: "https://picsum.photos/seed/brush/600/600",
    rating: 4.4,
    reviews: 142,
    condition: "New",
    retailPrice: 149.99,
  },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: "ORD-001",
    customerId: "cust101",
    customerName: "James Wilson",
    items: [{ productId: "1", quantity: 1, price: 299.99 }],
    total: 299.99,
    status: "delivered",
    createdAt: "2023-10-25T14:30:00Z",
  },
  {
    id: "ORD-002",
    customerId: "cust102",
    customerName: "Linda May",
    items: [{ productId: "3", quantity: 2, price: 75.0 }],
    total: 150.0,
    status: "shipped",
    createdAt: "2023-11-01T09:15:00Z",
  },
];

export const INITIAL_BRANCHES: Branch[] = [
  {
    id: "br-1",
    title: "Infofix Computers Service Centre",
    address:
      "49/44, Ground Floor, Chamber of Commerce Lane, Beside/Opposite Maa Kali Hardware, Benachity, Durgapur - 713213",
    city: "Durgapur",
    days: "Monday - Sunday",
    hours: "10:00 AM - 9:00 PM",
    phone: "9382979780",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=49/44+Chamber+of+Commerce+Lane+Benachity+Durgapur+713213",
    image:
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=2070",
    details:
      "Authorized laptop & desktop repair center providing chip-level servicing and accessories.",
  },
  {
    id: "br-2",
    title: "DGP Shop - Benachity",
    address:
      "49/44, 1st Floor, Chamber of Commerce Lane, Beside/Opposite Maa Kali Hardware, Benachity, Durgapur - 713213",
    city: "Durgapur",
    days: "Monday - Sunday",
    hours: "10:00 AM - 9:00 PM",
    phone: "8016872767",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=49/44+1st+Floor+Chamber+of+Commerce+Lane+Benachity+Durgapur",
    image:
      "https://images.unsplash.com/photo-1597733336794-12d05021d510?auto=format&fit=crop&q=80&w=2074",
    details:
      "Complete laptop sales, refurbished systems, and upgrade solutions.",
  },
  {
    id: "br-3",
    title: "Ukhra Shop",
    address: "Natun Hat-Tala, Near New Post Office, Ukhra - 713363",
    city: "Ukhra",
    days: "Monday - Sunday",
    hours: "10:00 AM - 9:00 PM",
    phone: "7318621222",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Natun+Hat+Tala+Ukhra+713363",
    image:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=2070",
    details:
      "Sales & service point for laptops, accessories, and hardware components.",
  },
  {
    id: "br-4",
    title: "Asansol Shop",
    address:
      "Infinity Tower, Ground Floor, Beside Reliance Digital, Ashram More, Asansol - 713301",
    city: "Asansol",
    days: "Monday - Sunday",
    hours: "10:00 AM - 9:00 PM",
    phone: "8670777086",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Infinity+Tower+Ashram+More+Asansol+713301",
    image:
      "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80&w=2070",
    details:
      "Flagship branch offering premium laptops, gaming builds & enterprise solutions.",
  },
];
