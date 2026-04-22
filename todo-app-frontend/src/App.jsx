import { AuthProvider } from "./context/AuthContext"
import { TodoProvider } from "./context/TodoContext"
import { Routes, Route } from "react-router-dom"
import Dashboard from "./pages/Dashboard"
import Signup from "./pages/Signup"
import OAuthCallback from "./pages/OAuthCallback"

function App() {
  return (
    <AuthProvider>
      <TodoProvider>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/oauth/callback" element={<OAuthCallback />} />
        </Routes>
      </TodoProvider>
    </AuthProvider>
  )
}

export default App