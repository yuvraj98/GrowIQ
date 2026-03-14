// lib/utils.js
// Utility functions for formatting and validation

/**
 * Format currency in Indian Rupees
 */
export function formatCurrency(amount) {
    if (amount === null || amount === undefined) return '₹0';
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount);
}

/**
 * Format large numbers with K, L, Cr suffixes
 */
export function formatNumber(num) {
    if (num === null || num === undefined) return '0';
    if (num >= 10000000) return `${(num / 10000000).toFixed(1)}Cr`;
    if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString('en-IN');
}

/**
 * Format percentage
 */
export function formatPercent(value, decimals = 1) {
    if (value === null || value === undefined) return '0%';
    return `${Number(value).toFixed(decimals)}%`;
}

/**
 * Format ROAS with color indicator
 */
export function getRoasColor(roas) {
    if (roas < 2.5) return 'text-red-500';
    if (roas < 4) return 'text-amber-500';
    return 'text-emerald-500';
}

/**
 * Format date relative to now
 */
export function formatRelativeDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-IN');
}

/**
 * Get health score color and label
 */
export function getHealthScoreInfo(score) {
    if (score >= 80) return { color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Excellent' };
    if (score >= 60) return { color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Good' };
    if (score >= 40) return { color: 'text-orange-500', bg: 'bg-orange-500/10', label: 'Fair' };
    return { color: 'text-red-500', bg: 'bg-red-500/10', label: 'Needs Attention' };
}

/**
 * Get severity color and icon
 */
export function getSeverityInfo(severity) {
    const map = {
        critical: { color: 'text-red-600', bg: 'bg-red-500/10', border: 'border-red-500/30' },
        high: { color: 'text-orange-600', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
        medium: { color: 'text-amber-600', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
        low: { color: 'text-emerald-600', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
    };
    return map[severity] || map.low;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(str, maxLength = 50) {
    if (!str) return '';
    return str.length > maxLength ? `${str.substring(0, maxLength)}...` : str;
}

/**
 * Generate initials from name
 */
export function getInitials(name) {
    if (!name) return '??';
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
}

/**
 * Classnames helper
 */
export function cn(...classes) {
    return classes.filter(Boolean).join(' ');
}
