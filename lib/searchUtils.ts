// ─── Search Aliases ────────────────────────────────────────────────────────────
// Each key maps to a list of related terms used to expand search queries.
export const SEARCH_ALIASES: Record<string, string[]> = {
    processor: ["processor", "processors", "cpu", "intel", "amd", "ryzen", "core i"],
    processors: ["processor", "processors", "cpu", "intel", "amd", "ryzen", "core i"],
    cpu: ["processor", "processors", "cpu", "core"],
    cpus: ["processor", "processors", "cpu", "core"],
    peripherals: ["peripherals", "peripheral", "keyboard", "mouse", "headset", "webcam", "speaker"],
    peripheral: ["peripherals", "peripheral"],
    cctv: ["cctv", "camera", "surveillance", "security camera", "dvr", "nvr"],
    camera: ["cctv", "camera", "surveillance"],
    cameras: ["cctv", "camera", "cameras", "surveillance"],
    surveillance: ["cctv", "camera", "surveillance"],
    ram: ["ram", "memory", "ddr", "dimm", "sodimm"],
    memory: ["ram", "memory", "ddr"],
    gpu: ["gpu", "graphics card", "graphics", "nvidia", "radeon", "rtx", "gtx"],
    gpus: ["gpu", "graphics card", "graphics", "nvidia", "radeon", "rtx", "gtx"],
    graphics: ["graphics card", "gpu", "nvidia", "radeon"],
    laptop: ["laptop", "laptops", "notebook", "notebooks", "ultrabook"],
    laptops: ["laptop", "laptops", "notebook", "notebooks", "ultrabook"],
    notebook: ["laptop", "laptops", "notebook", "notebooks"],
    notebooks: ["laptop", "laptops", "notebook", "notebooks"],
    desktop: ["desktop", "desktops", "pc", "tower", "workstation"],
    desktops: ["desktop", "desktops", "pc", "tower", "workstation"],
    pc: ["desktop", "desktops", "pc", "tower", "workstation"],
    pcs: ["desktop", "desktops", "pc", "tower", "workstation"],
    monitor: ["monitor", "monitors", "display", "screen", "led"],
    monitors: ["monitor", "monitors", "display", "screen"],
    display: ["monitor", "monitors", "display", "screen"],
    screen: ["monitor", "monitors", "screen", "display"],
    ssd: ["ssd", "solid state", "nvme", "storage"],
    storage: ["ssd", "hdd", "hard disk", "storage", "nvme"],
    "custom pc": ["custom pc", "custom", "build", "gaming pc"],
    custom: ["custom pc", "custom", "build"],
    accessories: ["accessories", "accessory", "ram", "motherboard", "monitor", "keyboard", "mouse", "cpu"],
    motherboard: ["motherboard", "motherboards", "mobo", "mainboard"],
    motherboards: ["motherboard", "motherboards", "mobo", "mainboard"],
    keyboard: ["keyboard", "keyboards", "mechanical keyboard"],
    keyboards: ["keyboard", "keyboards"],
    mouse: ["mouse", "mice", "gaming mouse"],
    mice: ["mouse", "mice"],
    stand: ["stand", "laptop stand", "monitor stand", "riser", "ergonomic stand"],
    stands: ["stand", "laptop stand", "monitor stand", "riser"],
    hub: ["hub", "usb hub", "usb-c hub", "docking station", "dock"],
    hubs: ["hub", "usb hub", "usb-c hub"],
    router: ["router", "wifi router", "wireless router", "broadband router"],
    routers: ["router", "wifi router", "wireless router"],
    cartridge: ["cartridge", "ink cartridge", "toner", "printer cartridge", "ink"],
    cartridges: ["cartridge", "ink cartridge", "toner"],
    "wifi adapter": ["wifi adapter", "wireless adapter", "usb wifi", "network adapter", "dongle"],
    "wifi adapters": ["wifi adapter", "wireless adapter", "usb wifi"],
    dongle: ["wifi adapter", "wireless adapter", "dongle", "usb wifi"],
    toner: ["toner", "cartridge", "ink cartridge", "printer cartridge"],
    ink: ["ink", "ink cartridge", "cartridge", "toner"],
    // ── Apple / MacBook ────────────────────────────────────────────────────────
    apple: ["apple", "macbook", "macbook pro", "macbook air", "macbook neo", "laptop", "laptops", "notebook"],
    macbook: ["macbook", "macbook pro", "macbook air", "macbook neo", "apple", "laptop", "laptops", "notebook"],
    macbooks: ["macbook", "macbook pro", "macbook air", "macbook neo", "apple", "laptop", "laptops", "notebook"],
    "macbook pro": ["macbook pro", "macbook", "macbook air", "macbook neo", "apple", "laptop"],
    "macbook air": ["macbook air", "macbook", "macbook pro", "macbook neo", "apple", "laptop"],
    "macbook neo": ["macbook neo", "macbook", "macbook pro", "macbook air", "apple", "laptop"],


}

// ─── Category Keywords ─────────────────────────────────────────────────────────
export const CATEGORY_KEYWORDS: Record<string, string> = {
    laptop: "Laptop",
    laptops: "Laptop",
    notebook: "Laptop",
    notebooks: "Laptop",
    ultrabook: "Laptop",
    desktop: "Desktop",
    desktops: "Desktop",
    "desktop pc": "Desktop",
    "custom pc": "Custom PC",
    "custom pcs": "Custom PC",
    "gaming pc": "Custom PC",
    accessories: "Accessories",
    keyboard: "Accessories",
    mouse: "Accessories",
    headphones: "Accessories",
    stand: "Accessories",
    stands: "Accessories",
    hub: "Accessories",
    hubs: "Accessories",
    router: "Accessories",
    routers: "Accessories",
    cartridge: "Accessories",
    cartridges: "Accessories",
    "wifi adapter": "Accessories",
    dongle: "Accessories",
    toner: "Accessories",
    macbook: "Laptop",
    macbooks: "Laptop",
    "macbook pro": "Laptop",
    "macbook air": "Laptop",
    "macbook neo": "Laptop",
    apple: "Laptop",
}

// ─── Subcategory Keywords ──────────────────────────────────────────────────────
// Maps search terms → { category, subcategory } (more specific than CATEGORY_KEYWORDS)
export const SUBCATEGORY_KEYWORDS: Record<string, { category: string; subcategory: string }> = {
    keyboard: { category: "Accessories", subcategory: "Keyboard" },
    keyboards: { category: "Accessories", subcategory: "Keyboard" },
    mouse: { category: "Accessories", subcategory: "Mouse" },
    mice: { category: "Accessories", subcategory: "Mouse" },
    headphones: { category: "Accessories", subcategory: "Headphones" },
    headphone: { category: "Accessories", subcategory: "Headphones" },
    stand: { category: "Accessories", subcategory: "Stand" },
    stands: { category: "Accessories", subcategory: "Stand" },
    "laptop stand": { category: "Accessories", subcategory: "Stand" },
    "monitor stand": { category: "Accessories", subcategory: "Stand" },
    hub: { category: "Accessories", subcategory: "Hub" },
    hubs: { category: "Accessories", subcategory: "Hub" },
    "usb hub": { category: "Accessories", subcategory: "Hub" },
    "usb-c hub": { category: "Accessories", subcategory: "Hub" },
    router: { category: "Accessories", subcategory: "Router" },
    routers: { category: "Accessories", subcategory: "Router" },
    cartridge: { category: "Accessories", subcategory: "Cartridge" },
    cartridges: { category: "Accessories", subcategory: "Cartridge" },
    "ink cartridge": { category: "Accessories", subcategory: "Cartridge" },
    toner: { category: "Accessories", subcategory: "Cartridge" },
    "wifi adapter": { category: "Accessories", subcategory: "WIFI Adapter" },
    "wifi adapters": { category: "Accessories", subcategory: "WIFI Adapter" },
    "usb wifi": { category: "Accessories", subcategory: "WIFI Adapter" },
    dongle: { category: "Accessories", subcategory: "WIFI Adapter" },
    gaming: { category: "Laptop", subcategory: "Gaming" },
    "gaming laptop": { category: "Laptop", subcategory: "Gaming" },
    "gaming laptops": { category: "Laptop", subcategory: "Gaming" },
    "business laptop": { category: "Laptop", subcategory: "Business" },
    "student laptop": { category: "Laptop", subcategory: "Student" },
    refurbished: { category: "Laptop", subcategory: "Refurbished" },
    "refurbished laptop": { category: "Laptop", subcategory: "Refurbished" },
    "refurbished laptops": { category: "Laptop", subcategory: "Refurbished" },
}

// ─── normalizeTerm ─────────────────────────────────────────────────────────────
export function normalizeTerm(term: string): string {
    if (!term) return term
    // Try stripping suffix BEFORE checking if term itself is a key
    if (term.endsWith("es") && SEARCH_ALIASES[term.slice(0, -2)]) return term.slice(0, -2)
    if (term.endsWith("s") && SEARCH_ALIASES[term.slice(0, -1)]) return term.slice(0, -1)
    if (SEARCH_ALIASES[term]) return term
    return term
}

// ─── expandTerms ──────────────────────────────────────────────────────────────
export function expandTerms(terms: string[]): string[] {
    const expanded = new Set<string>()
    for (const term of terms) {
        expanded.add(term)
        const normalized = normalizeTerm(term)
        expanded.add(normalized)
        const aliases = SEARCH_ALIASES[normalized] ?? SEARCH_ALIASES[term]
        if (aliases) aliases.forEach(a => expanded.add(a))
    }
    return [...expanded]
}

// ─── inferCategoryFromQuery ────────────────────────────────────────────────────
export function inferCategoryFromQuery(query: string): { category: string; subcategory: string } | null {
    const q = query.trim().toLowerCase()
    if (!q) return null

    // 1. exact subcategory match
    if (SUBCATEGORY_KEYWORDS[q]) return SUBCATEGORY_KEYWORDS[q]

    // 2. subcategory keyword contained anywhere in query
    for (const [keyword, result] of Object.entries(SUBCATEGORY_KEYWORDS)) {
        if (q.includes(keyword)) return result
    }

    // 3. exact category match
    if (CATEGORY_KEYWORDS[q]) return { category: CATEGORY_KEYWORDS[q], subcategory: "" }

    // 4. category keyword contained anywhere in query
    for (const [keyword, cat] of Object.entries(CATEGORY_KEYWORDS)) {
        if (q.includes(keyword)) return { category: cat, subcategory: "" }
    }

    return null
}