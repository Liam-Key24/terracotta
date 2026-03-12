import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { SLOTS_30 } from '../constants';
import type { Reservation } from '../types';
import { getReservationDetails } from '../utils';

type ReservationEditDraft = {
    name: string;
    email: string;
    phone: string;
    date: string;
    time: string;
    guests: string;
    notes: string;
};

type ReservationDetailsDrawerProps = {
    reservation: Reservation;
    onClose: () => void;
    onUpdated: (reservation: Reservation) => void;
    onCancelled: (reservationId: string) => void;
};

function toDraft(reservation: Reservation): ReservationEditDraft {
    return {
        name: reservation.name ?? '',
        email: reservation.email ?? '',
        phone: reservation.phone ?? '',
        date: reservation.date ?? '',
        time: reservation.time ?? '18:00',
        guests: reservation.guests ?? '2',
        notes: reservation.notes ?? '',
    };
}

export function ReservationDetailsDrawer({
    reservation,
    onClose,
    onUpdated,
    onCancelled,
}: ReservationDetailsDrawerProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [draft, setDraft] = useState<ReservationEditDraft>(toDraft(reservation));
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const [isCancelReasonOpen, setIsCancelReasonOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelError, setCancelError] = useState<string | null>(null);
    const [isCancelling, setIsCancelling] = useState(false);

    const details = useMemo(() => getReservationDetails(reservation), [reservation]);

    useEffect(() => {
        setIsEditing(false);
        setDraft(toDraft(reservation));
        setIsSaving(false);
        setSaveError(null);

        setIsCancelReasonOpen(false);
        setCancelReason('');
        setCancelError(null);
        setIsCancelling(false);
    }, [reservation]);

    async function saveEdits(e: FormEvent) {
        e.preventDefault();
        if (!draft.name.trim() || !draft.date.trim() || !draft.time.trim()) {
            setSaveError('Name, date and time are required.');
            return;
        }

        setIsSaving(true);
        setSaveError(null);

        try {
            const resp = await fetch(`/api/crm/reservations/${reservation.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: draft.name.trim(),
                    email: draft.email.trim(),
                    phone: draft.phone.trim(),
                    date: draft.date.trim(),
                    time: draft.time.trim(),
                    guests: draft.guests.trim(),
                    notes: draft.notes.trim(),
                }),
            });

            const payload = await resp.json().catch(() => ({}));
            if (!resp.ok) {
                setSaveError(typeof payload?.error === 'string' ? payload.error : 'Unable to save changes.');
                return;
            }

            onUpdated(payload as Reservation);
            setIsEditing(false);
        } catch {
            setSaveError('Something went wrong while saving.');
        } finally {
            setIsSaving(false);
        }
    }

    async function cancelBooking() {
        const reason = cancelReason.trim();
        if (!reason) {
            setCancelError('Please provide a cancellation reason.');
            return;
        }

        setIsCancelling(true);
        setCancelError(null);

        try {
            const resp = await fetch(`/api/crm/reservations/${reservation.id}/cancel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason }),
            });

            const payload = await resp.json().catch(() => ({}));
            if (!resp.ok) {
                setCancelError(typeof payload?.error === 'string' ? payload.error : 'Unable to cancel booking.');
                return;
            }

            onCancelled(reservation.id);
            onClose();
        } catch {
            setCancelError('Something went wrong while cancelling.');
        } finally {
            setIsCancelling(false);
        }
    }

    function toggleEdit() {
        if (isEditing) {
            setIsEditing(false);
            setSaveError(null);
            setDraft(toDraft(reservation));
            return;
        }

        setIsEditing(true);
        setSaveError(null);
        setIsCancelReasonOpen(false);
        setCancelReason('');
        setCancelError(null);
    }

    function toggleCancelReason() {
        setIsCancelReasonOpen((prev) => !prev);
        setCancelError(null);
    }

    return (
        <div className="fixed inset-0 bg-black/45 flex justify-end z-30" onClick={onClose}>
            <aside
                className="h-full w-full max-w-[560px] bg-white shadow-2xl overflow-hidden rounded-l-2xl flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
                    <h3 className="text-[30px] leading-none font-semibold text-slate-800">Reservation Details</h3>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={toggleEdit}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            {isEditing ? 'Cancel' : 'Edit'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
                            aria-label="Close"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto bg-slate-50/40">
                    {!isEditing && (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 border-b border-slate-200 bg-white">
                                <div className="px-6 py-5 border-b sm:border-b-0 sm:border-r border-slate-200">
                                    <p className="text-sm font-medium text-slate-500 mb-1">Date</p>
                                    <p className="text-[30px] leading-tight font-semibold text-slate-900">
                                        {details?.dateLabel ?? reservation.date}
                                    </p>
                                </div>
                                <div className="px-6 py-5">
                                    <p className="text-sm font-medium text-slate-500 mb-1">Time</p>
                                    <p className="text-[30px] leading-tight font-semibold text-slate-900">
                                        {details?.timeRangeLabel ?? reservation.time}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 border-b border-slate-200 bg-white">
                                <div className="px-6 py-5 border-b sm:border-b-0 sm:border-r border-slate-200">
                                    <p className="text-sm font-medium text-slate-500 mb-2">Contact</p>
                                    <p className="text-2xl leading-tight font-semibold text-slate-900">{reservation.name}</p>
                                    {reservation.phone && (
                                        <p className="mt-2 text-xl leading-tight text-slate-800">{reservation.phone}</p>
                                    )}
                                    {reservation.email && (
                                        <p className="mt-1 text-base text-slate-600 break-all">{reservation.email}</p>
                                    )}
                                </div>
                                <div className="px-6 py-5">
                                    <p className="text-sm font-medium text-slate-500 mb-2">Guests</p>
                                    <p className="text-2xl leading-tight font-semibold text-slate-900">
                                        {reservation.guests} guest{reservation.guests === '1' ? '' : 's'}
                                    </p>
                                </div>
                            </div>

                            <div className="px-6 py-5 border-b border-slate-200 bg-white">
                                <p className="text-sm font-medium text-slate-500 mb-2">Notes</p>
                                <p className="text-xl leading-snug text-slate-900">
                                    {reservation.notes?.trim() ? reservation.notes : 'No notes added.'}
                                </p>
                            </div>
                        </>
                    )}

                    {isEditing && (
                        <form id="reservation-edit-form" onSubmit={saveEdits} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                                    <input
                                        type="text"
                                        value={draft.name}
                                        onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
                                    <input
                                        type="date"
                                        value={draft.date}
                                        onChange={(e) => setDraft((prev) => ({ ...prev, date: e.target.value }))}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Time *</label>
                                    <select
                                        value={draft.time}
                                        onChange={(e) => setDraft((prev) => ({ ...prev, time: e.target.value }))}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2"
                                    >
                                        {SLOTS_30.map((slot) => (
                                            <option key={slot} value={slot}>
                                                {slot}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Guests</label>
                                    <input
                                        type="text"
                                        value={draft.guests}
                                        onChange={(e) => setDraft((prev) => ({ ...prev, guests: e.target.value }))}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        value={draft.phone}
                                        onChange={(e) => setDraft((prev) => ({ ...prev, phone: e.target.value }))}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={draft.email}
                                        onChange={(e) => setDraft((prev) => ({ ...prev, email: e.target.value }))}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                                    <textarea
                                        rows={3}
                                        value={draft.notes}
                                        onChange={(e) => setDraft((prev) => ({ ...prev, notes: e.target.value }))}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2"
                                    />
                                </div>
                            </div>
                            {saveError && (
                                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                                    {saveError}
                                </p>
                            )}
                        </form>
                    )}
                </div>

                {!isEditing && isCancelReasonOpen && (
                    <div className="px-6 py-4 border-t border-rose-200 bg-rose-50/80">
                        <label className="block text-sm font-medium text-rose-900 mb-1">Cancellation reason *</label>
                        <textarea
                            rows={3}
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="Tell us why this booking is being cancelled..."
                            className="w-full border border-rose-200 rounded-lg px-3 py-2 text-sm bg-white"
                        />
                        {cancelError && <p className="mt-2 text-sm text-rose-700">{cancelError}</p>}
                        <div className="mt-3 flex items-center justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsCancelReasonOpen(false);
                                    setCancelReason('');
                                    setCancelError(null);
                                }}
                                className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-white"
                                disabled={isCancelling}
                            >
                                Keep booking
                            </button>
                            <button
                                type="button"
                                onClick={cancelBooking}
                                disabled={isCancelling}
                                className="px-3 py-2 rounded-lg bg-rose-600 text-white text-sm font-medium hover:bg-rose-700 disabled:opacity-60"
                            >
                                {isCancelling ? 'Cancelling...' : 'Confirm cancellation'}
                            </button>
                        </div>
                    </div>
                )}

                <div className="px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-between">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-50"
                    >
                        Close
                    </button>
                    {isEditing ? (
                        <button
                            type="submit"
                            form="reservation-edit-form"
                            disabled={isSaving}
                            className="px-5 py-2.5 rounded-xl bg-violet-600 text-white font-medium hover:bg-violet-700 disabled:opacity-60"
                        >
                            {isSaving ? 'Saving...' : 'Save changes'}
                        </button>
                    ) : (
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={toggleCancelReason}
                                disabled={isCancelling}
                                className="px-4 py-2.5 rounded-xl border border-rose-300 text-rose-700 font-medium hover:bg-rose-50 disabled:opacity-60"
                            >
                                {isCancelReasonOpen ? 'Hide cancel' : 'Cancel booking'}
                            </button>
                            <span className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-medium">
                                Confirmed
                            </span>
                        </div>
                    )}
                </div>
            </aside>
        </div>
    );
}
