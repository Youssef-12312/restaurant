import { useState } from "react";

export default function useTable() {
  const getInitialData = () => {
    const params = new URLSearchParams(window.location.search);
    const tableFromURL = params.get("table");
    const branchFromURL = params.get("branch");

    // تحديث الـ session لو اللينك فيه داتا جديدة
    if (tableFromURL) {
      sessionStorage.setItem("tableNumber", tableFromURL);
    }
    if (branchFromURL) {
      sessionStorage.setItem("branchName", branchFromURL);
    }

    // إرجاع رقم الترابيزة واسم الفرع في شكل Object
    return {
      tableNumber: sessionStorage.getItem("tableNumber"),
      branchName: sessionStorage.getItem("branchName"),
    };
  };

  const [tableData] = useState(getInitialData);

  return tableData;
}