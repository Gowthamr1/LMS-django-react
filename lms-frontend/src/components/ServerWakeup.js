import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const baseURL = process.env.REACT_APP_API_URL;

// Use plain axios here on purpose, NOT axiosInstance. axiosInstance's 401
// interceptor treats any 401 as an expired session and redirects to /login —
// that would misfire for anonymous visitors on public pages. This ping just
// needs to know "did the server respond at all", auth status doesn't matter.
function ServerWakeup() {
    const [isWaking, setIsWaking] = useState(false);

    useEffect(() => {
    let isMounted = true;

    // Only show the overlay if the server hasn't responded within 1.5s —
    // fast responses (server already awake) never show anything.
    const timeout = setTimeout(() => {
        if (isMounted) setIsWaking(true);
    }, 1500);

    const pingServer = async () => {
        try {
        await axios.get(`${baseURL}/api/health/`, { timeout: 30000 });
    } catch (err) {
        // Any response (even an error status) or timeout just means we're done waiting.
    } finally {
        clearTimeout(timeout);
        if (isMounted) setIsWaking(false);
    }
    };

    pingServer();

    return () => {
        isMounted = false;
        clearTimeout(timeout);
    };
    }, []);

    return (
    <AnimatePresence>
        {isWaking && (
        <motion.div
            style={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div style={styles.modalBox} initial={{ y: 20 }} animate={{ y: 0 }}>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <div style={styles.spinner}></div>
            <h3 style={styles.title}>Waking up the server...</h3>
            <p style={styles.text}>
                Please wait a few seconds. Our free-tier hosting goes to sleep when inactive to save resources! ☕
            </p>
            </motion.div>
        </motion.div>
        )}
    </AnimatePresence>
    );
}

const styles = {
    overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(5px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
    },
    modalBox: {
    background: 'white', padding: '2rem', borderRadius: '16px',
    textAlign: 'center', maxWidth: '400px', width: '90%',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    spinner: {
    width: '50px', height: '50px', border: '5px solid #e0f2fe',
    borderTopColor: '#06b6d4', borderRadius: '50%', margin: '0 auto',
    animation: 'spin 1s linear infinite',
    },
    title: { color: '#1e293b', marginTop: '1rem', fontSize: '1.15rem', fontWeight: '700' },
    text: { color: '#64748b', fontSize: '0.95rem', lineHeight: 1.5, marginTop: '0.5rem' },
};

export default ServerWakeup;