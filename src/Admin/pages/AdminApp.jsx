import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { auth, db } from "../../Services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";
import OrdersPage from "./OrdersPage";
import MenuControl from "./MenuControl";

function AdminApp() {
  const [user, setUser] = useState(undefined); // undefined = loading
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setUser(null);
        setIsAdmin(false);
        return;
      }

      const snap = await getDoc(doc(db, "admins", u.uid));
      if (snap.exists()) {
        setUser(u);
        setIsAdmin(true);
      } else {
        setUser(null);
        setIsAdmin(false);
        await auth.signOut();
        navigate("/admin");
      }
    });
    return () => unsub();
  }, []);

  if (user === undefined) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAdmin ? <Navigate to="/admin/dashboard" replace /> : <AdminLogin />
        }
      />
      <Route
        path="/dashboard"
        element={isAdmin ? <AdminDashboard /> : <Navigate to="/admin" replace />}
      />
      <Route
        path="/orders"
        element={isAdmin ? <OrdersPage /> : <Navigate to="/admin" replace />}
      />
      <Route
        path="/menu"
        element={isAdmin ? <MenuControl /> : <Navigate to="/admin" replace />}
      />
    </Routes>
  );
}

export default AdminApp;