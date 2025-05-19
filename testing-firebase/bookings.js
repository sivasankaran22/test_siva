<script type="module">
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
  import {
    getFirestore, doc, getDoc, collection, addDoc
  } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
  import {
    getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup
  } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

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
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();

// Get the full path from the URL
const path = window.location.pathname;

// Example: "/titckets/MmLPs742j07G5by1TmbQ-a1d3b"
const slug = path.split("/").pop(); // Gets "MmLPs742j07G5by1TmbQ-a1d3b"

// Extract the ID before the dash
const ticketId = slug.split("-")[0];
const ticketTitle = document.getElementById("ticket_title").innerText;

  // Ensure DOM is ready before executing
  window.addEventListener("DOMContentLoaded", function () {
    const priceLabel = document.getElementById("price_label").innerText;
    const pricePerTicket = parseFloat(priceLabel.replace(/[^\d.]/g, '')); // Remove ₹ or any non-numeric

    const qtyInput = document.getElementById("quantity");
    const totalDisplay = document.getElementById("total");

    function updateTotal() {
      const qty = parseInt(qtyInput.value);
      totalDisplay.innerText = `${(qty * pricePerTicket).toFixed(2)}`;
    }

    // Set initial quantity and total
    qtyInput.value = 1;
    updateTotal();

    // Handle quantity change
    window.changeQty = function (change) {
      let qty = parseInt(qtyInput.value);
      qty = Math.max(1, Math.min(10, qty + change));
      qtyInput.value = qty;
      updateTotal();
    };

    // Optional: Listen for manual input change
    qtyInput.addEventListener("input", updateTotal);

    // Form submit
  document.getElementById("ticketForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    const qty = parseInt(document.getElementById("quantity").value);
    const total = qty * pricePerTicket;

    const user = auth.currentUser;

    // If user is not logged in, trigger login first
    if (!user) {
      try {
        const result = await signInWithPopup(auth, provider);
        const newUser = result.user;

        // Continue booking after login
        await saveBooking(newUser, qty, total);
      } catch (err) {
        console.error("Login failed:", err);
        alert("Login is required to book tickets.");
        return;
      }
    } else {
      // Already logged in
      await saveBooking(user, qty, total);
    }
  });

  async function saveBooking(user, qty, total) {
    try {
      await addDoc(collection(db, "bookings"), {
        ticketId: ticketId,
		ticketTitle: ticketTitle,
        price: pricePerTicket,
        quantity: qty,
        total: total,
        userId: user.uid,
        userName: user.displayName,
        userEmail: user.email,
        bookedAt: new Date()
      });

      alert("✅ Booking successful!");
      window.location.href = "thank-you.html";
    } catch (error) {
      console.error("Error booking:", error);
      alert("❌ Booking failed. Try again.");
    }
  }
  });
</script>
