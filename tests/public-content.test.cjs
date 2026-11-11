const assert = require('node:assert/strict');
const fs = require('node:fs');
const { test } = require('node:test');
const vm = require('node:vm');

const script = fs.readFileSync(new URL('./public/public-content.js', 'file://' + process.cwd() + '/'), 'utf8');

async function render(payload) {
  const paragraph = {
    children: [], textContent: 'Original tagline',
    dataset: { controlRoomContentKey: 'site-copy-home-p-001', controlRoomContentField: 'text' },
  };
  const unrelated = {
    children: [], textContent: 'The Guildhall',
    dataset: { controlRoomContentKey: 'unmapped', controlRoomContentField: 'title' },
  };
  let dispatched = false;
  vm.runInNewContext(script, {
    fetch: async () => ({ ok: true, json: async () => payload }),
    document: {
      querySelectorAll(selector) {
        return selector === '[data-control-room-content-key]' ? [paragraph, unrelated] : [];
      },
    },
    CustomEvent: class {},
    window: { dispatchEvent() { dispatched = true; } },
  });
  await new Promise(setImmediate);
  return { paragraph, unrelated, dispatched };
}

test('only matching public records replace copy and markup stays literal', async () => {
  const text = '<strong>Approved text</strong>';
  const result = await render({
    website: { domain: 'essexparanormal.com' },
    content: [{ contentKey: 'site-copy-home-p-001', content: { text } }],
  });
  assert.equal(result.paragraph.textContent, text);
  assert.equal(result.unrelated.textContent, 'The Guildhall');
  assert.equal(result.dispatched, true);
});

test('empty and wrong-site payloads preserve the static copy', async () => {
  for (const domain of ['essexparanormal.com', 'other.example']) {
    const result = await render({ website: { domain }, content: [] });
    assert.equal(result.paragraph.textContent, 'Original tagline');
    assert.equal(result.dispatched, domain === 'essexparanormal.com');
  }
});
