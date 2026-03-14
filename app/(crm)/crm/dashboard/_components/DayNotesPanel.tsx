import { NotePencilIcon, UsersIcon } from '@phosphor-icons/react/dist/ssr';

import type { DayNote } from '../types';

type DayNotesPanelProps = {
    dayNotes: DayNote[];
};

export function DayNotesPanel({ dayNotes }: DayNotesPanelProps) {
    return (
        <section className="bg-white rounded-2xl border border-[#631732]/20 shadow-sm p-5">
            <div className="flex items-center justify-between gap-2 mb-4">
                <h3 className="text-lg font-semibold text-slate-800 inline-flex items-center gap-2">
                    <NotePencilIcon size={18} className="text-[#631732]" />
                    Notes
                </h3>
            </div>

            {dayNotes.length === 0 ? (
                <p className="text-slate-500">No notes for this date.</p>
            ) : (
                <ul className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
                    {dayNotes.map((note) => (
                        <li key={note.id} className="rounded-xl border p-3 border-[#631732]/20 bg-[#631732]/[0.03]">
                            <div className="flex items-center justify-between gap-2">
                                <div className="inline-flex items-center gap-3 min-w-0">
                                    <p className="font-semibold text-slate-800 truncate">{note.name}</p>
                                    <p className="text-sm text-slate-500 inline-flex items-center gap-1 shrink-0">
                                        <UsersIcon size={13} />
                                        {note.guests}
                                    </p>
                                </div>
                                <span className="text-xs text-slate-500">{note.time}</span>
                            </div>
                            <p className="mt-2 text-sm text-slate-700">{note.notes}</p>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
