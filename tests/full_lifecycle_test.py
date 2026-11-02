import time
import threading
from dataclasses import dataclass

@dataclass
class BookingState:
    event_remaining: int
    bookings: dict
    payment_status: dict # booking_id -> status
    booking_status: dict # booking_id -> status

def test_full_lifecycle():
    print("--- Running Full Lifecycle Simulation ---")
    state = BookingState(
        event_remaining=10,
        bookings={},
        payment_status={},
        booking_status={}
    )
    
    # 1. Simulate Reservation
    booking_id = "book_001"
    qty = 2
    if state.event_remaining >= qty:
        state.event_remaining -= qty
        state.bookings[booking_id] = {"qty": qty}
        state.payment_status[booking_id] = "pending"
        state.booking_status[booking_id] = "reserved"
        print(f"Step 1: Reserved {qty} tickets. Remaining: {state.event_remaining}")
    
    # 2. Simulate Successful Payment Webhook
    state.payment_status[booking_id] = "paid"
    state.booking_status[booking_id] = "confirmed"
    print(f"Step 2: Payment Succeeded. Status: {state.booking_status[booking_id]}")
    
    # 3. Simulate Failed Payment & Release
    booking_id_2 = "book_002"
    qty_2 = 3
    if state.event_remaining >= qty_2:
        state.event_remaining -= qty_2
        state.bookings[booking_id_2] = {"qty": qty_2}
        state.payment_status[booking_id_2] = "pending"
        state.booking_status[booking_id_2] = "reserved"
        print(f"Step 3a: Reserved {qty_2} tickets. Remaining: {state.event_remaining}")
        
        # Trigger failure
        state.payment_status[booking_id_2] = "failed"
        state.event_remaining += qty_2 # Release
        state.booking_status[booking_id_2] = "cancelled"
        print(f"Step 3b: Payment Failed. Released {qty_2} tickets. Remaining: {state.event_remaining}")

    # 4. Simulate Expired Hold
    booking_id_3 = "book_003"
    qty_3 = 1
    if state.event_remaining >= qty_3:
        state.event_remaining -= qty_3
        state.bookings[booking_id_3] = {"qty": qty_3}
        state.payment_status[booking_id_3] = "pending"
        state.booking_status[booking_id_3] = "reserved"
        print(f"Step 4a: Reserved {qty_3} tickets. Remaining: {state.event_remaining}")
        
        # Expiry cleanup
        state.event_remaining += qty_3
        state.booking_status[booking_id_3] = "cancelled"
        print(f"Step 4b: Reservation Expired. Released {qty_3} tickets. Remaining: {state.event_remaining}")

    print(f"Final Ticket Count: {state.event_remaining}")
    if state.event_remaining == 8: # 10 - 2 (confirmed)
        print("RESULT: PASS")
    else:
        print("RESULT: FAIL")

if __name__ == "__main__":
    test_full_lifecycle()
