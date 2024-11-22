// Get references to form and input elements
let recipeForm = document.getElementById("addRecipe");
let recipeName = document.getElementById("recipeName");
let ingredients = document.getElementById("ingredientsList");
let steps = document.getElementById("preparationList");
let imageUrl = document.getElementById("imageUrl");
let displayArea = document.querySelector(".recipeList");

let recipeIdForEdit = null; // Will store the ID of the recipe being edited

/**
 * Fetches the list of recipes from the API.
 * @returns {Promise<Array>} A promise that resolves to the list of recipes.
 */
async function fetchRecipes() {
    try {
        const response = await fetch("http://localhost:8000/recipes");
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Error fetching recipes:", error);
        return [];
    }
}

/**
 * Initializes the application by fetching and displaying recipes.
 */
async function init() {
    const recipes = await fetchRecipes();
    displayArea.innerHTML = ""; // Clear the existing content
    recipes.forEach((recipe) => displayRecipe(recipe));
}

/**
 * Clears the input fields after submitting or cancelling a recipe.
 */
function cleanInputFields() {
    recipeName.value = "";
    ingredients.value = "";
    steps.value = "";
    imageUrl.value = "";
    recipeIdForEdit = null; // Reset editing state
}

/**
 * Displays a recipe on the page.
 * @param {object} recipe - The recipe object to display.
 */
function displayRecipe(recipe) {
    const recipeDiv = createRecipeCard(recipe);
    displayArea.appendChild(recipeDiv);
}

/**
 * Creates a recipe card for the UI.
 * @param {object} recipe - The recipe object.
 * @returns {HTMLElement} The recipe card element.
 */
function createRecipeCard(recipe) {
    // Create a div to hold the recipe's content
    const recipeDiv = document.createElement("div");
    recipeDiv.classList.add("recipe");
    recipeDiv.dataset.id = recipe.id; // Set data attribute for easy identification

    // Add recipe image
    const imageElement = document.createElement("img");
    imageElement.src = recipe.imageUrl;
    imageElement.alt = `${recipe.name} Image`;
    recipeDiv.appendChild(imageElement);

    // Add recipe name
    const nameElement = document.createElement("h3");
    nameElement.innerText = recipe.name;
    recipeDiv.appendChild(nameElement);

    // Add ingredients list
    const ingredientsElement = document.createElement("p");
    ingredientsElement.innerHTML = `<strong>Ingredients:</strong> ${recipe.ingredients.split(', ').join(', ')}`;
    recipeDiv.appendChild(ingredientsElement);

    // Add preparation steps
    const stepsElement = document.createElement("p");
    stepsElement.innerHTML = `<strong>Steps:</strong> ${recipe.steps}`;
    recipeDiv.appendChild(stepsElement);

    // Edit button
    const editButton = document.createElement("button");
    editButton.type = "button"; // Prevent form submission
    editButton.textContent = "Edit";
    editButton.onclick = () => populateEditForm(recipe);
    recipeDiv.appendChild(editButton);

    // Delete button
    const deleteButton = document.createElement("button");
    deleteButton.type = "button"; // Prevent form submission
    deleteButton.textContent = "Delete";
    deleteButton.onclick = (event) => {
        event.preventDefault(); // Ensure no reload happens
        handleDeleteRecipe(recipe.id);
    };
    recipeDiv.appendChild(deleteButton);

    return recipeDiv;
}

/**
 * Sends a new recipe to the API via a POST request.
 * @param {object} recipe - The recipe object to send.
 * @returns {Promise<object>} The created recipe object returned by the API.
 */
async function postRecipeToAPI(recipe) {
    try {
        const response = await fetch("http://localhost:8000/recipes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(recipe),
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Error posting recipe:", error);
        throw error;
    }
}

/**
 * Handles the recipe submission form by either adding a new recipe or updating an existing one.
 * @param {Event} event - The submit event of the recipe form.
 */
async function addRecipe(event) {
    event.preventDefault(); // Prevent form submission and page reload

    const updatedRecipe = {
        name: recipeName.value,
        ingredients: ingredients.value,
        steps: steps.value,
        imageUrl: imageUrl.value,
    };

    try {
        if (recipeIdForEdit) {
            // Update existing recipe
            const updatedRecipeResponse = await updateRecipeOnAPI(recipeIdForEdit, updatedRecipe);
            updateRecipeInUI(updatedRecipeResponse);
        } else {
            // Add a new recipe
            const newRecipe = await postRecipeToAPI(updatedRecipe);
            displayRecipe(newRecipe);
        }

        cleanInputFields();
    } catch (error) {
        console.error("Failed to add or update recipe:", error);
    }
}

/**
 * Handles deleting a recipe without reloading the page.
 * @param {number} recipeId - The ID of the recipe to delete.
 */
async function handleDeleteRecipe(recipeId) {
    try {
        await fetch(`http://localhost:8000/recipes/${recipeId}`, { method: "DELETE" });
        removeRecipeFromUI(recipeId);
    } catch (error) {
        console.error("Failed to delete recipe:", error);
    }
}

/**
 * Removes a recipe from the UI.
 * @param {number} recipeId - The ID of the recipe to remove.
 */
function removeRecipeFromUI(recipeId) {
    const recipeDiv = displayArea.querySelector(`.recipe[data-id='${recipeId}']`);
    if (recipeDiv) {
        recipeDiv.remove();
    }
}

/**
 * Populates the form with the recipe data for editing.
 * @param {object} recipe - The recipe to edit.
 */
function populateEditForm(recipe) {
    recipeName.value = recipe.name;
    ingredients.value = recipe.ingredients;
    steps.value = recipe.steps;
    imageUrl.value = recipe.imageUrl;

    recipeIdForEdit = recipe.id; // Set the ID of the recipe being edited
}

/**
 * Sends a PUT request to the API to update an existing recipe.
 * @param {number} recipeId - The ID of the recipe to update.
 * @param {object} updatedRecipe - The updated recipe data.
 * @returns {Promise<object>} The updated recipe returned by the API.
 */
async function updateRecipeOnAPI(recipeId, updatedRecipe) {
    const response = await fetch(`http://localhost:8000/recipes/${recipeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedRecipe),
    });

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    return await response.json();
}

/**
 * Updates a recipe in the UI.
 * @param {object} updatedRecipe - The updated recipe data.
 */
function updateRecipeInUI(updatedRecipe) {
    const recipeDiv = displayArea.querySelector(`.recipe[data-id='${updatedRecipe.id}']`);
    if (recipeDiv) {
        recipeDiv.querySelector("h3").innerText = updatedRecipe.name;
        recipeDiv.querySelector("p").innerHTML = `<strong>Ingredients:</strong> ${updatedRecipe.ingredients.split(', ').join(', ')}`;
        recipeDiv.querySelectorAll("p")[1].innerHTML = `<strong>Steps:</strong> ${updatedRecipe.steps}`;
        recipeDiv.querySelector("img").src = updatedRecipe.imageUrl;
    }
}

// Attach event listeners
recipeForm.addEventListener("submit", addRecipe);
window.addEventListener("load", init);
