import { useState } from 'react';
import type { FormEvent } from 'react';
import { SLOTS_30 } from '../constants';
import type { ReservationCreateInput, Table } from '../types';

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

    function toggleTable(id: string) {
        setTableIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-20 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="font-semibold text-slate-800">Add booking</h3>
                    <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-700">
                        Close
                    </button>
                </div>
                <form onSubmit={submit} className="p-4 space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border rounded px-2 py-1.5"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border rounded px-2 py-1.5"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full border rounded px-2 py-1.5"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                        <input type="date" value={date} readOnly className="w-full border rounded px-2 py-1.5 bg-slate-50" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Time *</label>
                        <select value={time} onChange={(e) => setTime(e.target.value)} className="w-full border rounded px-2 py-1.5">
                            {SLOTS_30.map((slot) => (
                                <option key={slot} value={slot}>
                                    {slot}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Guests *</label>
                        <select value={guests} onChange={(e) => setGuests(e.target.value)} className="w-full border rounded px-2 py-1.5">
                            <option value="2">2</option>
                            <option value="4">4</option>
                            <option value="5">5+</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Table(s)</label>
                        <div className="flex flex-wrap gap-2">
                            {tables.map((table) => (
                                <button
                                    key={table.id}
                                    type="button"
                                    onClick={() => toggleTable(table.id)}
                                    className={`px-2 py-1 rounded border text-sm ${
                                        tableIds.includes(table.id) ? 'bg-[#631732] text-white' : 'border-slate-300'
                                    }`}
                                >
                                    {table.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full border rounded px-2 py-1.5"
                            rows={2}
                        />
                    </div>
                    <button type="submit" className="w-full py-2 bg-[#631732] text-white rounded-lg font-medium">
                        Add booking
                    </button>
                </form>
            </div>
        </div>
    );
}
