// Function to change the quantity and ensure it doesn't go below 1
function changeQuantity(button, increment) {
    const quantityElement = button.parentNode.querySelector('.quantity');
    let currentQuantity = parseInt(quantityElement.textContent);

    // Update the quantity value with the increment/decrement
    currentQuantity += increment;

    // Ensure the quantity doesn't go below 1
    if (currentQuantity < 1) {
        currentQuantity = 1;
    }

    // Update the displayed quantity
    quantityElement.textContent = currentQuantity;

    // Optionally, you can update the total price here based on quantity change
    const itemTotalElement = button.parentNode.parentNode.querySelector('.item-total');
    const itemPriceElement = button.parentNode.parentNode.querySelector('.item-price');
    const price = parseFloat(itemPriceElement.textContent.replace('$', ''));

    // Update the total price based on the new quantity
    itemTotalElement.textContent = `$${(currentQuantity * price).toFixed(2)}`;
}

// Handle the edit, save, and cancel actions for product details
document.getElementById('editProductBtn').addEventListener('click', function() {
    // Convert the title, description, and price to editable input fields with custom styles
    document.getElementById('productTitle').innerHTML = `<input type="text" id="editTitleInput" class="edit-input" value="${document.getElementById('productTitle').innerText}">`;
    document.getElementById('productDescription').innerHTML = `<textarea id="editDescriptionInput" class="edit-input">${document.getElementById('productDescription').innerText}</textarea>`;
    document.getElementById('productPrice').innerHTML = `<input type="number" id="editPriceInput" class="edit-input" value="${parseFloat(document.getElementById('productPrice').innerText.replace('$', ''))}">`;

    // Show the save and cancel buttons, hide the edit button
    document.getElementById('editProductBtn').style.display = 'none';
    document.getElementById('saveProductBtn').style.display = 'inline-block';
    document.getElementById('cancelEditBtn').style.display = 'inline-block';
});

document.getElementById('saveProductBtn').addEventListener('click', function() {
    // Save the new values from the input fields
    const newTitle = document.getElementById('editTitleInput').value;
    const newDescription = document.getElementById('editDescriptionInput').value;
    const newPrice = document.getElementById('editPriceInput').value;

    // Update the displayed product details with the new values
    document.getElementById('productTitle').innerText = newTitle;
    document.getElementById('productDescription').innerText = newDescription;
    document.getElementById('productPrice').innerText = `$${parseFloat(newPrice).toFixed(2)}`;

    // Switch back to normal mode by showing the edit button again
    document.getElementById('editProductBtn').style.display = 'inline-block';
    document.getElementById('saveProductBtn').style.display = 'none';
    document.getElementById('cancelEditBtn').style.display = 'none';
});

document.getElementById('cancelEditBtn').addEventListener('click', function() {
    // Reload the page to discard changes and return to the original product details
    location.reload();
});

// Get and display descriptions for Home and About 
document.addEventListener("DOMContentLoaded", () => {
    fetch("/api/descriptions")
        .then((response) => response.json())
        .then((data) => {
            const homeDesc = data.find((desc) => desc.section === "Home");
            const aboutDesc = data.find((desc) => desc.section === "About");

            if (homeDesc) {
                document.getElementById("home-description").textContent = homeDesc.description; // Use quotes for ID
            }

            if (aboutDesc) {
                document.getElementById("about-description").textContent = aboutDesc.description; // Fix `about.description`
            }
        })
        .catch((error) => console.error("Error getting descriptions:", error));
});
