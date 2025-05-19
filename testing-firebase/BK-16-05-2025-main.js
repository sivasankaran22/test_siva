<script type="module">
  import {
    initializeApp
  } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
  import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged
  } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
  import {
    getFirestore,
    collection,
    query,
    onSnapshot,
    addDoc,
    Timestamp
  } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
  import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL
  } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-storage.js";

  // 🔧 Firebase Config
  const firebaseConfig = {
    apiKey: "AIzaSyDv20sRkLIHN58xj8l0i3r7pwIW41n476g",
    authDomain: "travles-d6ec6.firebaseapp.com",
    projectId: "travles-d6ec6",
    storageBucket: "travles-d6ec6.firebasestorage.app",
    messagingSenderId: "96133501296",
    appId: "1:96133501296:web:d2fbf62a740fc27d997fb5",
    measurementId: "G-SZ7BPENFF7"
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);

  // 🔐 Login
  const loginBtn = document.getElementById("login-google");
  if (loginBtn) {
    loginBtn.addEventListener("click", async () => {
      try {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
        window.location.href = "/user/dashboard-users";
      } catch (err) {
        console.error("Login failed", err);
      }
    });
  }

  // 🔓 Logout
  const logoutBtn = document.getElementById("logout_button");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await signOut(auth);
      window.location.href = "/";
    });
  }

  // 🔒 Route protection
  if (window.location.pathname === "/user/dashboard-users") {
    onAuthStateChanged(auth, (user) => {

      if (!user) {
        window.location.href = "/";
      }
    });
  }

 

  // 📥 Realtime Display (List of Cards)
  const competitionsList = document.getElementById("ListOfCards");
  if (competitionsList) {
    const q = query(collection(db, "tickets"));
    onSnapshot(q, (snapshot) => {
      competitionsList.innerHTML = "";
      if (snapshot.empty) {
        competitionsList.innerHTML = "<p>No live competitions found.</p>";
        return;
      }
      const ul = document.createElement("ul");
      ul.className = "grid-layout mobile-landscape-1-column grid-gap-xs w-list-unstyled ";
      snapshot.forEach((doc) => {
        const d = doc.data();
		const formattedStartDate = formatDate(d.startDate);
		const formattedEndDate = formatDate(d.endDate);
        const li = document.createElement("li");
        li.className = "card";
        li.innerHTML = `
          <div class="card-body">
        <img src="${d.images || 'https://via.placeholder.com/300x200'}" alt="${d.title || 'Image'}" class="card-image" />
        <div class="">
          <h4 class="h3-heading">${d.title || "Unnamed"}</h4>
          <p>${d.shortDescription || "No description provided."}</p>
        </div>
        <div class="">
          <div class="w-layout-hflex flex-horizontal y-baseline">
            <h4 class="h2-heading utility-margin-bottom-0">₹${d.price || "0"}</h4>
            <p class="h4-heading utility-margin-bottom-0">/entry</p>
          </div>
          <p class="paragraph-lg">Start Date: ${formattedStartDate}</p>  
          <p class="paragraph-lg">End Date: ${formattedEndDate}</p>
          <div class="utility-margin-top-1rem">
            <div class="button-group">
              <a href="details?id=${doc.id}" class="button w-button">Join now</a>
            </div>
          </div>
        </div>
      </div>`;
        ul.appendChild(li);
      });
      competitionsList.appendChild(ul);
    });
  }

function formatDate(timestamp) {
  if (!timestamp) return "N/A";

  // Check if timestamp has toDate() method (Firestore Timestamp)
  const date = typeof timestamp.toDate === 'function' ? timestamp.toDate() : new Date(timestamp);

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}
</script>


<script>
  document.addEventListener("DOMContentLoaded", () => {
    const path = window.location.pathname;

    // Check if current path includes "/user/" or "/admin/"
    if (path.includes("/user/") || path.includes("/admin/") || path.includes("/titckets/")) {
      const logoutBtn = document.createElement("button");
      logoutBtn.id = "logout_button";
      logoutBtn.textContent = "Logout";


      logoutBtn.addEventListener("click", () => {
        // Assuming Firebase Auth is being used
        logoutBtn();
      });

      document.body.appendChild(logoutBtn);
    }
  });
</script>
