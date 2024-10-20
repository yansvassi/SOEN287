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
