'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { CalendarCheckIcon, ClockIcon, QueueIcon, TableIcon } from '@phosphor-icons/react/dist/ssr';

import { getIsoDateOrFallback, toLocalIso } from '../_shared/date';
import { ReservationDetailsDrawer } from '../calendar/_components/ReservationDetailsDrawer';
import { DashboardListPanel } from './_components/DashboardListPanel';
import { DayMetricCard } from './_components/DayMetricCard';
import { DayNotesPanel } from './_components/DayNotesPanel';
import { QueueEntryDrawer } from './_components/QueueEntryDrawer';
import { useDashboardData } from './hooks/useDashboardData';
import type { QueueAction, QueueEntry, Reservation } from './types';
import { formatLongDate } from './utils';

export default function CrmDashboardPage() {
    const searchParams = useSearchParams();

    const [activeListTab, setActiveListTab] = useState<'queue' | 'reservations'>('queue');
    const [drawerEntry, setDrawerEntry] = useState<QueueEntry | null>(null);
    const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
    const [suggestMode, setSuggestMode] = useState(false);
    const [suggestDate, setSuggestDate] = useState('');
    const [suggestTime, setSuggestTime] = useState('');
    const [selectedTableIds, setSelectedTableIds] = useState<string[]>([]);
    const [actionLoading, setActionLoading] = useState<QueueAction>(null);
    const [actionError, setActionError] = useState('');

    const selectedDate = useMemo(() => {
        return getIsoDateOrFallback(searchParams.get('date'), toLocalIso(new Date()));
    }, [searchParams]);

    const {
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
    } = useDashboardData(selectedDate);

    function openQueueEntry(entry: QueueEntry) {
        setSelectedReservation(null);
        setDrawerEntry(entry);
        setSuggestMode(false);
        setSuggestDate('');
        setSuggestTime('');
        setSelectedTableIds([]);
        setActionError('');
    }

    function openReservationEntry(reservation: Reservation) {
        setDrawerEntry(null);
        setSelectedReservation(reservation);
    }

    function toggleTable(id: string) {
        setSelectedTableIds((previous) =>
            previous.includes(id) ? previous.filter((tableId) => tableId !== id) : [...previous, id]
        );
    }

    function handleReservationUpdated(updated: Reservation) {
        updateReservation(updated);
        setSelectedReservation(updated);
    }

    function handleReservationCancelled(reservationId: string) {
        removeReservation(reservationId);
        setSelectedReservation((previous) => (previous?.id === reservationId ? null : previous));
    }

    async function approve() {
        if (!drawerEntry) return;
        setActionLoading('approve');
        setActionError('');
        try {
            const response = await fetch('/api/crm/queue', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'approve',
                    queueId: drawerEntry.id,
                    tableIds: selectedTableIds,
                }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                setActionError(typeof data?.error === 'string' ? data.error : 'Failed to approve.');
                return;
            }

            removeQueueEntry(drawerEntry.id);
            if (data.record) {
                addReservation(data.record as Reservation);
            } else {
                await refreshData();
            }
            setDrawerEntry(null);
        } catch {
            setActionError('Request failed.');
        } finally {
            setActionLoading(null);
        }
    }

    async function reject() {
        if (!drawerEntry) return;
        setActionLoading('reject');
        setActionError('');
        try {
            const response = await fetch('/api/crm/queue', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'reject', queueId: drawerEntry.id }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                setActionError(typeof data?.error === 'string' ? data.error : 'Failed to reject.');
                return;
            }

            removeQueueEntry(drawerEntry.id);
            setDrawerEntry(null);
        } catch {
            setActionError('Request failed.');
        } finally {
            setActionLoading(null);
        }
    }

    async function suggestAlternative() {
        if (!drawerEntry || !suggestDate || !suggestTime) return;
        setActionLoading('suggest');
        setActionError('');
        try {
            const response = await fetch('/api/crm/queue', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'suggest-alternative',
                    queueId: drawerEntry.id,
                    suggestedDate: suggestDate,
                    suggestedTime: suggestTime,
                    suggestedTableIds: selectedTableIds.length ? selectedTableIds : undefined,
                }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                setActionError(typeof data?.error === 'string' ? data.error : 'Failed to send alternative.');
                return;
            }

            removeQueueEntry(drawerEntry.id);
            setDrawerEntry(null);
            setSuggestMode(false);
        } catch {
            setActionError('Request failed.');
        } finally {
            setActionLoading(null);
        }
    }

    return (
        <div className="mx-auto w-full max-w-[1320px]">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-200">
                    <DayMetricCard
                        title="Total Reservations"
                        value={`${dayReservations.length}`}
                        subtitle={formatLongDate(selectedDate)}
                        icon={<CalendarCheckIcon size={18} weight="duotone" />}
                    />
                    <DayMetricCard
                        title="Busiest Time"
                        value={busiestTime ? busiestTime.time : '—'}
                        subtitle={busiestTime ? `${busiestTime.count} bookings in this slot` : 'No bookings for this date'}
                        icon={<ClockIcon size={18} weight="duotone" />}
                    />
                    <DayMetricCard
                        title="Pending Queue"
                        value={`${queue.length}`}
                        subtitle="Awaiting approval"
                        icon={<QueueIcon size={18} weight="duotone" />}
                    />
                    <DayMetricCard
                        title="Tables Used"
                        value={`${tablesUsedDay}`}
                        subtitle="Across selected date"
                        icon={<TableIcon size={18} weight="duotone" />}
                    />
                </div>
            </div>

            {loadError && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {loadError}
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <DashboardListPanel
                    activeListTab={activeListTab}
                    selectedDateLabel={formatLongDate(selectedDate)}
                    isLoading={isLoading}
                    queue={queue}
                    dayReservations={dayReservations}
                    onChangeTab={setActiveListTab}
                    onOpenQueueEntry={openQueueEntry}
                    onOpenReservationEntry={openReservationEntry}
                />
                <DayNotesPanel dayNotes={dayNotes} />
            </div>

            <QueueEntryDrawer
                entry={drawerEntry}
                tables={tables}
                selectedTableIds={selectedTableIds}
                suggestMode={suggestMode}
                suggestDate={suggestDate}
                suggestTime={suggestTime}
                actionLoading={actionLoading}
                actionError={actionError}
                onToggleTable={toggleTable}
                onSetSuggestMode={setSuggestMode}
                onSetSuggestDate={setSuggestDate}
                onSetSuggestTime={setSuggestTime}
                onApprove={approve}
                onReject={reject}
                onSuggestAlternative={suggestAlternative}
                onClose={() => setDrawerEntry(null)}
            />

            {selectedReservation && (
                <ReservationDetailsDrawer
                    reservation={selectedReservation}
                    tables={tables}
                    onClose={() => setSelectedReservation(null)}
                    onUpdated={handleReservationUpdated}
                    onCancelled={handleReservationCancelled}
                />
            )}
        </div>
    );
}
