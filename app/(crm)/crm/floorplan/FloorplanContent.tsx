'use client';

import { ClockIcon, WarningCircleIcon } from '@phosphor-icons/react/dist/ssr';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { getIsoDateOrFallback } from '../_shared/date';
import { FloorPlanGrid } from './_components/FloorPlanGrid';
import { FloorPlanToolbar } from './_components/FloorPlanToolbar';
import { ReservationAssignmentMenu } from './_components/ReservationAssignmentMenu';
import { TableOccupancyPopup } from './_components/TableOccupancyPopup';
import { useFloorPlanData } from './hooks/useFloorPlanData';
import { useMobilePortrait } from './hooks/useMobilePortrait';
import type { DisplayTableId } from './types';

export function FloorplanContent() {
    const searchParams = useSearchParams();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [selectedTableId, setSelectedTableId] = useState<DisplayTableId | null>(null);
    const isMobilePortrait = useMobilePortrait();

    const selectedDate = useMemo(
        () => getIsoDateOrFallback(searchParams.get('date'), new Date().toISOString().slice(0, 10)),
        [searchParams]
    );

    const {
        isLoading,
        loadError,
        savingReservationId,
        assignmentError,
        visualTables,
        dayReservations,
        reservationsByDisplayTable,
        toggleTableAssignment,
    } = useFloorPlanData(selectedDate);

    const selectedTableLabel = selectedTableId ? (visualTables.get(selectedTableId)?.label ?? `Table ${selectedTableId}`) : null;
    const selectedTableReservations = selectedTableId ? (reservationsByDisplayTable.get(selectedTableId) ?? []) : [];

    useEffect(() => {
        if (!isMobilePortrait) return;
        setIsMenuOpen(false);
        setSelectedTableId(null);
    }, [isMobilePortrait]);

    return (
        <div className="space-y-6">
            <section className="mx-auto max-w-4xl lg:max-w-[96rem] rounded-2xl border border-slate-300 bg-[#ebebeb] p-4 sm:p-5 lg:p-8 min-h-[420px] lg:min-h-[700px]">
                <FloorPlanToolbar
                    selectedDate={selectedDate}
                    reservationCount={dayReservations.length}
                    isMenuOpen={isMenuOpen}
                    menuDisabled={isMobilePortrait}
                    onToggleMenu={() => {
                        if (isMobilePortrait) return;
                        setIsMenuOpen((previous) => !previous);
                    }}
                />

                {loadError && (
                    <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 inline-flex items-center gap-1.5">
                        <WarningCircleIcon size={14} weight="fill" />
                        {loadError}
                    </div>
                )}

                {isMobilePortrait ? (
                    <div className="rounded-xl border border-slate-300 bg-white/70 px-5 py-7 text-center">
                        <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                            <WarningCircleIcon size={16} />
                            Rotate to landscape to use floor plan
                        </p>
                        <p className="mt-2 text-sm text-slate-600">
                            On mobile, table assignment and the reservations drawer are available in horizontal orientation.
                        </p>
                    </div>
                ) : isLoading ? (
                    <div className="rounded-xl border border-slate-300 bg-white/70 px-4 py-6 text-sm text-slate-600 inline-flex items-center gap-1.5">
                        <ClockIcon size={14} />
                        Loading floor plan...
                    </div>
                ) : (
                    <div className="w-full overflow-hidden px-4 py-5 sm:px-5 sm:py-6 lg:px-10 lg:py-12">
                        <FloorPlanGrid
                            reservationsByDisplayTable={reservationsByDisplayTable}
                            onSelectTable={setSelectedTableId}
                        />
                    </div>
                )}
            </section>

            {!isMobilePortrait && (
                <ReservationAssignmentMenu
                    open={isMenuOpen}
                    reservations={dayReservations}
                    visualTables={visualTables}
                    savingReservationId={savingReservationId}
                    assignmentError={assignmentError}
                    onToggleAssignment={toggleTableAssignment}
                    onClose={() => setIsMenuOpen(false)}
                />
            )}

            {!isMobilePortrait && (
                <TableOccupancyPopup
                    tableLabel={selectedTableLabel}
                    reservations={selectedTableReservations}
                    onClose={() => setSelectedTableId(null)}
                />
            )}
        </div>
    );
}
