import type { DisplayTableId } from './types';

type FloorTableLayout = {
    displayId: DisplayTableId;
    physicalId: DisplayTableId;
    variant: 'side' | 'end';
    tableClassName: string;
    topSeats?: number;
    bottomSeats?: number;
};

const SIDE_TABLE_CLASS = 'w-[5.76rem] h-[9.36rem] lg:w-[9.216rem] lg:h-[14.976rem]';
const END_TABLE_SMALL_CLASS = 'w-[4.32rem] h-[4.32rem] lg:w-[6.912rem] lg:h-[6.912rem]';
const END_TABLE_WIDE_CLASS = 'w-[8.64rem] h-[5.4rem] lg:w-[13.824rem] lg:h-[8.64rem]';
const END_TABLE_TALL_CLASS = 'w-[3.96rem] h-[4.32rem] lg:w-[6.336rem] lg:h-[6.912rem]';

export const FLOORPLAN_TABLE_LAYOUT: FloorTableLayout[] = [
    {
        displayId: '4',
        physicalId: '1',
        variant: 'side',
        tableClassName: SIDE_TABLE_CLASS,
    },
    {
        displayId: '5',
        physicalId: '2',
        variant: 'end',
        tableClassName: END_TABLE_SMALL_CLASS,
    },
    {
        displayId: '6',
        physicalId: '3',
        variant: 'end',
        tableClassName: END_TABLE_WIDE_CLASS,
        topSeats: 2,
        bottomSeats: 2,
    },
    {
        displayId: '3',
        physicalId: '6',
        variant: 'end',
        tableClassName: END_TABLE_TALL_CLASS,
    },
    {
        displayId: '2',
        physicalId: '5',
        variant: 'side',
        tableClassName: SIDE_TABLE_CLASS,
    },
    {
        displayId: '1',
        physicalId: '4',
        variant: 'side',
        tableClassName: SIDE_TABLE_CLASS,
    },
];

export const PHYSICAL_TO_DISPLAY_TABLE_ID: Record<DisplayTableId, DisplayTableId> = Object.fromEntries(
    FLOORPLAN_TABLE_LAYOUT.map(({ displayId, physicalId }) => [physicalId, displayId] as const)
) as Record<DisplayTableId, DisplayTableId>;

export const NEUTRAL_SHAPE = 'bg-[#8a8a8a]';
