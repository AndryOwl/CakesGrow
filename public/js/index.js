const dishSelect = document.getElementById('dish-select');
const viewIngredientsButton = document.getElementById('view-ingredients-button');
const ingredientsContainer = document.getElementById('ingredients-container');
const response = await axios.get(`/ingredients/${selectedDishId}`);


// Event listener for "View Ingredients" button
viewIngredientsButton.addEventListener('click', async () => {
  const selectedDishId = dishSelect.value; // Get the selected dish's ID
  try {
    const response = await axios.get(`/ingredients/${selectedDishId}`); // Send a GET request
    ingredientsContainer.innerHTML = renderIngredients(response.data);
  } catch (error) {
    console.error('Error fetching ingredients:', error);
  }
});

// Function to render ingredients
function renderIngredients(ingredients) {
  let html = '<table border="1">';
  html += '<tr><th>Name</th><th>Amount</th><th>Unit</th><th>Price</th></tr>';
  ingredients.forEach(ingredient => {
    html += `<tr><td>${ingredient.name}</td><td>${ingredient.amount}</td><td>${ingredient.unit}</td><td>${ingredient.price}</td></tr>`;
  });
  html += '</table>';
  return html;
}

document.getElementById('update-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  const productSelect = document.getElementById('update-product');
  const newPriceInput = document.getElementById('new-price');
  const newAmountInput = document.getElementById('new-amount');
  const updateMessage = document.getElementById('update-message');

  const productName = productSelect.value;
  const newPrice = parseFloat(newPriceInput.value);
  const newAmount = parseFloat(newAmountInput.value);

  try {
    const response = await axios.post('/update-product', {
      productName: productName,
      newPrice: newPrice,
      newAmount: newAmount,
    });

    updateMessage.innerHTML = 'Product details updated successfully!';
  } catch (error) {
    updateMessage.innerHTML = 'Error updating product details.';
    console.error('Error updating product:', error);
  }
});


