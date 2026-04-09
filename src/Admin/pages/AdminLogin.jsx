import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useTranslation } from "react-i18next";
import { auth, db } from "../../services/firebase.js";
import "../styles/admin.css";
import { images } from "../../assets/Images/images.js";


function AdminLogin({ onLogin }) {
  const { t } = useTranslation();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);

      const adminDoc = await getDoc(doc(db, "admins", cred.user.uid));

      if (!adminDoc.exists()) {
        await auth.signOut();
        setError(t("admin.login.errors.noAccess"));
        setLoading(false);
        return;
      }


      onLogin(cred.user);
    } catch (err) {
        
      const code = err?.code || "";
      if (
        code === "auth/user-not-found" ||
        code === "auth/wrong-password" ||
        code === "auth/invalid-credential"
      ) {
        setError(t("admin.login.errors.invalidCredentials"));
      } else if (code === "auth/too-many-requests") {
        setError(t("admin.login.errors.tooManyRequests"));
      } else if (code === "auth/network-request-failed") {
        setError(t("admin.login.errors.network"));
      } else {
        setError(t("admin.login.errors.generic"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="al-page">
      <div className="al-card">

        <div className="al-logo">
          <span className="logo" style={{ marginLeft: "0px" }}>  
            <img src={images.logo} alt={t("admin.brand.logoAlt")} loading="lazy" />
          </span>
          <span className="al-logo__text">Shelter</span>
        </div>

        <h1 className="al-title">{t("admin.login.title")}</h1>
        <p className="al-sub">{t("admin.login.subtitle")}</p>

        <form className="al-form" onSubmit={handleLogin}>

          <div className="al-field">
            <label className="al-label">{t("admin.login.email")}</label>
            <input
              className="al-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("admin.login.emailPlaceholder")}
              required
            />
          </div>

          <div className="al-field">
            <label className="al-label">{t("admin.login.password")}</label>
            <input
              className="al-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("admin.login.passwordPlaceholder")}
              autoComplete="current-password"
              required
            />
          </div>

          {error && <p className="al-error">{error}</p>}

          <button className="al-btn" type="submit" disabled={loading}>
            {loading ? t("admin.login.signingIn") : t("admin.login.signIn")}
          </button>

        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
