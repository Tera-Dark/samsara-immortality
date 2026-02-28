export interface StatDefinition {
    id: string;
    name: string;
    type: 'int' | 'float';
    min?: number;
    max?: number;
    base: number;
    visible: boolean;
    description?: string;
    color?: string; // Tailwind class e.g. "text-red-500"
}

export interface ResourceDefinition {
    id: string;
    name: string;
    description?: string;
    base: number;
    icon?: string; // Emoji or URL
    exchange?: {
        target: string;
        rate: number;
    } | null;
}

export interface ModuleConfig {
    id: string;
    name: string;
    author: string;
    version: string;
    description: string;

    // Core Rules
    stats: StatDefinition[];
    resources: ResourceDefinition[];

    // Limits
    maxLifespanFormula?: string; // JS Expression e.g. "80 + stats.STR * 5"
}

export interface ModuleData {
    config: ModuleConfig;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    events: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    talents: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    items: any[];
}

// --- Visual Novel / Scene Types ---

export interface SceneCharacter {
    id: string; // e.g. "heroine"
    name?: string; // Override name
    image: string; // Asset path
    position: 'left' | 'center' | 'right' | 'left-center' | 'right-center';
    expression?: string; // e.g. "smile", "angry"
    animation?: 'fade-in' | 'shake' | 'jump';
}

export interface SceneData {
    id?: string;
    background?: string; // Asset path
    music?: string;
    effect?: 'shake' | 'flash' | 'fade-in' | 'fade-out' | 'blur'; // Screen Effects
    characters: SceneCharacter[];
    dialogue?: {
        speaker: string;
        content: string;
        voice?: string;
    };
    choices?: {
        text: string;
        action: string; // Link to next event or script id
    }[];
}
