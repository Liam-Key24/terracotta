import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { TableReservationPopup } from './TableReservationPopup';
import { SLOTS_30 } from '../constants';
import type { ReservationCreateInput, Table } from '../types';
import { formatTimeRangeLabel, getDurationMinutes, parseTimeToMinutes } from '../utils';
import {
    CalendarBlankIcon,
    ClockIcon,
    EnvelopeSimpleIcon,
    EyeIcon,
    NotePencilIcon,
    PhoneIcon,
    PlusIcon,
    TableIcon,
    UserCircleIcon,
    UsersIcon,
    XIcon,
} from '@phosphor-icons/react';

type AddBookingModalProps = {
    date: string;
    tables: Table[];
    onClose: () => void;
    onAdd: (data: ReservationCreateInput) => void;
};

export function AddBookingModal({ date, tables, onClose, onAdd }: AddBookingModalProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [time, setTime] = useState('18:00');
    const [guests, setGuests] = useState('2');
    const [notes, setNotes] = useState('');
    const [tableIds, setTableIds] = useState<string[]>([]);
    const [previewTableId, setPreviewTableId] = useState<string | null>(null);

    const previewTable = useMemo(
        () => (previewTableId ? tables.find((table) => table.id === previewTableId) ?? null : null),
        [tables, previewTableId]
    );
    const timeLabel = useMemo(() => {
        const start = parseTimeToMinutes(time);
        const end = start + getDurationMinutes(guests);
        return formatTimeRangeLabel(start, end);
    }, [time, guests]);

    function toggleTable(id: string) {
        const isAlreadySelected = tableIds.includes(id);
        setTableIds((prev) => (isAlreadySelected ? prev.filter((x) => x !== id) : [...prev, id]));
        if (isAlreadySelected) {
            setPreviewTableId((prev) => (prev === id ? null : prev));
            return;
        }
        setPreviewTableId(id);
    }

    function submit(e: FormEvent) {
        e.preventDefault();
        onAdd({
            name,
            email,
            phone,
            date,
            time,
            guests,
            notes: notes.trim() || undefined,
            tableIds: tableIds.length ? tableIds : undefined,
        });
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[120] p-4" onClick={onClose}>
            <div
                className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden border border-slate-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-6 py-5 border-b border-slate-200 flex items-start justify-between gap-3">
                    <div>
                        <h3 className="text-2xl font-semibold text-slate-900 inline-flex items-center gap-2">
                            <PlusIcon size={18} weight="bold" className="text-[#631732]" />
                            Add booking
                        </h3>
                        <p className="mt-1 text-sm text-slate-500 inline-flex items-center gap-2 flex-wrap">
                            <CalendarBlankIcon size={14} />
                            {date}
                            <span className="text-slate-300">•</span>
                            <ClockIcon size={14} />
                            {timeLabel}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-9 w-9 rounded-xl text-slate-500 hover:bg-slate-100 inline-flex items-center justify-center"
                        aria-label="Close add booking modal"
                    >
                        <XIcon size={16} />
                    </button>
                </div>

                <form onSubmit={submit} className="p-6 space-y-4 overflow-y-auto max-h-[calc(92vh-104px)]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="md:col-span-2 rounded-2xl bg-slate-100 px-4 py-3">
                            <label className="text-sm font-medium text-slate-600 inline-flex items-center gap-1.5">
                                <UserCircleIcon size={14} />
                                Name *
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="mt-1.5 w-full bg-transparent text-slate-900 placeholder-slate-400 outline-none"
                                placeholder="Guest full name"
                                required
                            />
                        </div>

                        <div className="rounded-2xl bg-slate-100 px-4 py-3">
                            <label className="text-sm font-medium text-slate-600 inline-flex items-center gap-1.5">
                                <EnvelopeSimpleIcon size={14} />
                                Email *
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1.5 w-full bg-transparent text-slate-900 placeholder-slate-400 outline-none"
                                placeholder="guest@email.com"
                                required
                            />
                        </div>

                        <div className="rounded-2xl bg-slate-100 px-4 py-3">
                            <label className="text-sm font-medium text-slate-600 inline-flex items-center gap-1.5">
                                <PhoneIcon size={14} />
                                Phone
                            </label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="mt-1.5 w-full bg-transparent text-slate-900 placeholder-slate-400 outline-none"
                                placeholder="+44 ..."
                            />
                        </div>

                        <div className="rounded-2xl bg-slate-100 px-4 py-3">
                            <label className="text-sm font-medium text-slate-600 inline-flex items-center gap-1.5">
                                <CalendarBlankIcon size={14} />
                                Date
                            </label>
                            <input
                                type="date"
                                value={date}
                                readOnly
                                className="mt-1.5 w-full bg-transparent text-slate-900 outline-none cursor-default"
                            />
                        </div>

                        <div className="rounded-2xl bg-slate-100 px-4 py-3">
                            <label className="text-sm font-medium text-slate-600 inline-flex items-center gap-1.5">
                                <ClockIcon size={14} />
                                Time *
                            </label>
                            <select
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="mt-1.5 w-full bg-transparent text-slate-900 outline-none"
                            >
                                {SLOTS_30.map((slot) => (
                                    <option key={slot} value={slot}>
                                        {slot}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="rounded-2xl bg-slate-100 px-4 py-3">
                            <label className="text-sm font-medium text-slate-600 inline-flex items-center gap-1.5">
                                <UsersIcon size={14} />
                                Guests *
                            </label>
                            <select
                                value={guests}
                                onChange={(e) => setGuests(e.target.value)}
                                className="mt-1.5 w-full bg-transparent text-slate-900 outline-none"
                            >
                                <option value="2">2</option>
                                <option value="4">4</option>
                                <option value="5">5+</option>
                            </select>
                        </div>

                        <div className="md:col-span-2 rounded-2xl bg-slate-100 px-4 py-3">
                            <label className="text-sm font-medium text-slate-600 inline-flex items-center gap-1.5">
                                <TableIcon size={14} />
                                Table(s)
                            </label>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {tables.map((table) => (
                                    <button
                                        key={table.id}
                                        type="button"
                                        onClick={() => toggleTable(table.id)}
                                        className={`px-3 py-1.5 rounded-xl border text-sm font-medium ${
                                            tableIds.includes(table.id)
                                                ? 'bg-[#631732] text-white border-[#631732]'
                                                : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                                        }`}
                                    >
                                        {table.label}
                                    </button>
                                ))}
                            </div>
                            {tableIds.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {tableIds.map((tableId) => (
                                        <button
                                            key={tableId}
                                            type="button"
                                            onClick={() => setPreviewTableId(tableId)}
                                            className="px-2.5 py-1.5 rounded-lg bg-[#631732]/10 text-[#631732] border border-[#631732]/25 text-xs font-medium hover:bg-[#631732]/15 inline-flex items-center gap-1"
                                        >
                                            <EyeIcon size={11} />
                                            View {tables.find((table) => table.id === tableId)?.label ?? `Table ${tableId}`}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="md:col-span-2 rounded-2xl bg-slate-100 px-4 py-3">
                            <label className="text-sm font-medium text-slate-600 inline-flex items-center gap-1.5">
                                <NotePencilIcon size={14} />
                                Notes
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="mt-1.5 w-full bg-transparent text-slate-900 placeholder-slate-400 outline-none resize-y"
                                rows={3}
                                placeholder="Any preference or special request..."
                            />
                        </div>
                    </div>

                    <div className="pt-1 flex items-center justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="h-11 px-4 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="h-11 px-5 bg-[#631732] text-white rounded-xl font-medium inline-flex items-center justify-center gap-1.5 hover:bg-[#55122b]"
                        >
                            <PlusIcon size={14} weight="bold" />
                            Add booking
                        </button>
                    </div>
                </form>
            </div>
            <TableReservationPopup
                open={Boolean(previewTableId)}
                tableLabel={previewTable?.label ?? (previewTableId ? `Table ${previewTableId}` : 'Unknown table')}
                timeLabel={timeLabel}
                name={name}
                guests={guests}
                notes={notes}
                phone={phone}
                email={email}
                onClose={() => setPreviewTableId(null)}
            />
        </div>
    );
}
