import test from 'node:test';
import assert from 'node:assert/strict';
import { sumUpClient } from '../sumup.js';

const env = { SUMUP_API_KEY: 'mock', SUMUP_MERCHANT_CODE: 'TEST' };
const reservation = { reference: 'EP-test', amountPence: 1250, checkoutId: 'checkout' };
const checkout = {
    id: 'checkout',
    checkout_reference: 'EP-test',
    merchant_code: 'TEST',
    amount: 12.50,
    currency: 'GBP',
    hosted_checkout_url: 'https://checkout.sumup.com/pay/test',
};

test('creates hosted checkout from the stored total and booking reference', async () => {
    const client = sumUpClient(env, async (url, options) => {
        assert.equal(url, 'https://api.sumup.com/v0.1/checkouts');
        assert.equal(options.method, 'POST');
        const payload = JSON.parse(options.body);
        assert.equal(payload.amount, 12.5);
        assert.equal(payload.checkout_reference, reservation.reference);
        assert.equal(payload.return_url, 'https://example.com/webhook');
        assert.deepEqual(payload.hosted_checkout, { enabled: true });
        return Response.json(checkout);
    });
    assert.deepEqual(await client.createHostedCheckout(reservation, {
        webhookUrl: 'https://example.com/webhook',
        redirectUrl: 'https://example.com/bookings',
    }), { id: checkout.id, url: checkout.hosted_checkout_url });
});

test('independently retrieves and verifies SumUp payment status', async () => {
    for (const status of ['PENDING', 'PAID', 'FAILED', 'EXPIRED']) {
        const client = sumUpClient(env, async (url) => {
            assert.equal(url, 'https://api.sumup.com/v0.1/checkouts/checkout');
            return Response.json({ ...checkout, status });
        });
        assert.equal(await client.verifyCheckout(reservation), status);
    }
});

test('rejects paid checkouts with mismatched payment details', async () => {
    for (const mismatch of [
        { id: 'other' }, { merchant_code: 'OTHER' }, { amount: 1 },
        { currency: 'EUR' }, { checkout_reference: 'other' },
    ]) {
        const client = sumUpClient(env, async () => Response.json({
            ...checkout, status: 'PAID', ...mismatch,
        }));
        await assert.rejects(client.verifyCheckout(reservation), /does not match/);
    }
});
