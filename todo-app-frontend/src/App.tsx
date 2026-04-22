import { Route, Routes } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { TodoProvider } from "./context/TodoContext";
import Dashboard from "./pages/Dashboard";
import Signup from "./pages/Signup";

export default function App() {
  return (
    <AuthProvider>
      <TodoProvider>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </TodoProvider>
    </AuthProvider>
  );
}
