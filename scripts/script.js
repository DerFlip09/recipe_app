// Get references to form and input elements
let recipeForm = document.getElementById("addRecipe");
let recipeName = document.getElementById("recipeName");
let ingredients = document.getElementById("ingredientsList");
let steps = document.getElementById("preparationList");
let imageUrl = document.getElementById("imageUrl");
let displayArea = document.querySelector(".recipeList");

// Initialize an array to store the recipes
let recipes = [];

// Retrieve recipes from localStorage if available
if (localStorage.getItem("recipes")) {
    recipes = JSON.parse(localStorage.getItem("recipes"));
    recipes.forEach((recipe, index) => {
        displayRecipe(recipe, index);  // Display each recipe from localStorage
    });
}

/**
 * Clears the input fields after submitting a recipe.
 */
function cleanInputFields() {
    recipeName.value = "";
    ingredients.value = "";
    steps.value = "";
    imageUrl.value = "";
}

/**
 * Deletes a recipe from the list and updates localStorage.
 * 
 * @param {number} index - The index of the recipe to delete.
 */
function deleteRecipe(index) {
    // Remove the recipe from the array
    recipes.splice(index, 1);
    // Update the recipes in localStorage
    localStorage.setItem('recipes', JSON.stringify(recipes));
    // Re-render the recipe list
    displayArea.innerHTML = "";
    recipes.forEach((recipe, index) => {
        displayRecipe(recipe, index);
    });
}

/**
 * Displays a recipe on the page.
 * 
 * @param {object} recipe - The recipe object to display.
 * @param {number} index - The index of the recipe in the recipes array.
 */
function displayRecipe(recipe, index) {
    // Create a div to hold the recipe's content
    let recipeDiv = document.createElement("div");
    recipeDiv.classList.add("recipe");

    // Add recipe image
    let imageElement = document.createElement("img");
    imageElement.src = recipe.imageUrl;
    imageElement.alt = `${recipe.name} Image`;
    imageElement.style.maxWidth = "100%";
    recipeDiv.appendChild(imageElement);

    // Add recipe name
    let nameElement = document.createElement("h3");
    nameElement.innerText = recipe.name;
    recipeDiv.appendChild(nameElement);

    // Add ingredients list
    let ingredientsElement = document.createElement("p");
    ingredientsElement.innerHTML = `<strong>Ingredients:</strong> ${recipe.ingredients.split(', ').join(', ')}`;
    recipeDiv.appendChild(ingredientsElement);

    // Add preparation steps
    let stepsElement = document.createElement("p");
    stepsElement.innerHTML = `<strong>Steps:</strong> ${recipe.steps}`;
    recipeDiv.appendChild(stepsElement);

    // Add delete button to remove recipe
    let deleteButton = document.createElement('button');
    deleteButton.textContent = "Delete";
    deleteButton.onclick = function () {
        deleteRecipe(index);  // Call delete function on click
    };
    recipeDiv.appendChild(deleteButton);

    // Append the recipe to the display area
    displayArea.appendChild(recipeDiv);
}

// Listen for form submissions to add a new recipe
recipeForm.addEventListener('submit', function (event) {
    event.preventDefault();  // Prevent page reload

    // Get the values entered by the user
    let enteredRecipeName = recipeName.value;
    let enteredIngredients = ingredients.value;
    let enteredSteps = steps.value;
    let enteredImageUrl = imageUrl.value;

    // Create a new recipe object
    let newRecipe = {
        name: enteredRecipeName,
        ingredients: enteredIngredients,
        steps: enteredSteps,
        imageUrl: enteredImageUrl
    };

    // Add the new recipe to the array and update localStorage
    recipes.push(newRecipe);
    let index = recipes.length - 1;  // Get the index of the newly added recipe
    displayRecipe(newRecipe, index);  // Display the new recipe
    localStorage.setItem('recipes', JSON.stringify(recipes));  // Update localStorage
    cleanInputFields();  // Clear input fields
});
