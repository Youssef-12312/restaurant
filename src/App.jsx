import "./i18n";
import "./Styles/App.css";
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Landing from "./pages/landing";
import CustomerMenu from "./pages/CustomerMenu";
import Checkout from "./pages/CheckOut.jsx";
import PrivacyPolicy from "./pages/Privacy.jsx";
import AdminApp from "./Admin/pages/AdminApp";  

function App() {
  const [cart, setCart] = useState([]);
  const { i18n } = useTranslation();

  useEffect(() => {
    const dir = i18n.language === "ar" ? "rtl" : "ltr";
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", i18n.language);
  }, [i18n.language]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"         element={<Landing />} />
        <Route path="/menu"     element={<CustomerMenu cart={cart} setCart={setCart} />} />
        <Route path="/checkout" element={<Checkout cart={cart} />} />
        <Route path="/privacy"  element={<PrivacyPolicy />} />
        <Route path="/admin/*"    element={<AdminApp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;