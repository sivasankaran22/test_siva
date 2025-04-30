<script type="module">
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
  import {
    getFirestore,
    collection,
    query,
    onSnapshot
  } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

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
  const competitionsList = document.getElementById("ListOfCards");

  const q = query(collection(db, "tickets"));

  onSnapshot(q, (snapshot) => {
    competitionsList.innerHTML = "";

    if (snapshot.empty) {
      competitionsList.innerHTML = "<p>No live competitions found.</p>";
      return;
    }
// Create <ul> wrapper
  const ul = document.createElement("ul");
  ul.setAttribute("role", "list");
  ul.className = "grid-layout mobile-landscape-1-column grid-gap-xs w-list-unstyled ";
  ul

   snapshot.forEach((doc) => {
    const data = doc.data();
    const li = document.createElement("li");
// Assuming `data.startDate` and `data.endDate` are timestamps (in seconds)
const formattedStartDate = formatDate(data.startDate);
const formattedEndDate = formatDate(data.endDate);
    li.className = "card";
    li.innerHTML = `
      <div class="card-body">
        <img src="${data.images || 'https://via.placeholder.com/300x200'}" alt="${data.title || 'Image'}" class="card-image" />
        <div class="">
          <h4 class="h3-heading">${data.title || "Unnamed"}</h4>
          <p>${data.shortDescription || "No description provided."}</p>
        </div>
        <div class="">
          <div class="w-layout-hflex flex-horizontal y-baseline">
            <h4 class="h2-heading utility-margin-bottom-0">₹${data.price || "0"}</h4>
            <p class="h4-heading utility-margin-bottom-0">/entry</p>
          </div>
          <p class="paragraph-lg">Start Date: ${formattedStartDate}</p>  
          <p class="paragraph-lg">End Date: ${formattedEndDate}</p>
          <div class="utility-margin-top-1rem">
            <div class="button-group">
              <a href="#" class="button w-button">Join now</a>
            </div>
          </div>
        </div>
      </div>
    `;
    ul.appendChild(li); // Add <li> to <ul>
  });
      competitionsList.appendChild(ul);
    });


// Correct function to format Firestore Timestamp to dd-mm-yyyy
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
<!-- Your Form Submit Script -->

<script type="module">
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore, collection, addDoc, Timestamp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getStorage, ref, listAll, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-storage.js";

// Initialize Firebase
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
const storage = getStorage(app);
console.log("storeage",storage);

/* sample code to get all image from the storage bucket  
  async function listImages() {
    const imagesFolderRef = ref(storage, 'images/'); // folder path

    try {
      const res = await listAll(imagesFolderRef);
      res.items.forEach(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        console.log('Image URL:', url);

        // Optionally display the images
        const img = document.createElement('img');
        img.src = url;
        img.width = 200;
        document.body.appendChild(img);
      });
    } catch (error) {
      console.error('Error listing images:', error);
    }
  }

  // Call the function to list images
  listImages();
  // to test the bucket image or premission you need this details.
  */
  
window.addEventListener('load', () => {
  const form = document.getElementById("myForm");
  const statusDiv = document.getElementById("formStatus");

  if (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      statusDiv.textContent = "Submitting...";

      const user = firebase.auth().currentUser;
      if (!user) {
        statusDiv.textContent = "⚠️ You must be logged in to submit the form.";
        return;
      }

      const title = form.querySelector('[name="title"]').value.trim();
      const shortDescription = form.querySelector('[name="shortDescription"]').value.trim();
      const description = form.querySelector('[name="description"]').value.trim();
      const price = parseFloat(form.querySelector('[name="price"]').value);
      const propertyType = form.querySelector('[name="propertyType"]').value.trim();
      const startDateInput = form.querySelector('[name="startDate"]').value;
      const endDateInput = form.querySelector('[name="endDate"]').value;
      const imagesFile = form.querySelector('[name="images"]').files[0]; // File input

      const startDate = new Date(startDateInput);
      const endDate = new Date(endDateInput);

      if (!title || !shortDescription || !description || !imagesFile || isNaN(price) || !propertyType || isNaN(startDate) || isNaN(endDate)) {
        statusDiv.textContent = "⚠️ Please fill in all fields correctly.";
        return;
      }

      const storageRef = ref(storage, `${Date.now()}_${imagesFile.name}`);

      try {
        // Upload the file to Firebase Storage
        await uploadBytes(storageRef, imagesFile);

        // Get the download URL of the uploaded file
        const downloadURL = await getDownloadURL(storageRef);

        // Now save the form data to Firestore
        await addDoc(collection(db, "tickets"), {
          title,
          shortDescription,
          description,
          images: downloadURL,
          price,
          propertyType,
          startDate: Timestamp.fromDate(startDate),
          endDate: Timestamp.fromDate(endDate),
          createdAt: Timestamp.now(),
          userId: user.uid,
          userEmail: user.email,
          userName: user.displayName,
          userPhoto: user.photoURL
        });

        statusDiv.textContent = "✅ Submitted successfully!";
        form.reset();
      } catch (error) {
        console.error("Error adding document:", error);
        statusDiv.textContent = "❌ Submission failed. Check console for details.";
      }
    });
  }
});

</script>


<!-- Firebase Auth Compatibility Mode Scripts -->
<script src="https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.2/firebase-auth-compat.js"></script>

<script>
  const firebaseConfig = {
    apiKey: "AIzaSyDv20sRkLIHN58xj8l0i3r7pwIW41n476g",
    authDomain: "travles-d6ec6.firebaseapp.com",
    projectId: "travles-d6ec6",
    storageBucket: "travles-d6ec6.firebasestorage.app",
    messagingSenderId: "96133501296",
    appId: "1:96133501296:web:d2fbf62a740fc27d997fb5",
    measurementId: "G-SZ7BPENFF7"
  };

  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
/// validate the login to access the route
if (window.location.pathname === "/sample-form") {
    firebase.auth().onAuthStateChanged(function(user) {
      if (!user) {
        // ❌ Not logged in, redirect to homepage
        window.location.href = "https://escape-jackpots-62e2d5.webflow.io";
      }
      // ✅ Logged in, stay here
    });
  }
</script>

<!-- Login Script -->
<script>
const loginButton = document.getElementById("login-google");

  if (loginButton) {
loginButton.addEventListener("click", function (e) {
    e.preventDefault(); // Stop default action

    const user = firebase.auth().currentUser;

    if (user) {
      // ✅ User already logged in
      window.location.href = "https://escape-jackpots-62e2d5.webflow.io/sample-form";
    } else {
      // ❌ Not logged in, open Google login
      login();
    }
  });

  function login() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
      .then(result => {
        const user = result.user;
        console.log("Logged in:", user);
window.location.href = "https://escape-jackpots-62e2d5.webflow.io/sample-form";
        // You can redirect or update UI here
      })
      .catch(error => {
        console.error("Login error:", error);
      });
  }
  }

const logoutButton = document.getElementById("logout_button");

  if (logoutButton) {
 logoutButton.addEventListener("click", function(e) {
    e.preventDefault();

    firebase.auth().signOut()
      .then(() => {
        console.log("User signed out successfully");
        // Redirect after logout
        window.location.href = "https://escape-jackpots-62e2d5.webflow.io";
      })
      .catch((error) => {
        console.error("Logout error:", error);
      });
  });
  }
</script>
