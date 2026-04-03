import { useCallback, useEffect, useMemo, useState } from 'react';

import type { QueueEntry, Reservation, Table } from '../types';
import { buildDayNotes, getBusiestTime, parseTimeToMinutes } from '../utils';

type UseDashboardDataResult = {
    queue: QueueEntry[];
    tables: Table[];
    isLoading: boolean;
    loadError: string | null;
    dayReservations: Reservation[];
    dayNotes: ReturnType<typeof buildDayNotes>;
    busiestTime: ReturnType<typeof getBusiestTime>;
    tablesUsedDay: number;
    refreshData: () => Promise<void>;
    removeQueueEntry: (queueId: string) => void;
    addReservation: (reservation: Reservation) => void;
    updateReservation: (reservation: Reservation) => void;
    removeReservation: (reservationId: string) => void;
};

export function useDashboardData(selectedDate: string): UseDashboardDataResult {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [queue, setQueue] = useState<QueueEntry[]>([]);
    const [tables, setTables] = useState<Table[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    const refreshData = useCallback(async () => {
        setLoadError(null);
        try {
            const [reservationsResp, queueResp, tablesResp] = await Promise.all([
                fetch('/api/crm/reservations'),
                fetch('/api/crm/queue'),
                fetch('/api/crm/tables'),
            ]);

            const [reservationsData, queueData, tablesData] = await Promise.all([
                reservationsResp.json().catch(() => null),
                queueResp.json().catch(() => null),
                tablesResp.json().catch(() => null),
            ]);

            if (!reservationsResp.ok || !queueResp.ok) {
                const parts: string[] = [];
                if (!reservationsResp.ok) parts.push('reservations');
                if (!queueResp.ok) parts.push('queue');
                setLoadError(`Could not load: ${parts.join(', ')}. Check server logs / Upstash.`);
            }

            setReservations(Array.isArray(reservationsData) ? (reservationsData as Reservation[]) : []);
            setQueue(Array.isArray(queueData) ? (queueData as QueueEntry[]) : []);
            setTables(Array.isArray(tablesData) ? (tablesData as Table[]) : []);
        } catch {
            setLoadError('Unable to load dashboard data right now.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void refreshData();
    }, [refreshData]);

    const dayReservations = useMemo(
        () =>
            reservations
                .filter((reservation) => reservation.date === selectedDate)
                .sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time)),
        [reservations, selectedDate]
    );

    const dayNotes = useMemo(() => buildDayNotes(dayReservations), [dayReservations]);
    const busiestTime = useMemo(() => getBusiestTime(dayReservations), [dayReservations]);
    const tablesUsedDay = useMemo(
        () => new Set(dayReservations.flatMap((reservation) => reservation.tableIds ?? [])).size,
        [dayReservations]
    );

    const removeQueueEntry = useCallback((queueId: string) => {
        setQueue((previous) => previous.filter((entry) => entry.id !== queueId));
    }, []);

    const addReservation = useCallback((reservation: Reservation) => {
        setReservations((previous) => [...previous, reservation]);
    }, []);

    const updateReservation = useCallback((reservation: Reservation) => {
        setReservations((previous) =>
            previous.map((currentReservation) => (currentReservation.id === reservation.id ? reservation : currentReservation))
        );
    }, []);

    const removeReservation = useCallback((reservationId: string) => {
        setReservations((previous) =>
            previous.filter((currentReservation) => currentReservation.id !== reservationId)
        );
    }, []);

    return {
        queue,
        tables,
        isLoading,
        loadError,
        dayReservations,
        dayNotes,
        busiestTime,
        tablesUsedDay,
        refreshData,
        removeQueueEntry,
        addReservation,
        updateReservation,
        removeReservation,
    };
}
