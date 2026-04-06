import { useEffect, useState, useRef } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { auth, db } from "../../services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

// Components
import AdminSalesDashboard from "./AdminSalesDashboard";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";
import OrdersPage from "./OrdersPage";
import MenuControl from "./MenuControl";

function AdminApp() {
  const location = useLocation();
  const [role, setRole] = useState(null); 
  const [isChecking, setIsChecking] = useState(true);
  const pendingRedirect = useRef(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setRole(null);
        setIsChecking(false);
        return;
      }
      
      try {
        const snap = await getDoc(doc(db, "admins", u.uid));

        if (snap.exists()) {
          const data = snap.data();
          const userRole = data.role?.toLowerCase(); // تحويل الحروف لـ small عشان نتجنب مشاكل الحساسية
          
          // لو الرول مكتوب manger بالغلط في الداتا بيز، هنصلحها برمجياً هنا
          if (userRole === "manager" || userRole === "manger") {
            setRole("manager");
          } else if (userRole === "admin") {
            setRole("admin");
          } else {
            // لو عنده رول غريب ومش معروف، نخرجه من الحساب
            setRole(null);
            await auth.signOut();
            alert("عفواً، لا تملك صلاحيات الدخول للوحة التحكم.");
          }
        } else {
          setRole(null);
          await auth.signOut();
        }
      } catch (err) {
        console.error("Firebase Error:", err);
      } finally {
        setIsChecking(false);
      }
    });

    return () => unsub();
  }, []);

  if (isChecking) {
    return <div className="loading-screen">Loading Admin Data...</div>;
  }

  // دالة مساعدة لتحديد مسار البداية بناءً على الرول
  const getDefaultRoute = () => {
    if (role === "manager") return "sales";
    if (role === "admin") return "dashboard";
    // تم تغيير "/" إلى "/admin" عشان لو حصل أي خطأ يفضل في نفس المكان
    return "/admin"; 
  };

  // دالة لمعالجة التوجيه بعد تسجيل الدخول (عشان نمنع الرجوع للـ Landing Page)
  const getRedirectPath = () => {
    const savedPath = pendingRedirect.current;
    // نتأكد إن المسار المحفوظ موجود وبيبدأ بـ /admin
    if (savedPath && savedPath.startsWith("/admin")) {
      return savedPath;
    }
    return getDefaultRoute();
  };

  return (
    <Routes>
      <Route
        index
        element={
          role ? (
            <Navigate
              to={getRedirectPath()}
              replace
            />
          ) : (
            <AdminLogin
              onLogin={() => {
                pendingRedirect.current = location.state?.from ?? null;
              }}
            />
          )
        }
      />

      <Route
        path="dashboard"
        element={
          role === "admin" 
            ? <AdminDashboard /> 
            : <Navigate to="/admin" replace />
        }
      />

      <Route
        path="orders"
        element={
          role === "admin" 
            ? <OrdersPage /> 
            : <Navigate to="/admin" replace />
        }
      />

      <Route
        path="menu"
        element={
          role === "admin" 
            ? <MenuControl /> 
            : <Navigate to="/admin" state={{ from: location.pathname }} replace />
        }
      />

      <Route
        path="sales"
        element={
          role === "manager"
            ? <AdminSalesDashboard /> 
            : <Navigate to="/admin" replace />
        }
      />

      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}

export default AdminApp;