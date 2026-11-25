const essexBookingAvailability = async (url) => {
    const availability = new Map();
    try {
        const response = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(8000) });
        if (!response.ok) return { enabled: false, availability };
        const status = await response.json();
        if (!Array.isArray(status.availability)) return { enabled: false, availability };
        for (const item of status.availability) {
            if (typeof item?.event_id === 'string' && typeof item.content_key === 'string'
                && Number.isInteger(item.remaining) && item.remaining >= 0) {
                availability.set(item.content_key, item);
            }
        }
        return { enabled: status.enabled === true, availability };
    } catch {
        return { enabled: false, availability };
    }
};

const essexBookingToday = () => {
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit'
    }).formatToParts(new Date()).map(part => [part.type, part.value]));
    return `${parts.year}-${parts.month}-${parts.day}`;
};
