<script type="module">
  import {
    initializeApp,
		getApps
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
    doc,
    getDoc,
    updateDoc,
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
    storageBucket: "travles-d6ec6.appspot.com",
    messagingSenderId: "96133501296",
    appId: "1:96133501296:web:d2fbf62a740fc27d997fb5",
    measurementId: "G-SZ7BPENFF7"
  };

  // 🔌 Initialize
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);

  // 🧾 Get ticketId from URL
  const urlParams = new URLSearchParams(window.location.search);
  const ticketId = urlParams.get("ticketId");

  // 🧍 Auth state (protect add/edit routes)
  onAuthStateChanged(auth, (user) => {
    const isAddPage = window.location.pathname.includes("/admin/add-ticket");
    const isEditPage = window.location.pathname.includes("/admin/edit-ticket");

    if ((isAddPage || isEditPage) && (!user || user.uid !== "sZQtxYYnMYTbCRsu8rtMVVrRf4u1")) {
      window.location.href = "/";
    }
  });

  // 🔓 Logout
  const logoutBtn = document.getElementById("logout_button");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await signOut(auth);
      window.location.href = "/";
    });
  }

  // 📤 Submit/Create or Update Ticket
  window.addEventListener('load', async () => {
    const form = document.getElementById("myForm");
    const statusDiv = document.getElementById("formStatus");

    if (!form) return;

    // If ticketId exists, load data for editing
    if (ticketId) {
      const docRef = doc(db, "tickets", ticketId);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        form.title.value = data.title || "";
        form.shortDescription.value = data.shortDescription || "";
        form.description.value = data.description || "";
        form.price.value = data.price || "";
        form.propertyType.value = data.propertyType || "";
        form.startDate.value = data.startDate?.toDate().toISOString().substr(0, 10) || "";
        form.endDate.value = data.endDate?.toDate().toISOString().substr(0, 10) || "";
        // Show existing image
        if (data.images) {
          const preview = document.getElementById("previewImage");
          preview.src = data.images;
          preview.style.display = "block";
        }
      } else {
        statusDiv.textContent = "Ticket not found.";
      }
    }

    // Handle form submission (Create or Update)
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      statusDiv.textContent = "Submitting...";

      const user = auth.currentUser;
      if (!user) return statusDiv.textContent = "⚠️ Please log in first.";

      const getVal = (name) => form.querySelector(`[name="${name}"]`).value.trim();
      const file = form.querySelector('[name="images"]').files[0];

      const startDate = new Date(getVal("startDate"));
      const endDate = new Date(getVal("endDate"));
      if (isNaN(startDate) || isNaN(endDate)) return statusDiv.textContent = "⚠️ Invalid date input.";

      let imageUrl = null;
      try {
        if (file) {
          const fileRef = ref(storage, `${Date.now()}_${file.name}`);
          await uploadBytes(fileRef, file);
          imageUrl = await getDownloadURL(fileRef);
        }

        const data = {
          title: getVal("title"),
          shortDescription: getVal("shortDescription"),
          description: getVal("description"),
          price: parseFloat(getVal("price")),
          propertyType: getVal("propertyType"),
          startDate: Timestamp.fromDate(startDate),
          endDate: Timestamp.fromDate(endDate),
        };
        if (imageUrl) data.images = imageUrl;

        if (ticketId) {
          // Update
          await updateDoc(doc(db, "tickets", ticketId), data);
          statusDiv.textContent = "✅ Ticket updated!";
        } else {
          // Create
          await addDoc(collection(db, "tickets"), {
            ...data,
            bookingCount: 0,
            createdAt: Timestamp.now(),
            userId: user.uid,
            userEmail: user.email,
            userName: user.displayName,
            userPhoto: user.photoURL
          });
          statusDiv.textContent = "✅ Ticket submitted!";
          form.reset();
        }

      } catch (err) {
        console.error(err);
        statusDiv.textContent = "❌ Submission failed.";
      }
    });
  });
</script>
