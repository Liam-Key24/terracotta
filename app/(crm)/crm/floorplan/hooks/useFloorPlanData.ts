import { useCallback, useEffect, useMemo, useState } from 'react';

import { DISPLAY_TABLE_IDS } from '../types';
import type { DisplayTableId, FloorReservation, FloorTable } from '../types';
import { buildVisualTableMap, parseTimeToMinutes, reservationHasTable } from '../utils';

type UseFloorPlanDataResult = {
    isLoading: boolean;
    loadError: string | null;
    savingReservationId: string | null;
    assignmentError: string | null;
    visualTables: ReturnType<typeof buildVisualTableMap>;
    dayReservations: FloorReservation[];
    reservationsByDisplayTable: Map<DisplayTableId, FloorReservation[]>;
    toggleTableAssignment: (reservation: FloorReservation, displayId: DisplayTableId) => Promise<void>;
};

export function useFloorPlanData(selectedDate: string): UseFloorPlanDataResult {
    const [reservations, setReservations] = useState<FloorReservation[]>([]);
    const [tables, setTables] = useState<FloorTable[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [savingReservationId, setSavingReservationId] = useState<string | null>(null);
    const [assignmentError, setAssignmentError] = useState<string | null>(null);

    const refetchData = useCallback(async () => {
        setLoadError(null);
        try {
            const [reservationsResponse, tablesResponse] = await Promise.all([
                fetch('/api/crm/reservations', { cache: 'no-store' }),
                fetch('/api/crm/tables', { cache: 'no-store' }),
            ]);

            const reservationsPayload = await reservationsResponse.json().catch(() => []);
            const tablesPayload = await tablesResponse.json().catch(() => []);

            if (!reservationsResponse.ok || !tablesResponse.ok) {
                setLoadError('Unable to load floor plan data right now.');
                return;
            }

            setReservations(Array.isArray(reservationsPayload) ? (reservationsPayload as FloorReservation[]) : []);
            setTables(Array.isArray(tablesPayload) ? (tablesPayload as FloorTable[]) : []);
        } catch {
            setLoadError('Unable to load floor plan data right now.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void refetchData();
    }, [refetchData]);

    useEffect(() => {
        const onFocus = () => void refetchData();
        window.addEventListener('focus', onFocus);
        return () => window.removeEventListener('focus', onFocus);
    }, [refetchData]);

    const visualTables = useMemo(() => buildVisualTableMap(tables), [tables]);

    const dayReservations = useMemo(
        () =>
            reservations
                .filter((reservation) => reservation.date === selectedDate)
                .sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time)),
        [reservations, selectedDate]
    );

    const reservationsByDisplayTable = useMemo(() => {
        const map = new Map<DisplayTableId, FloorReservation[]>();
        DISPLAY_TABLE_IDS.forEach((displayId) => map.set(displayId, []));

        dayReservations.forEach((reservation) => {
            DISPLAY_TABLE_IDS.forEach((displayId) => {
                const table = visualTables.get(displayId);
                if (!table) return;
                if (reservationHasTable(reservation, table)) {
                    map.get(displayId)?.push(reservation);
                }
            });
        });

        return map;
    }, [dayReservations, visualTables]);

    const toggleTableAssignment = useCallback(
        async (reservation: FloorReservation, displayId: DisplayTableId) => {
            const table = visualTables.get(displayId);
            if (!table) return;

            const isAssigned = reservationHasTable(reservation, table);
            const nextTableIds = isAssigned ? [] : [table.backendId];

            setSavingReservationId(reservation.id);
            setAssignmentError(null);

            try {
                const idPath = encodeURIComponent(reservation.id);
                const response = await fetch(`/api/crm/reservations/${idPath}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tableIds: nextTableIds }),
                });

                const payload = await response.json().catch(() => ({}));
                if (!response.ok) {
                    setAssignmentError(
                        typeof payload?.error === 'string' ? payload.error : 'Unable to update table assignment.'
                    );
                    return;
                }

                setReservations((prev) =>
                    prev.map((item) => (item.id === reservation.id ? (payload as FloorReservation) : item))
                );
            } catch {
                setAssignmentError('Something went wrong while updating table assignment.');
            } finally {
                setSavingReservationId(null);
            }
        },
        [visualTables]
    );

    return {
        isLoading,
        loadError,
        savingReservationId,
        assignmentError,
        visualTables,
        dayReservations,
        reservationsByDisplayTable,
        toggleTableAssignment,
    };
}
