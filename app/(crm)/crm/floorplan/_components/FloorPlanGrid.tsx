import { FLOORPLAN_TABLE_LAYOUT } from '../constants';
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
            {FLOORPLAN_TABLE_LAYOUT.map(({ displayId, variant, tableClassName, topSeats, bottomSeats }) => {
                const previewReservation = getPreviewReservation(reservationsByDisplayTable, displayId);

                if (variant === 'end') {
                    return (
                        <EndSeatTable
                            key={displayId}
                            displayId={displayId}
                            tableClassName={tableClassName}
                            topSeats={topSeats}
                            bottomSeats={bottomSeats}
                            reservation={previewReservation}
                            onSelectTable={onSelectTable}
                        />
                    );
                }

                return (
                    <SideSeatTable
                        key={displayId}
                        displayId={displayId}
                        tableClassName={tableClassName}
                        reservation={previewReservation}
                        onSelectTable={onSelectTable}
                    />
                );
            })}
        </div>
    );
}
