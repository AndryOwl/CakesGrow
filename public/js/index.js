document.addEventListener('DOMContentLoaded', () => {
  const viewIngredientsButton = document.getElementById('view-ingredients-button');
  const ingredientsContainer = document.getElementById('ingredients-container');
  const dishSelect = document.getElementById('dish-select');

  viewIngredientsButton.addEventListener('click', async () => {
    const selectedDishId = dishSelect.value;
    try {
      const response = await axios.get(`/ingredients/${selectedDishId}`);
      const ingredients = response.data;
      const ingredientsList = ingredients.map(ingredient => `${ingredient.name}: ${ingredient.amount}`);
      ingredientsContainer.innerHTML = ingredientsList.join('<br>');
    } catch (error) {
      console.error('Error fetching ingredients:', error);
    }
  });
});

