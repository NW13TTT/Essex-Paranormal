const CHECKOUTS = 'https://api.sumup.com/v0.1/checkouts';

export function sumUpClient(env, send = fetch) {
    const apiKey = env.SUMUP_API_KEY;
    const merchant = env.SUMUP_MERCHANT_CODE;
    if (!apiKey || !merchant) throw new Error('SumUp credentials are missing');

    async function request(url, options = {}) {
        const response = await send(url, {
            ...options,
            redirect: 'error',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) throw new Error(`SumUp returned HTTP ${response.status}`);
        return response.json();
    }

    function checkIdentity(checkout, reservation) {
        if (
            typeof checkout.id !== 'string' || !checkout.id ||
            checkout.checkout_reference !== reservation.reference ||
            checkout.merchant_code !== merchant ||
            checkout.currency !== 'GBP' ||
            checkout.amount !== reservation.amountPence / 100 ||
            (reservation.checkoutId && checkout.id !== reservation.checkoutId)
        ) throw new Error('SumUp checkout does not match the reservation');
    }

    return {
        async createHostedCheckout(reservation, { webhookUrl, redirectUrl }) {
            if (!Number.isSafeInteger(reservation.amountPence) || reservation.amountPence <= 0 ||
                !reservation.reference) throw new Error('Invalid reservation');
            const checkout = await request(CHECKOUTS, {
                method: 'POST',
                body: JSON.stringify({
                    checkout_reference: reservation.reference,
                    amount: reservation.amountPence / 100,
                    currency: 'GBP',
                    merchant_code: merchant,
                    hosted_checkout: { enabled: true },
                    return_url: webhookUrl,
                    redirect_url: redirectUrl,
                }),
            });
            checkIdentity(checkout, reservation);
            const url = new URL(checkout.hosted_checkout_url);
            if (url.origin !== 'https://checkout.sumup.com' || url.username || url.password) {
                throw new Error('Unexpected SumUp hosted checkout URL');
            }
            return { id: checkout.id, url: url.href };
        },

        async verifyCheckout(reservation) {
            if (!reservation.checkoutId) throw new Error('Missing SumUp checkout ID');
            const checkout = await request(`${CHECKOUTS}/${encodeURIComponent(reservation.checkoutId)}`);
            checkIdentity(checkout, reservation);
            if (!['PENDING', 'PAID', 'FAILED', 'EXPIRED'].includes(checkout.status)) {
                throw new Error('Unknown SumUp checkout status');
            }
            return checkout.status;
        },
    };
}
