import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function RedirectHandler() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const table = params.get("table");
    const branch = params.get("branch"); // إضافة الفرع

    // حفظ البيانات لو موجودة في اللينك
    if (table) sessionStorage.setItem("tableNumber", table);
    if (branch) sessionStorage.setItem("branchName", branch);

    // تنظيف البيانات لو دخل على الرئيسية من غير QR
    if (!table && !branch && location.pathname === "/") {
      sessionStorage.removeItem("tableNumber");
      sessionStorage.removeItem("branchName");
    }

    // التوجيه لصفحة المنيو
    if (table && branch && location.pathname === "/") {
      navigate(`/menu?branch=${branch}&table=${table}`, { replace: true });
    }
  }, [location, navigate]);

  return null;
}

export default RedirectHandler;