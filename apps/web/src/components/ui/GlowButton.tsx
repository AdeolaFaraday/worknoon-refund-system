'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface GlowButtonProps {
    /** Renders as a Next.js Link when provided, otherwise a <button> */
    href?: string;
    onClick?: () => void;
    children: ReactNode;
    className?: string;
    /**
     * Hex/rgb/hsl color stops for the rotating conic gradient.
     * First and last stop should match for a seamless loop.
     */
    colors?: string[];
    /** Full rotation duration in seconds. Default 3. */
    spinDuration?: number;
    /** Extra Tailwind classes for the inner content pill */
    innerClassName?: string;
}

/**
 * GlowButton
 * A premium button with a continuously rotating conic-gradient border ring,
 * a glow shadow on hover, and spring-based press feedback.
 *
 * Usage:
 *   <GlowButton href="/events/create"><Plus size={16} /> Create</GlowButton>
 *   <GlowButton onClick={doSomething}>Submit</GlowButton>
 */
export function GlowButton({
    href,
    onClick,
    children,
    className = '',
    colors = ['#f97316', '#fb923c', '#ec4899', '#a855f7', '#6366f1', '#f97316'],
    spinDuration = 3,
    innerClassName = '',
}: GlowButtonProps) {
    // Create a sweeping radar-like gradient with a transparent tail so rotation is obvious
    const gradient = `conic-gradient(from 0deg, transparent 0%, transparent 30%, ${colors[0]} 60%, ${colors[2]} 90%, ${colors[4]} 100%)`;

    const content = (
        <motion.span
            className={`relative inline-flex items-center justify-center rounded-full ${className}`}
            whileHover="hover"
            whileTap="tap"
            initial="idle"
            variants={{
                idle: { scale: 1 },
                hover: { scale: 1.05 },
                tap: { scale: 0.95 },
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
            {/* 1. Glow shadow ring on hover (placed behind everything, no overflow-hidden) */}
            <motion.span
                aria-hidden
                className="absolute inset-0 rounded-full blur-xl pointer-events-none"
                style={{ background: gradient }}
                variants={{
                    idle: { opacity: 0 },
                    hover: { opacity: 0.7 },
                    tap: { opacity: 0.5 },
                }}
                transition={{ duration: 0.2 }}
            />

            {/* 2. Container for the rotating border (clips the spinning square to a pill shape) */}
            <span className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                {/* The rotating spinner background */}
                <motion.span
                    aria-hidden
                    className="absolute top-1/2 left-1/2 aspect-square w-[300%]"
                    style={{
                        background: gradient,
                        x: '-50%',
                        y: '-50%',
                    }}
                    animate={{ rotate: 360 }}
                    transition={{
                        duration: spinDuration,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                />
            </span>

            {/* 3. Inner pill (covers the spinner except for the 2px margin) */}
            <span
                className={[
                    'relative z-10 flex items-center justify-center gap-2 px-4 py-2 m-[2px] rounded-full w-[calc(100%-4px)] h-[calc(100%-4px)]',
                    'bg-slate-900 text-white text-sm font-bold whitespace-nowrap', // Adjusted text colors for our theme instead of `bg-background text-foreground`
                    'transition-colors duration-200',
                    innerClassName,
                ].join(' ')}
            >
                {children}
            </span>
        </motion.span>
    );

    if (href) {
        return (
            <Link href={href} className="relative inline-flex">
                {content}
            </Link>
        );
    }

    return (
        <button onClick={onClick} className="relative inline-flex cursor-pointer">
            {content}
        </button>
    );
}
