import React, { useState, useRef } from 'react';
import { Check, Trash2 } from 'lucide-react';

const SwipeableItem = ({
    children,
    onSwipeLeft,
    onSwipeRight,
    leftLabel = 'Delete',
    rightLabel = 'Done',
    leftColor = 'bg-red-500',
    rightColor = 'bg-green-500',
    disabled = false
}) => {
    const [translateX, setTranslateX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const startX = useRef(0);
    const threshold = 80;

    const handleTouchStart = (e) => {
        if (disabled) return;
        startX.current = e.touches[0].clientX;
        setIsDragging(true);
    };

    const handleTouchMove = (e) => {
        if (!isDragging || disabled) return;
        const currentX = e.touches[0].clientX;
        const diff = currentX - startX.current;
        // Limit the swipe distance
        const limitedDiff = Math.max(-120, Math.min(120, diff));
        setTranslateX(limitedDiff);
    };

    const handleTouchEnd = () => {
        if (!isDragging || disabled) return;
        setIsDragging(false);

        if (translateX > threshold && onSwipeRight) {
            onSwipeRight();
        } else if (translateX < -threshold && onSwipeLeft) {
            onSwipeLeft();
        }

        setTranslateX(0);
    };

    return (
        <div className="relative overflow-hidden rounded-xl">
            {/* Background actions */}
            <div className="absolute inset-0 flex">
                <div className={`flex-1 ${rightColor} flex items-center justify-start pl-4`}>
                    <div className="flex items-center gap-2 text-white font-medium">
                        <Check size={20} />
                        <span className="text-sm">{rightLabel}</span>
                    </div>
                </div>
                <div className={`flex-1 ${leftColor} flex items-center justify-end pr-4`}>
                    <div className="flex items-center gap-2 text-white font-medium">
                        <span className="text-sm">{leftLabel}</span>
                        <Trash2 size={20} />
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div
                className="relative bg-white dark:bg-gray-800 transition-transform"
                style={{
                    transform: `translateX(${translateX}px)`,
                    transition: isDragging ? 'none' : 'transform 0.3s ease-out'
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {children}
            </div>
        </div>
    );
};

export default SwipeableItem;
