import { useState, useEffect } from 'react'

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [codes, setCodes] = useState([])
  
  // Login Form State
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Post Code Form State
  const [codeString, setCodeString] = useState('')
  const [odds, setOdds] = useState('')
  const [isVip, setIsVip] = useState(false) // NEW: The VIP Toggle

  // --- THE LOGIN ENGINE ---
  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('https://soj-betting-engine.onrender.com/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      if (response.ok) {
        const userData = await response.json()
        setCurrentUser(userData)
      } else {
        alert("Wrong email or password!")
      }
    } catch (error) {
      console.error("Login failed:", error)
    }
  }

  // --- THE FEED ENGINE ---
  const fetchCodes = () => {
    fetch('https://soj-betting-engine.onrender.com/codes')
      .then(res => res.json())
      .then(data => setCodes(data))
  }

  useEffect(() => {
    if (currentUser) {
      fetchCodes()
    }
  }, [currentUser])

  // --- POST CODE ENGINE ---
  const handleDropCode = async (e) => {
    e.preventDefault()
    
    const newCode = {
      bookmaker_id: 1, 
      code_string: codeString,
      total_odds: parseFloat(odds),
      is_vip: isVip // NEW: Sends the toggle state to the vault
    }

    try {
      const response = await fetch(`https://soj-betting-engine.onrender.com/codes?tipster_id=${currentUser.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCode)
      })

      if (response.ok) {
        setCodeString('')
        setOdds('')
        setIsVip(false) // Reset toggle
        fetchCodes() 
      }
    } catch (error) {
      console.error("Error posting:", error)
    }
  }

  // --- SCREEN 1: THE LOGIN SCREEN ---
  if (!currentUser) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f4f4' }}>
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Login to SOJ Betting</h2>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} style={{ padding: '12px', borderRadius: '4px', border: '1px solid #ccc' }} />
            <input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} style={{ padding: '12px', borderRadius: '4px', border: '1px solid #ccc' }} />
            <button type="submit" style={{ padding: '12px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Sign In</button>
          </form>
        </div>
      </div>
    )
  }

  // --- SCREEN 2: THE VIP FEED ---
  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Welcome, {currentUser.username} {currentUser.is_premium ? '👑 (Premium)' : '🏆 (Free)'}</h2>
        <button onClick={() => setCurrentUser(null)} style={{ padding: '8px 15px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
      </div>

      <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <h3 style={{ marginTop: 0 }}>Post a New Slip</h3>
        <form onSubmit={handleDropCode} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input type="text" placeholder="Booking Code (e.g., HW-12345)" required value={codeString} onChange={(e) => setCodeString(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
          <input type="number" step="0.01" placeholder="Total Odds (e.g., 2.5)" required value={odds} onChange={(e) => setOdds(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
          
          {/* THE VIP CHECKBOX */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 'bold', color: '#d35400' }}>
            <input type="checkbox" checked={isVip} onChange={(e) => setIsVip(e.target.checked)} style={{ transform: 'scale(1.2)' }} />
            Mark as VIP Premium Code 💎
          </label>

          <button type="submit" style={{ padding: '10px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Drop Code</button>
        </form>
      </div>

      <h2 style={{ textAlign: 'center' }}>🔥 Live Feed</h2>
      
      {codes.map((code) => {
        // THE PAYWALL LOGIC: Lock it if the code is VIP AND the user is NOT premium
        const isLocked = code.is_vip && !currentUser.is_premium;

        return (
          <div key={code.id} style={{ border: isLocked ? '2px solid #f1c40f' : '1px solid #ddd', borderRadius: '8px', padding: '20px', marginBottom: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              
              {/* If locked, blur the text. If unlocked, show the code. */}
              {isLocked ? (
                <h2 style={{ margin: 0, color: '#aaa', filter: 'blur(5px)', userSelect: 'none' }}>HIDDEN-VIP-CODE</h2>
              ) : (
                <h2 style={{ margin: 0, color: '#2c3e50' }}>{code.code_string}</h2>
              )}

              <span style={{ backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '5px 10px', borderRadius: '20px', fontWeight: 'bold' }}>{code.status}</span>
            </div>
            
            <p style={{ margin: '10px 0 0 0', fontSize: '18px' }}>Total Odds: <strong>{code.total_odds}</strong> {code.is_vip && "💎 VIP"}</p>
            
            {/* The Upgrade Prompt */}
            {isLocked && (
              <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#fff3cd', color: '#856404', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }}>
                🔒 VIP Only. Upgrade to Premium to view this slip!
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default App