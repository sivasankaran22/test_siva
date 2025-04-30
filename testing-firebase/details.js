<script type="module">
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
  import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

  // Firebase config
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
  const db = getFirestore(app);

  // 👇 Get ?id from URL
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const container = document.getElementById("detailsContainer");

  if (!id) {
    container.innerHTML = "<p>❌ No ID provided in URL.</p>";
    throw new Error("Missing ID");
  }

  async function loadDetails() {
    try {
      const docRef = doc(db, "tickets", id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        container.innerHTML = "<p>❌ Item not found.</p>";
        return;
      }

      const data = docSnap.data();

      const startDate = formatDate(data.startDate);
      const endDate = formatDate(data.endDate);

      container.innerHTML = `
        <div class="details-card">
          <img src="${data.images || 'https://via.placeholder.com/600x400'}" style="max-width: 100%; border-radius: 10px;" />
          <h2>${data.title || "No Title"}</h2>
          <p><strong>Description:</strong> ${data.description || "N/A"}</p>
          <p><strong>Price:</strong> ₹${data.price || 0}</p>
          <p><strong>Type:</strong> ${data.propertyType || "N/A"}</p>
          <p><strong>Start:</strong> ${startDate}</p>
          <p><strong>End:</strong> ${endDate}</p>
        </div>
      `;
    } catch (error) {
      console.error(error);
      container.innerHTML = "<p>❌ Failed to load data.</p>";
    }
  }

  function formatDate(timestamp) {
    if (!timestamp) return "N/A";
    const date = typeof timestamp.toDate === 'function' ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-IN");
  }

  loadDetails();
</script>
