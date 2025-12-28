'use client'

import { useState } from 'react'

export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus('idle');

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setSubmitStatus('success');
                setFormData({ name: '', email: '', subject: '', message: '' });
            } else {
                setSubmitStatus('error');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative min-h-screen pt-32 pb-16 px-6 md:px-12">
            <div className="absolute inset-0 h-[32vh] bg-[url(/assets/hero-background.avif)] bg-cover bg-center rounded-lg" />
            <div className="absolute inset-0 h-[32vh] bg-black/30 backdrop-blur-sm rounded-lg" />

            <div className="relative max-w-2xl mx-auto z-10">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 text-center">
                    Contact Us
                </h1>
            </div>

            <form onSubmit={handleSubmit} aria-busy={isSubmitting} className="max-w-2xl mx-auto space-y-6 bg-white rounded-lg shadow-lg p-6 mt-35 lg:mt-40 md:p-8">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Name *
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        autoComplete="name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7a1f3f] focus:border-[#7a1f3f] outline-none"
                        placeholder="Your name"
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7a1f3f] focus:border-[#7a1f3f] outline-none"
                        placeholder="your.email@example.com"
                    />
                </div>

                <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                        Subject *
                    </label>
                    <input
                        type="text"
                        id="subject"
                        name="subject"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        autoComplete="off"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7a1f3f] focus:border-[#7a1f3f] outline-none"
                        placeholder="What is this regarding?"
                    />
                </div>

                <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                        Message *
                    </label>
                    <textarea
                        id="message"
                        name="message"
                        required
                        rows={6}
                        value={formData.message}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7a1f3f] focus:border-[#7a1f3f] outline-none resize-none"
                        placeholder="Your message..."
                    />
                </div>

                {submitStatus === 'success' && (
                    <div role="status" aria-live="polite" className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                        ✓ Message sent successfully! We&apos;ll get back to you soon.
                    </div>
                )}

                {submitStatus === 'error' && (
                    <div role="alert" aria-live="assertive" className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                        ✗ There was an error sending your message. Please try again or call us directly.
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#631732] hover:bg-[#4d1226] text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
            </form>

        </div>
    )
}
