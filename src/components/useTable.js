import { useState } from "react";

export default function useTable() {
  const getInitialData = () => {
    const params = new URLSearchParams(window.location.search);
    const tableFromURL = params.get("table");
    const branchFromURL = params.get("branch");
    const tokenFromURL = params.get("token"); // 👈 سحب التوكن من الرابط
    
    // تحديث الـ session لو اللينك فيه داتا جديدة
    if (tableFromURL) {
      sessionStorage.setItem("tableNumber", tableFromURL);
    }
    if (branchFromURL) {
      sessionStorage.setItem("branchName", branchFromURL);
    }
    if (tokenFromURL) {
      sessionStorage.setItem("tableToken", tokenFromURL); // 👈 حفظ التوكن في السيشن
    }

    // إرجاع رقم الترابيزة واسم الفرع والتوكن في شكل Object
    return {
      tableNumber: sessionStorage.getItem("tableNumber"),
      branchName: sessionStorage.getItem("branchName"),
      tableToken: sessionStorage.getItem("tableToken"), // 👈 إرجاع التوكن علشان نستخدمه في الطلب
    };
  };

  const [tableData] = useState(getInitialData);

  return tableData;
}