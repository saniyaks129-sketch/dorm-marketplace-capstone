# Dorm Marketplace — Product Requirements Document (PRD)

## 1. Scope Cut (Not Building for Day 1 MVP)
1. **In-App Payment Gateway:** Cut because items are handed over in person, and adding Stripe/PayPal integration introduces unnecessary payment processing overhead for Day 1.
2. **Live Real-Time Chat:** Cut because users can agree on handoff details using standard phone contact, avoiding real-time socket infrastructure complexity.
3. **Delivery & Tracking System:** Cut because all trades take place locally on campus between students, making shipping tracking completely irrelevant.

## 2. MVP Features (Core Day 1 Capabilities)
1. **Item Listing Management:** Allows sellers to post used campus items with names, descriptions, prices, and status.
2. **Item Claiming Flow:** Allows buyers to reserve available items instantly for in-person handoff.
3. **Seller State Overrides:** Enables sellers to manually adjust item status or force remove listings when sold offline.

## 3. Given / When / Then Acceptance Criteria (Claim Item Flow)

### Criterion 1: Successful Item Reservation
- **Given** an item status is set to `AVAILABLE`,
- **When** a buyer clicks "Claim Item",
- **Then** the system updates the item status to `CLAIMED_PENDING`, locks it for other users, and starts a reservation countdown timer.

### Criterion 2: Blocking Simultaneous Claims
- **Given** an item is currently in `CLAIMED_PENDING` status by another user,
- **When** a second buyer attempts to click "Claim Item",
- **Then** the system blocks the action and displays "Item is no longer available".

### Criterion 3: Expiration Reset (Ghost Buyer)
- **Given** an item is in `CLAIMED_PENDING` status and the pickup timer expires before confirmation,
- **When** the system runs the expiration check,
- **Then** the claim is voided and the item status automatically resets to `AVAILABLE`.