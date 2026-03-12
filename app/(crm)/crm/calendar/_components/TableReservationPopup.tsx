type TableReservationPopupProps = {
    open: boolean;
    tableLabel: string;
    timeLabel: string;
    name: string;
    guests: string;
    notes?: string;
    phone?: string;
    email?: string;
    onClose: () => void;
};

export function TableReservationPopup({
    open,
    tableLabel,
    timeLabel,
    name,
    guests,
    notes,
    phone,
    email,
    onClose,
}: TableReservationPopupProps) {
    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 bg-black/35 flex items-center justify-center p-4"
            onClick={(e) => {
                e.stopPropagation();
                onClose();
            }}
        >
            <div
                className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white shadow-2xl p-5"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                        <h4 className="text-3xl font-semibold text-slate-900 leading-tight">Reservation Table</h4>
                        <p className="text-lg text-slate-600 mt-1">
                            Table: {tableLabel} <span className="mx-1">•</span> Time: {timeLabel}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-9 h-9 inline-flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
                        aria-label="Close table popup"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-3">
                    <div className="rounded-2xl bg-slate-100 px-4 py-3">
                        <p className="text-sm text-slate-500">Name</p>
                        <p className="text-4xl leading-tight font-semibold text-slate-900">{name || '—'}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-100 px-4 py-3">
                        <p className="text-sm text-slate-500">Guest</p>
                        <p className="text-4xl leading-tight font-semibold text-slate-900">{guests || '—'}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-100 px-4 py-3">
                        <p className="text-sm text-slate-500">Notes</p>
                        <p className="text-3xl leading-tight font-medium text-slate-900">
                            {notes?.trim() || 'No notes'}
                        </p>
                    </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                    <a
                        href={email ? `mailto:${email}` : '#'}
                        className={`px-4 py-2 rounded-2xl text-white text-sm font-semibold ${
                            email ? 'bg-slate-900 hover:bg-black' : 'bg-slate-400 pointer-events-none'
                        }`}
                    >
                        Send message
                    </a>
                    <a
                        href={phone ? `tel:${phone}` : '#'}
                        className={`px-4 py-2 rounded-2xl text-sm font-semibold border ${
                            phone
                                ? 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
                                : 'border-slate-200 bg-slate-100 text-slate-400 pointer-events-none'
                        }`}
                    >
                        Call
                    </a>
                </div>
            </div>
        </div>
    );
}
