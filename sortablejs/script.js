import Sortable from "sortablejs";

document.addEventListener("DOMContentLoaded", function () {
    const list = document.getElementById("sortable-list");

    // Initialize SortableJS
    new Sortable(list, {
        animation: 200,
        ghostClass: "ghost", // Adds a faded style while dragging
        onEnd: saveOrder, // Save order after reordering
    });

    // Load saved order from localStorage
    loadOrder();

    // Add click event to delete buttons
    document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", deleteItem);
    });
});

// Function to add new item
function addItem() {
    const input = document.getElementById("new-item");
    const text = input.value.trim();
    if (text === "") return;

    const list = document.getElementById("sortable-list");
    const li = document.createElement("li");
    li.innerHTML = `${text} <span class="delete-btn">❌</span>`;
    li.querySelector(".delete-btn").addEventListener("click", deleteItem);
    list.appendChild(li);

    input.value = "";
    saveOrder();
}

// Function to delete an item
function deleteItem(event) {
    event.target.parentElement.remove();
    saveOrder();
}

// Function to save list order in localStorage
function saveOrder() {
    const list = document.getElementById("sortable-list");
    const items = [...list.children].map(li => li.innerText.replace("❌", "").trim());
    localStorage.setItem("sortableList", JSON.stringify(items));
}

// Function to load list order from localStorage
function loadOrder() {
    const list = document.getElementById("sortable-list");
    const savedItems = JSON.parse(localStorage.getItem("sortableList")) || ["Task 1", "Task 2", "Task 3"];
    
    list.innerHTML = ""; // Clear current list
    savedItems.forEach(text => {
        const li = document.createElement("li");
        li.innerHTML = `${text} <span class="delete-btn">❌</span>`;
        li.querySelector(".delete-btn").addEventListener("click", deleteItem);
        list.appendChild(li);
    });
}

// Function to reset the list
function resetList() {
    localStorage.removeItem("sortableList");
    loadOrder();
}
