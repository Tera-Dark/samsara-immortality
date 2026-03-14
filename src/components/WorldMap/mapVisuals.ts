import {
    Building2,
    Castle,
    Gem,
    Landmark,
    Leaf,
    Map,
    Mountain,
    Shield,
    ShoppingBag,
    Store,
    Trees,
    Waves,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { LocationType } from '../../types/worldTypes';

export type MapVisual = {
    label: string;
    icon: LucideIcon;
    color: string;
    background: string;
    border: string;
    glow: string;
};

const LOCATION_VISUALS: Record<LocationType | 'REGION_CENTER', MapVisual> = {
    REGION_CENTER: {
        label: '区域核心',
        icon: Map,
        color: '#f8fafc',
        background: 'rgba(148, 163, 184, 0.22)',
        border: 'rgba(226, 232, 240, 0.75)',
        glow: 'rgba(226, 232, 240, 0.35)',
    },
    CITY: {
        label: '城镇坊市',
        icon: Building2,
        color: '#86efac',
        background: 'rgba(22, 163, 74, 0.22)',
        border: 'rgba(134, 239, 172, 0.8)',
        glow: 'rgba(74, 222, 128, 0.35)',
    },
    SECT_HQ: {
        label: '宗门驻地',
        icon: Shield,
        color: '#fca5a5',
        background: 'rgba(220, 38, 38, 0.24)',
        border: 'rgba(252, 165, 165, 0.8)',
        glow: 'rgba(248, 113, 113, 0.35)',
    },
    SECRET_REALM: {
        label: '秘境',
        icon: Waves,
        color: '#c4b5fd',
        background: 'rgba(124, 58, 237, 0.22)',
        border: 'rgba(196, 181, 253, 0.8)',
        glow: 'rgba(167, 139, 250, 0.4)',
    },
    WILDERNESS: {
        label: '荒野',
        icon: Trees,
        color: '#d1d5db',
        background: 'rgba(71, 85, 105, 0.24)',
        border: 'rgba(209, 213, 219, 0.7)',
        glow: 'rgba(148, 163, 184, 0.3)',
    },
    MINE: {
        label: '矿脉',
        icon: Mountain,
        color: '#fcd34d',
        background: 'rgba(217, 119, 6, 0.25)',
        border: 'rgba(252, 211, 77, 0.82)',
        glow: 'rgba(251, 191, 36, 0.35)',
    },
    HERB_GARDEN: {
        label: '灵药园',
        icon: Leaf,
        color: '#6ee7b7',
        background: 'rgba(5, 150, 105, 0.22)',
        border: 'rgba(110, 231, 183, 0.8)',
        glow: 'rgba(52, 211, 153, 0.35)',
    },
    SPIRIT_VEIN: {
        label: '灵脉',
        icon: Gem,
        color: '#93c5fd',
        background: 'rgba(37, 99, 235, 0.22)',
        border: 'rgba(147, 197, 253, 0.8)',
        glow: 'rgba(96, 165, 250, 0.35)',
    },
    RUINS: {
        label: '遗迹',
        icon: Landmark,
        color: '#fdba74',
        background: 'rgba(194, 65, 12, 0.24)',
        border: 'rgba(253, 186, 116, 0.82)',
        glow: 'rgba(251, 146, 60, 0.35)',
    },
    MARKET: {
        label: '集市',
        icon: Store,
        color: '#fde68a',
        background: 'rgba(202, 138, 4, 0.22)',
        border: 'rgba(253, 230, 138, 0.8)',
        glow: 'rgba(250, 204, 21, 0.35)',
    },
    INN: {
        label: '客栈',
        icon: Castle,
        color: '#f9a8d4',
        background: 'rgba(190, 24, 93, 0.22)',
        border: 'rgba(249, 168, 212, 0.8)',
        glow: 'rgba(244, 114, 182, 0.35)',
    },
    AUCTION_HOUSE: {
        label: '拍卖行',
        icon: ShoppingBag,
        color: '#f5d0fe',
        background: 'rgba(162, 28, 175, 0.22)',
        border: 'rgba(245, 208, 254, 0.8)',
        glow: 'rgba(232, 121, 249, 0.35)',
    },
    SECT: {
        label: '宗门据点',
        icon: Shield,
        color: '#bfdbfe',
        background: 'rgba(30, 64, 175, 0.22)',
        border: 'rgba(191, 219, 254, 0.8)',
        glow: 'rgba(96, 165, 250, 0.35)',
    },
};

export function getMapVisual(type: LocationType | 'REGION_CENTER'): MapVisual {
    return LOCATION_VISUALS[type] ?? LOCATION_VISUALS.WILDERNESS;
}
