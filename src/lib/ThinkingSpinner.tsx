import Lottie from 'lottie-react';
import thinkingAnimation from './thinking-spinner.json';

interface ThinkingSpinnerProps {
    size?: number;
}

export function ThinkingSpinner({ size = 100 }: ThinkingSpinnerProps) {
    return (
        <Lottie
            animationData={thinkingAnimation}
            loop
            style={{ width: size, height: size }}
        />
    );
}