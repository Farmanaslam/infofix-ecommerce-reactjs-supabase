
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
}

export const CATEGORY_KEYWORDS: Record<string, string> = {
    laptop: "Laptop",
    laptops: "Laptop",
    notebook: "Laptop",
    notebooks: "Laptop",
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
    hub: "Accessories",
    stand: "Accessories",
    router: "Accessories",
}

export const SUBCATEGORY_KEYWORDS: Record<string, { category: string; subcategory: string }> = {
    keyboard: { category: "Accessories", subcategory: "Keyboard" },
    keyboards: { category: "Accessories", subcategory: "Keyboard" },
    mouse: { category: "Accessories", subcategory: "Mouse" },
    mice: { category: "Accessories", subcategory: "Mouse" },
    headphones: { category: "Accessories", subcategory: "Headphones" },
    headphone: { category: "Accessories", subcategory: "Headphones" },
    hub: { category: "Accessories", subcategory: "Hub" },
    stand: { category: "Accessories", subcategory: "Stand" },
    "wifi adapter": { category: "Accessories", subcategory: "WIFI Adapter" },
    "wifi adapters": { category: "Accessories", subcategory: "WIFI Adapter" },
    router: { category: "Accessories", subcategory: "Router" },
    routers: { category: "Accessories", subcategory: "Router" },
    gaming: { category: "Laptop", subcategory: "Gaming" },
    "gaming laptop": { category: "Laptop", subcategory: "Gaming" },
    "gaming laptops": { category: "Laptop", subcategory: "Gaming" },
    "business laptop": { category: "Laptop", subcategory: "Business" },
    "student laptop": { category: "Laptop", subcategory: "Student" },
    refurbished: { category: "Laptop", subcategory: "Refurbished" },
    "refurbished laptop": { category: "Laptop", subcategory: "Refurbished" },
    "refurbished laptops": { category: "Laptop", subcategory: "Refurbished" },
}
export function normalizeTerm(term: string): string {
    if (!term) return term;

    if (term.endsWith("es") && SEARCH_ALIASES[term.slice(0, -2)])
        return term.slice(0, -2);
    if (term.endsWith("s") && SEARCH_ALIASES[term.slice(0, -1)])
        return term.slice(0, -1);
    if (SEARCH_ALIASES[term]) return term;
    return term;
}

export function expandTerms(terms: string[]): string[] {
    const expanded = new Set<string>();
    for (const term of terms) {
        expanded.add(term);
        // FIX 2: normalize before looking up aliases
        const normalized = normalizeTerm(term);
        expanded.add(normalized);
        const aliases = SEARCH_ALIASES[normalized] ?? SEARCH_ALIASES[term];
        if (aliases) aliases.forEach((a) => expanded.add(a));
    }
    return [...expanded];
}
export function inferCategoryFromQuery(query: string): { category: string; subcategory: string } | null {
    const q = query.trim().toLowerCase()
    if (SUBCATEGORY_KEYWORDS[q]) return SUBCATEGORY_KEYWORDS[q]
    for (const [keyword, result] of Object.entries(SUBCATEGORY_KEYWORDS)) {
        if (q === keyword || q.startsWith(keyword + " ")) return result
    }
    if (CATEGORY_KEYWORDS[q]) return { category: CATEGORY_KEYWORDS[q], subcategory: "" }
    for (const [keyword, cat] of Object.entries(CATEGORY_KEYWORDS)) {
        if (q === keyword || q.startsWith(keyword + " ")) return { category: cat, subcategory: "" }
    }
    return null
}