import { DISPLAY_TABLE_IDS } from './types';
import type { DisplayTableId } from './types';

export const FLOORPLAN_RENDER_ORDER: DisplayTableId[] = ['1', '2', '3', '6', '5', '4'];
export const DISPLAY_TABLE_SET = new Set<string>(DISPLAY_TABLE_IDS);
export const NEUTRAL_SHAPE = 'bg-[#8a8a8a]';
