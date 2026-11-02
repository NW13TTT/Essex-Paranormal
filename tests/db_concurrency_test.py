import time
import threading
import random
from dataclasses import dataclass

@dataclass
class TestResult:
    success: bool
    message: str

def mock_supabase_reserve_tickets(event_id, qty, state):
    with state['lock']:
        current_remaining = state['events'][event_id]['remaining']
        if current_remaining >= qty:
            time.sleep(random.uniform(0.01, 0.05))
            state['events'][event_id]['remaining'] -= qty
            return True
        return False

def simulate_booking_request(user_id, event_id, qty, state, results):
    success = mock_supabase_reserve_tickets(event_id, qty, state)
    results.append(TestResult(success, f"User {user_id} requested {qty} tickets: {'Success' if success else 'Failed'}"))

def run_concurrency_test():
    state = {
        'lock': threading.Lock(),
        'events': {
            'ev_test_01': {'remaining': 10}
        }
    }
    results = []
    threads = []
    for i in range(15):
        t = threading.Thread(target=simulate_booking_request, args=(i, 'ev_test_01', 1, state, results))
        threads.append(t)
    for t in threads: t.start()
    for t in threads: t.join()
    success_count = sum(1 for r in results if r.success)
    final_remaining = state['events']['ev_test_01']['remaining']
    print(f"Total Requests: 15\nSuccessful Bookings: {success_count}\nTickets Remaining: {final_remaining}")
    if success_count == 10 and final_remaining == 0:
        print("RESULT: PASS")
    else:
        print("RESULT: FAIL")

if __name__ == "__main__":
    run_concurrency_test()
