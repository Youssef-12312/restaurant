import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function RedirectHandler() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const table = params.get("table");
    const branch = params.get("branch"); // إضافة الفرع
    const token = params.get("token");

    // حفظ البيانات لو موجودة في اللينك
    if (table) sessionStorage.setItem("tableNumber", table);
    if (branch) sessionStorage.setItem("branchName", branch);
    if (token) sessionStorage.setItem("tableToken", token);

    // تنظيف البيانات لو دخل على الرئيسية من غير QR
    if (!table && !branch && !token && location.pathname === "/") {
      sessionStorage.removeItem("tableNumber");
      sessionStorage.removeItem("branchName");
      sessionStorage.removeItem("tableToken");
    }

    // التوجيه لصفحة المنيو
    if (table && branch && location.pathname === "/") {
      const query = new URLSearchParams({ branch, table });
      if (token) query.set("token", token);
      navigate(`/menu?${query.toString()}`, { replace: true });
    }
  }, [location, navigate]);

  return null;
}

export default RedirectHandler;