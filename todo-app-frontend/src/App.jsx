import { AuthProvider } from "./context/AuthContext"
import { TodoProvider } from "./context/TodoContext"
import { Routes, Route } from "react-router-dom"
import Dashboard from "./pages/Dashboard"
import Signup from "./pages/Signup"

function App() {
  return (
    <AuthProvider>
      <TodoProvider>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </TodoProvider>
    </AuthProvider>
  )
}

export default App