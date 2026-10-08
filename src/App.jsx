import React, { useState, useEffect } from 'react';

const initialListings = [
  { id: 'item-1', title: 'Mini Fridge (Whirlpool)', seller: 'Alex', price: '$40', status: 'AVAILABLE', claimedBy: null, expiresAt: null },
  { id: 'item-2', title: 'Calculus Textbook 10th Ed', seller: 'Jordan', price: '$15', status: 'AVAILABLE', claimedBy: null, expiresAt: null }
];

export default function App() {
  const [items, setItems] = useState(initialListings);
  const [logs, setLogs] = useState([]);

  const addLog = (msg) => setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);

  // SCENARIO 2 FIX: Ghost Buyer Automatic Expiration Timer Check
  useEffect(() => {
    const interval = setInterval(() => {
      const NOW = Date.now();
      setItems((prevItems) =>
        prevItems.map((item) => {
          if (item.status === 'CLAIMED_PENDING' && item.expiresAt && NOW > item.expiresAt) {
            addLog(`EXPIRED: Claim on "${item.title}" by ${item.claimedBy} timed out. Item reset to AVAILABLE.`);
            return { ...item, status: 'AVAILABLE', claimedBy: null, expiresAt: null };
          }
          return item;
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // SCENARIO 1 FIX: Concurrency Collision Lock
  const handleClaimItem = (itemId, buyerName) => {
    setItems((prevItems) => {
      const targetItem = prevItems.find((i) => i.id === itemId);

      if (!targetItem || targetItem.status !== 'AVAILABLE') {
        addLog(`BLOCKED: Claim by ${buyerName} failed. Item is no longer available.`);
        return prevItems;
      }

      const CLAIM_TIMEOUT_MS = 15000; // 15 seconds mock timer
      addLog(`SUCCESS: "${targetItem.title}" claimed by ${buyerName}. Reserved for 15s.`);

      return prevItems.map((i) =>
        i.id === itemId
          ? { ...i, status: 'CLAIMED_PENDING', claimedBy: buyerName, expiresAt: Date.now() + CLAIM_TIMEOUT_MS }
          : i
      );
    });
  };

  // SCENARIO 3 FIX: Hallway Sale Override (Seller Force Remove)
  const handleForceRemove = (itemId, sellerName) => {
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, status: 'SOLD_OFFLINE', claimedBy: null } : i))
    );
    addLog(`OVERRIDE: Item ${itemId} marked SOLD_OFFLINE by seller ${sellerName}.`);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: 'auto' }}>
      <h1>Dorm Marketplace Capstone 🎓🛒</h1>
      <p><i>Simple campus marketplace prototype built with edge-case protections.</i></p>

      <section style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>Available Campus Listings</h2>
        {items.map((item) => (
          <div key={item.id} style={{ padding: '12px', background: '#f9f9f9', marginBottom: '10px', borderRadius: '4px' }}>
            <h3>{item.title} — {item.price}</h3>
            <p>Seller: <b>{item.seller}</b> | Status: <b style={{ color: item.status === 'AVAILABLE' ? 'green' : 'red' }}>{item.status}</b></p>
            {item.claimedBy && <p>Claimed by: <b>{item.claimedBy}</b> (Timer Active)</p>}

            <div style={{ display: 'flex', gap: '10px' }}>
              {/* Scenario 1 Simulation */}
              <button disabled={item.status !== 'AVAILABLE'} onClick={() => handleClaimItem(item.id, 'User A (Sam)')}>
                Claim as Sam
              </button>
              <button disabled={item.status !== 'AVAILABLE'} onClick={() => handleClaimItem(item.id, 'User B (Robin)')}>
                Claim as Robin
              </button>

              {/* Scenario 3 Simulation */}
              <button onClick={() => handleForceRemove(item.id, item.seller)} style={{ background: '#e53935', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px' }}>
                Seller Override (Mark Sold Offline)
              </button>
            </div>
          </div>
        ))}
      </section>

      <section style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
        <h2>System Activity Logs</h2>
        <pre style={{ background: '#1e1e1e', color: '#00ff00', padding: '10px', borderRadius: '4px', height: '140px', overflowY: 'scroll' }}>
          {logs.join('\n')}
        </pre>
      </section>
    </div>
  );
}