/**
 * @file LoadingDots.tsx
 * @description Animated loading indicator component with bouncing dots
 */

import React from 'react';

/**
 * LoadingDots Component
 *
 * @component
 * @description Displays an animated loading indicator with three bouncing dots
 * @returns {React.ReactElement} Rendered loading dots animation
 *
 * @example
 * ```tsx
 * <LoadingDots />
 * ```
 */
const LoadingDots: React.FC = () => {
    return (
        <div className="flex space-x-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-[bounce_0.5s_ease-in-out_infinite]" />
            <div className="w-2 h-2 bg-primary rounded-full animate-[bounce_0.5s_ease-in-out_infinite] [animation-delay:0.1s]" />
            <div className="w-2 h-2 bg-primary rounded-full animate-[bounce_0.5s_ease-in-out_infinite] [animation-delay:0.2s]" />
        </div>
    );
};

export default LoadingDots;