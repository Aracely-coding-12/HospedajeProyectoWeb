import { useState } from 'react'
import Login from './page/login.jsx'
import Admin from './page/admin.jsx'
import './App.css'

function App() {
  const [session, setSession] = useState(null)
  const isAuthorizedAdmin =
    session?.role === 'admin' && session?.authorized === true

  if (!isAuthorizedAdmin) {
    return <Login onLogin={setSession} />
  }

  return <Admin session={session} onLogout={() => setSession(null)} />
}

export default App
