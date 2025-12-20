import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import Toast from '../components/Toast';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const timeoutRefs = useRef({});

    const addToast = useCallback((message, type = 'info', duration = 3000, undoCallback = null) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type, undoCallback }]);

        timeoutRefs.current[id] = setTimeout(() => {
            removeToast(id);
        }, duration);

        return id;
    }, []);

    const removeToast = useCallback((id) => {
        if (timeoutRefs.current[id]) {
            clearTimeout(timeoutRefs.current[id]);
            delete timeoutRefs.current[id];
        }
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const handleUndo = useCallback((id, callback) => {
        if (callback) {
            callback();
        }
        removeToast(id);
    }, [removeToast]);

    const showSuccess = useCallback((message, undoCallback = null) =>
        addToast(message, 'success', undoCallback ? 5000 : 3000, undoCallback), [addToast]);
    const showError = useCallback((message) => addToast(message, 'error'), [addToast]);
    const showInfo = useCallback((message) => addToast(message, 'info'), [addToast]);

    // New: Show toast with undo action - longer duration for undo toasts
    const showWithUndo = useCallback((message, undoCallback, type = 'success') =>
        addToast(message, type, 5000, undoCallback), [addToast]);

    return (
        <ToastContext.Provider value={{ showSuccess, showError, showInfo, showWithUndo }}>
            {children}
            <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none">
                {toasts.map(toast => (
                    <Toast
                        key={toast.id}
                        message={toast.message}
                        type={toast.type}
                        onClose={() => removeToast(toast.id)}
                        undoCallback={toast.undoCallback}
                        onUndo={() => handleUndo(toast.id, toast.undoCallback)}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
};
