import { Route, Routes } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { TodoProvider } from "./context/TodoContext";
import Dashboard from "./pages/Dashboard";
import Signup from "./pages/Signup";
import Errors from "./pages/Errors";

/**
 * Wires the frontend routes together under the shared auth and todo providers.
 */
export default function App() {
  return (
    <AuthProvider>
      <TodoProvider>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/auth/error" element={<Errors />} />
        </Routes>
      </TodoProvider>
    </AuthProvider>
  );
}
