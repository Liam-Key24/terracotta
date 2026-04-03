'use client'

import { useState } from 'react'

// 6pm–9pm in 30 min intervals (value: 24h, label: 12h am/pm)
const FORM_TIME_OPTIONS = [
    { value: '10:00', label: '10:00 am' },
    { value: '10:30', label: '10:30 am' },
    { value: '11:00', label: '11:00 am' },
    { value: '11:30', label: '11:30 am' },
    { value: '12:00', label: '12:00 pm' },
    { value: '12:30', label: '12:30 pm' },
    { value: '13:00', label: '1:00 pm' },
    { value: '13:30', label: '1:30 pm' },
    { value: '14:00', label: '2:00 pm' },
    { value: '14:30', label: '2:30 pm' },
    { value: '15:00', label: '3:00 pm' },
    { value: '15:30', label: '3:30 pm' },
    { value: '16:00', label: '4:00 pm' },
    { value: '16:30', label: '4:30 pm' },
    { value: '17:00', label: '5:00 pm' },
    { value: '17:30', label: '5:30 pm' },
    { value: '18:00', label: '6:00 pm' },
    { value: '18:30', label: '6:30 pm' },
    { value: '19:00', label: '7:00 pm' },
    { value: '19:30', label: '7:30 pm' },
    { value: '20:00', label: '8:00 pm' },
    { value: '20:30', label: '8:30 pm' },
    { value: '21:00', label: '9:00 pm' },
]

export default function Form(){
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        date: '',
        insideTime: '',
        outsideTime: '',
        guests: '2',
        specialRequests: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [submitError, setSubmitError] = useState('');

    const time = formData.insideTime || formData.outsideTime;
    const location = formData.insideTime ? 'inside' : formData.outsideTime ? 'outside' : '';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setSubmitError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError('');
        if (!time || !location) {
            setSubmitStatus('error');
            setSubmitError('Please select a time slot (Inside or Outside).');
            return;
        }
        setIsSubmitting(true);
        setSubmitStatus('idle');

        const payload = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            date: formData.date,
            time,
            location,
            guests: formData.guests,
            specialRequests: formData.specialRequests
        };

        try {
            const response = await fetch('/api/reservation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
                cache: 'no-store',
            });

            const errBody = await response.json().catch(() => ({}));

            if (response.ok) {
                setSubmitStatus('success');
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    date: '',
                    insideTime: '',
                    outsideTime: '',
                    guests: '2',
                    specialRequests: ''
                });
            } else {
                setSubmitStatus('error');
                setSubmitError(typeof errBody?.error === 'string' ? errBody.error : 'There was an error submitting your reservation. Please try again or call us directly.');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            setSubmitStatus('error');
            setSubmitError('There was an error submitting your reservation. Please try again or call us directly.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-6 md:p-8" id='form'>
            <h2 className="text-3xl font-light text-center mb-8 text-[#631732]/70">Make a Reservation</h2>
            
            <form method="post" action="#" onSubmit={handleSubmit} aria-busy={isSubmitting} className="space-y-6 bg-white rounded-lg shadow-lg p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name *
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            autoComplete="name"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9d2b52] focus:border-[#9d2b52] outline-none"
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            Email *
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            autoComplete="email"
                            inputMode="email"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9d2b52] focus:border-[#9d2b52] outline-none"
                            placeholder="john@example.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number *
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            required
                            value={formData.phone}
                            onChange={handleChange}
                            autoComplete="tel"
                            inputMode="tel"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9d2b52] focus:border-[#9d2b52] outline-none"
                            placeholder="(555) 123-4567"
                        />
                    </div>

                    <div>
                        <label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-2">
                            Number of Guests *
                        </label>
                        <select
                            id="guests"
                            name="guests"
                            required
                            value={formData.guests}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9d2b52] focus:border-[#9d2b52] outline-none"
                        >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2 w-full">
                            Date *
                        </label>
                        <input
                            type="date"
                            id="date"
                            name="date"
                            required
                            value={formData.date}
                            onChange={handleChange}
                            min={new Date().toISOString().split('T')[0]}
                            autoComplete="off"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9d2b52] focus:border-[#9d2b52] outline-none"
                        />
                    </div>

                    <div>
                    
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="insideTime" className="block text-sm font-medium text-gray-700 mb-2">
                                    Inside
                                </label>
                                <select
                                    id="insideTime"
                                    name="insideTime"
                                    value={formData.insideTime}
                                    onChange={handleChange}
                                    className="w-full px-1 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9d2b52] focus:border-[#9d2b52] outline-none"
                                >
                                    <option value="">Select time</option>
                                    {FORM_TIME_OPTIONS.map(({ value, label }) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="outsideTime" className="block text-sm font-medium text-gray-700 mb-2">
                                    Outside
                                </label>
                                <select
                                    id="outsideTime"
                                    name="outsideTime"
                                    value={formData.outsideTime}
                                    onChange={handleChange}
                                    className="w-full px-1 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9d2b52] focus:border-[#9d2b52] outline-none"
                                >
                                    <option value="">Select time</option>
                                    {FORM_TIME_OPTIONS.map(({ value, label }) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700 mb-2">
                        Special Requests
                    </label>
                    <textarea
                        id="specialRequests"
                        name="specialRequests"
                        rows={4}
                        value={formData.specialRequests}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9d2b52] focus:border-[#9d2b52] outline-none resize-none"
                        placeholder="Any dietary restrictions, special occasions, or requests..."
                    />
                    <div className="mt-3 px-4 py-3.5 rounded-xl bg-[#631732]/5 border border-[#631732]/15">
                        <p className="text-sm text-gray-600 leading-relaxed italic">
                            As we&apos;re a small restaurant with limited seating, we work to the following sitting times: Tables of 2 have a 1 hr 30 min turnover, Groups of 4+ have a 2 hr turnover, thank you for your understanding.
                        </p>
                    </div>
                </div>

                {submitStatus === 'success' && (
                    <div role="status" aria-live="polite" className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                        ✓ Reservation submitted successfully! We&apos;ll contact you soon to confirm.
                    </div>
                )}

                {submitStatus === 'error' && submitError && (
                    <div role="alert" aria-live="assertive" className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                        ✗ {submitError}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#631732]/80 hover:bg-[#4d1226] text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Submitting...' : 'Book Table'}
                </button>
        </form>
        </div>
    )
}   