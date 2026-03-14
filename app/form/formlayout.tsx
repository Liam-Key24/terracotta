'use client'

import { useState } from 'react'

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
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/1fcc1fa4-567e-4c98-a901-f11466da8e45',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'formlayout.tsx:client-pre-fetch',message:'payload before POST',data:{time:payload.time,location:payload.location,date:payload.date,hasTime:!!payload.time,hasLocation:!!payload.location},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
        // #endregion

        try {
            const response = await fetch('/api/reservation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            // #region agent log
            const errBody = await response.json().catch(() => ({}));
            fetch('http://127.0.0.1:7243/ingest/1fcc1fa4-567e-4c98-a901-f11466da8e45',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'formlayout.tsx:client-after-response',message:'response received',data:{ok:response.ok,status:response.status,errorFromBody:errBody?.error},timestamp:Date.now(),hypothesisId:'H3'})}).catch(()=>{});
            // #endregion

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
            
            <form onSubmit={handleSubmit} aria-busy={isSubmitting} className="space-y-6 bg-white rounded-lg shadow-lg p-6 md:p-8">
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
                                    <option value="6pm-7:30pm">6pm-7:30pm</option>
                                    <option value="7:30pm-9pm">7:30pm-9pm</option>
                                    <option value="9pm">9pm</option>
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
                                    <option value="6-7:30pm">6-7:30pm</option>
                                    <option value="7:30-9pm">7:30-9pm</option>
                                    <option value="9pm">9pm</option>
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