import { AuthProvider } from "./context/AuthContext"
import { TodoProvider } from "./context/TodoContext"
import Dashboard from "./pages/Dashboard"

function App() {
  return (
    <AuthProvider>
      <TodoProvider>
        <Dashboard />
      </TodoProvider>
    </AuthProvider>
  )
}

export default App