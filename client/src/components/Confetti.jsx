import React, { useEffect, useState } from 'react';

const Confetti = ({ trigger, duration = 3000 }) => {
    const [particles, setParticles] = useState([]);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        if (trigger) {
            // Generate confetti particles
            const newParticles = Array.from({ length: 50 }, (_, i) => ({
                id: i,
                x: Math.random() * 100,
                delay: Math.random() * 0.5,
                color: ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'][Math.floor(Math.random() * 6)],
                size: Math.random() * 8 + 4,
                rotation: Math.random() * 360
            }));

            setParticles(newParticles);
            setIsActive(true);

            const timer = setTimeout(() => {
                setIsActive(false);
                setParticles([]);
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [trigger, duration]);

    if (!isActive) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {particles.map(particle => (
                <div
                    key={particle.id}
                    className="absolute animate-confetti"
                    style={{
                        left: `${particle.x}%`,
                        top: '-20px',
                        width: particle.size,
                        height: particle.size,
                        backgroundColor: particle.color,
                        transform: `rotate(${particle.rotation}deg)`,
                        animationDelay: `${particle.delay}s`,
                        borderRadius: Math.random() > 0.5 ? '50%' : '0'
                    }}
                />
            ))}
        </div>
    );
};

export default Confetti;
