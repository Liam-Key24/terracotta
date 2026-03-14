import { FLOORPLAN_RENDER_ORDER } from '../constants';
import type { DisplayTableId, FloorReservation } from '../types';
import { EndSeatTable, SideSeatTable } from './FloorTableUnits';

type FloorPlanGridProps = {
    reservationsByDisplayTable: Map<DisplayTableId, FloorReservation[]>;
    onSelectTable: (displayId: DisplayTableId) => void;
};

function getPreviewReservation(
    reservationsByDisplayTable: Map<DisplayTableId, FloorReservation[]>,
    displayId: DisplayTableId
) {
    return (reservationsByDisplayTable.get(displayId) ?? [])[0];
}

export function FloorPlanGrid({ reservationsByDisplayTable, onSelectTable }: FloorPlanGridProps) {
    return (
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-14 lg:gap-24 place-items-center">
            {FLOORPLAN_RENDER_ORDER.map((displayId) => {
                const previewReservation = getPreviewReservation(reservationsByDisplayTable, displayId);

                if (displayId === '2') {
                    return (
                        <EndSeatTable
                            key={displayId}
                            displayId={displayId}
                            tableClassName="w-[4.32rem] h-[4.32rem] lg:w-[6.912rem] lg:h-[6.912rem]"
                            reservation={previewReservation}
                            onSelectTable={onSelectTable}
                        />
                    );
                }

                if (displayId === '3') {
                    return (
                        <EndSeatTable
                            key={displayId}
                            displayId={displayId}
                            tableClassName="w-[8.64rem] h-[5.4rem] lg:w-[13.824rem] lg:h-[8.64rem]"
                            topSeats={2}
                            bottomSeats={2}
                            reservation={previewReservation}
                            onSelectTable={onSelectTable}
                        />
                    );
                }

                if (displayId === '6') {
                    return (
                        <EndSeatTable
                            key={displayId}
                            displayId={displayId}
                            tableClassName="w-[3.96rem] h-[4.32rem] lg:w-[6.336rem] lg:h-[6.912rem]"
                            reservation={previewReservation}
                            onSelectTable={onSelectTable}
                        />
                    );
                }

                return (
                    <SideSeatTable
                        key={displayId}
                        displayId={displayId}
                        tableClassName="w-[5.76rem] h-[9.36rem] lg:w-[9.216rem] lg:h-[14.976rem]"
                        reservation={previewReservation}
                        onSelectTable={onSelectTable}
                    />
                );
            })}
        </div>
    );
}
