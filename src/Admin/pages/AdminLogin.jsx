import { useState} from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../services/firebase.js";
import "../styles/admin.css";
import { images } from "../../assets/Images/images.js";


function AdminLogin({ onLogin }) {
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
console.log("UID:", cred.user.uid);
const adminDoc = await getDoc(doc(db, "admins", cred.user.uid));
console.log("Admin doc exists:", adminDoc.exists());
      if (!adminDoc.exists()) {
        await auth.signOut();
        setError("You don't have admin access.");
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
        setError("Invalid email or password.");
      } else if (code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.");
      } else if (code === "auth/network-request-failed") {
        setError("Network error. Check your connection.");
      } else {
        setError("Something went wrong. Please try again.");
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
            <img src={images.logo} alt="Shelter logo" loading="lazy" />
          </span>
          <span className="al-logo__text">Shelter</span>
        </div>

        <h1 className="al-title">Admin Login</h1>
        <p className="al-sub">Restaurant Management Panel</p>

        <form className="al-form" onSubmit={handleLogin}>

          <div className="al-field">
            <label className="al-label">Email</label>
            <input
              className="al-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@shelter.com"
              required
            />
          </div>

          <div className="al-field">
            <label className="al-label">Password</label>
            <input
              className="al-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="al-error">{error}</p>}

          <button className="al-btn" type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>

        </form>
      </div>
    </div>
  );
}

export default AdminLogin;