export default function MaintenancePage() {
    return (
        <main
            style={{
                minHeight: '100vh',
                margin: '-0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                background: '#1a0f12',
                color: '#f5f0eb',
                fontFamily: 'var(--font-oranienbaum), Georgia, serif',
                textAlign: 'center',
            }}
        >
            <div style={{ maxWidth: '28rem' }}>
                <p
                    style={{
                        margin: 0,
                        fontSize: 'clamp(2.5rem, 8vw, 4rem)',
                        letterSpacing: '0.02em',
                    }}
                >
                    Terracotta
                </p>
                <p
                    style={{
                        margin: '1.25rem 0 0',
                        fontFamily: 'var(--font-roboto-condensed), system-ui, sans-serif',
                        fontSize: '1.125rem',
                        lineHeight: 1.5,
                        color: 'rgba(245, 240, 235, 0.85)',
                    }}
                >
                    Sorry — online booking is temporarily unavailable.
                    Please call us to reserve a table.
                </p>
                <a
                    href="tel:02046298759"
                    style={{
                        display: 'inline-block',
                        marginTop: '1.75rem',
                        fontFamily: 'var(--font-roboto-condensed), system-ui, sans-serif',
                        fontSize: '1.5rem',
                        color: '#f5f0eb',
                        textDecoration: 'underline',
                        textUnderlineOffset: '0.2em',
                    }}
                >
                    020 4629 8759
                </a>
            </div>
        </main>
    );
}
