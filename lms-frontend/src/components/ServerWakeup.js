import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const baseURL = process.env.REACT_APP_API_URL;

function ServerWakeup() {
    const [isWaking, setIsWaking] = useState(false);
    const [dots, setDots] = useState('');

    // Animated dots effect
    useEffect(() => {
        if (!isWaking) return;
        const interval = setInterval(() => {
            setDots(d => d.length >= 3 ? '' : d + '.');
        }, 500);
        return () => clearInterval(interval);
    }, [isWaking]);

    useEffect(() => {
        let isMounted = true;

        const timeout = setTimeout(() => {
            if (isMounted) setIsWaking(true);
        }, 1500);

        const pingServer = async () => {
            try {
                await axios.get(`${baseURL}/api/health/`, { timeout: 30000 });
            } catch (err) {
                // Any response means server is up
            } finally {
                clearTimeout(timeout);
                if (isMounted) setIsWaking(false);
            }
        };

        pingServer();
        return () => { isMounted = false; clearTimeout(timeout); };
    }, []);

    return (
        <AnimatePresence>
            {isWaking && (
                <motion.div
                    style={styles.overlay}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <motion.div
                        style={styles.card}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                    >
                        <style>{`
                            @keyframes spin { to { transform: rotate(360deg); } }
                            @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
                            @keyframes float {
                                0%, 100% { transform: translateY(0px); }
                                50% { transform: translateY(-6px); }
                            }
                        `}</style>

                        {/* Icon */}
                        <div style={styles.iconWrap}>
                            <div style={styles.iconBg}>
                                <span style={styles.icon}>☕</span>
                            </div>
                            {/* Orbiting spinner ring */}
                            <div style={styles.spinnerRing}></div>
                        </div>

                        {/* Text */}
                        <h2 style={styles.title}>
                            Just a moment{dots}
                        </h2>
                        <p style={styles.subtitle}>
                            Our server is waking up
                        </p>
                        <p style={styles.body}>
                            We use free-tier hosting that sleeps after inactivity.
                            First load may take <strong style={{ color: '#06b6d4' }}>10–30 seconds</strong>.
                            Grab a coffee while you wait! ☕
                        </p>

                        {/* Progress bar */}
                        <div style={styles.progressTrack}>
                            <motion.div
                                style={styles.progressFill}
                                initial={{ width: '0%' }}
                                animate={{ width: '90%' }}
                                transition={{ duration: 25, ease: 'easeInOut' }}
                            />
                        </div>

                        {/* Status pills */}
                        <div style={styles.pillsRow}>
                            {['Connecting', 'Loading DB', 'Starting up'].map((label, i) => (
                                <motion.div
                                    key={label}
                                    style={styles.pill}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 3, duration: 0.5 }}
                                >
                                    <span style={styles.pillDot}></span>
                                    {label}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

const styles = {
    overlay: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(2, 6, 23, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999,
    },
    card: {
        background: 'white',
        borderRadius: '24px',
        padding: '2.5rem 2rem',
        textAlign: 'center',
        maxWidth: '420px',
        width: '90%',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        boxShadow: '0 25px 50px rgba(0,0,0,0.35)',
        border: '1px solid rgba(255,255,255,0.1)',
    },
    iconWrap: {
        position: 'relative',
        width: '80px', height: '80px',
        margin: '0 auto 1.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    iconBg: {
        width: '70px', height: '70px',
        background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
        borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'float 2.5s ease-in-out infinite',
    },
    icon: { fontSize: '2rem' },
    spinnerRing: {
        position: 'absolute', top: 0, left: 0,
        width: '80px', height: '80px',
        border: '3px solid transparent',
        borderTopColor: '#06b6d4',
        borderRightColor: '#3b82f6',
        borderRadius: '50%',
        animation: 'spin 1.2s linear infinite',
    },
    title: {
        fontSize: '1.5rem', fontWeight: '800',
        color: '#0f172a', margin: '0 0 0.25rem',
        minHeight: '2rem', // prevents layout shift from dots
    },
    subtitle: {
        fontSize: '0.9rem', color: '#06b6d4',
        fontWeight: '700', textTransform: 'uppercase',
        letterSpacing: '0.08em', margin: '0 0 1rem',
    },
    body: {
        fontSize: '0.9rem', color: '#64748b',
        lineHeight: 1.6, margin: '0 0 1.5rem',
    },
    progressTrack: {
        height: '6px', backgroundColor: '#f1f5f9',
        borderRadius: '3px', overflow: 'hidden',
        marginBottom: '1.25rem',
    },
    progressFill: {
        height: '100%', borderRadius: '3px',
        background: 'linear-gradient(90deg, #06b6d4, #3b82f6)',
    },
    pillsRow: {
        display: 'flex', gap: '0.5rem',
        justifyContent: 'center', flexWrap: 'wrap',
    },
    pill: {
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        backgroundColor: '#f8fafc', border: '1px solid #e2e8f0',
        borderRadius: '20px', padding: '0.3rem 0.75rem',
        fontSize: '0.78rem', color: '#475569', fontWeight: '600',
    },
    pillDot: {
        width: '6px', height: '6px', borderRadius: '50%',
        backgroundColor: '#06b6d4',
        display: 'inline-block',
        animation: 'pulse 1.5s ease-in-out infinite',
    },
};

export default ServerWakeup;