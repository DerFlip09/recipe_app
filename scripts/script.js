// Get references to form and input elements
let recipeForm = document.getElementById("addRecipe");
let recipeName = document.getElementById("recipeName");
let ingredients = document.getElementById("ingredientsList");
let steps = document.getElementById("preparationList");
let imageUrl = document.getElementById("imageUrl");
let displayArea = document.querySelector(".recipeList");

let recipeIdForEdit = null;  // Will store the ID of the recipe being edited

/**
 * Fetches the list of recipes from the API.
 * 
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
    recipes.forEach((recipe, index) => displayRecipe(recipe, index));
}

/**
 * Clears the input fields after submitting or cancelling a recipe.
 */
function cleanInputFields() {
    recipeName.value = "";
    ingredients.value = "";
    steps.value = "";
    imageUrl.value = "";
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

    // Edit button to edit one recipe
    let editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.onclick = function () {
        populateEditForm(recipe);  // Call function to populate form
    };
    recipeDiv.appendChild(editButton);

    // Add delete button to remove recipe
    let deleteButton = document.createElement('button');
    deleteButton.textContent = "Delete";
    deleteButton.onclick = function () {
        handleDeleteRecipe(index, recipe.id);  // Call delete function on click
    };
    recipeDiv.appendChild(deleteButton);

    // Append the recipe to the display area
    displayArea.appendChild(recipeDiv);
}

/**
 * Sends a new recipe to the API via a POST request.
 * 
 * @param {object} recipe - The recipe object to send.
 * @returns {Promise<object>} The created recipe object returned by the API.
 */
async function postRecipeToAPI(recipe) {
    try {
        const response = await fetch("http://localhost:8000/recipes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(recipe)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return await response.json(); // Return the created recipe
    } catch (error) {
        console.error("Error posting recipe:", error);
        throw error; // Re-throw error for handling in the calling function
    }
}

/**
 * Handles the recipe submission form by either adding a new recipe or updating an existing one.
 * 
 * @param {Event} event - The submit event of the recipe form.
 */
async function addRecipe(event) {
    event.preventDefault();

    // Retrieve values entered in the form
    const enteredRecipeName = recipeName.value;
    const enteredIngredients = ingredients.value;
    const enteredSteps = steps.value;
    const enteredImageUrl = imageUrl.value;

    // Create a new or updated recipe object
    const updatedRecipe = {
        name: enteredRecipeName,
        ingredients: enteredIngredients,
        steps: enteredSteps,
        imageUrl: enteredImageUrl
    };

    try {
        if (recipeIdForEdit) {
            // Update an existing recipe if in edit mode
            await updateRecipeOnAPI(recipeIdForEdit, updatedRecipe);
        } else {
            // Add a new recipe to the backend
            await postRecipeToAPI(updatedRecipe);
        }

        // Clear the input fields and reset the editing state
        cleanInputFields();
        recipeIdForEdit = null;
    } catch (error) {
        console.error("Failed to add or update recipe:", error);
    }
}

/**
 * Sends a DELETE request to the API to remove a recipe.
 * 
 * @param {number} recipeId - The ID of the recipe to delete.
 */
async function deleteRecipeFromAPI(recipeId) {
    try {
        const response = await fetch(`http://localhost:8000/recipes/${recipeId}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Return the response data
        const result = await response.json();
        console.log(result.message); // Optionally log the success message
    } catch (error) {
        console.error("Error deleting recipe:", error);
    }
}

/**
 * Handles the click on the delete button to remove the recipe both from the UI and the API.
 * 
 * @param {number} index - The index of the recipe in the display area.
 * @param {number} recipeId - The ID of the recipe to delete.
 */
async function handleDeleteRecipe(index, recipeId) {
    try {
        // Send the delete request to the backend
        await deleteRecipeFromAPI(recipeId);

        // Remove the recipe from the display
        const recipeDivs = displayArea.querySelectorAll('.recipe');
        if (recipeDivs[index]) {
            recipeDivs[index].remove();
        }
    } catch (error) {
        console.error("Failed to delete recipe:", error);
    }
}

/**
 * Populates the form with the recipe data for editing.
 * 
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
 * 
 * @param {number} recipeId - The ID of the recipe to update.
 * @param {object} updatedRecipe - The updated recipe data.
 */
async function updateRecipeOnAPI(recipeId, updatedRecipe) {
    try {
        const response = await fetch(`http://localhost:8000/recipes/${recipeId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedRecipe)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const updatedRecipeResponse = await response.json();
        console.log("Updated recipe:", updatedRecipeResponse);

        // Update the recipe in the UI after successful API update
        updateRecipeInUI(recipeId, updatedRecipeResponse);
    } catch (error) {
        console.error("Error updating recipe:", error);
    }
}

/**
 * Updates the recipe display in the UI with the updated data.
 * 
 * @param {number} recipeId - The ID of the recipe to update.
 * @param {object} updatedRecipe - The updated recipe data.
 */
function updateRecipeInUI(recipeId, updatedRecipe) {
    const recipeDivs = displayArea.querySelectorAll('.recipe');
    const recipeDiv = Array.from(recipeDivs).find(div => {
        return div.querySelector('h3').innerText === updatedRecipe.name;
    });

    if (recipeDiv) {
        recipeDiv.querySelector('h3').innerText = updatedRecipe.name;
        recipeDiv.querySelector('p').innerHTML = `<strong>Ingredients:</strong> ${updatedRecipe.ingredients.split(', ').join(', ')}`;
        recipeDiv.querySelectorAll('p')[1].innerHTML = `<strong>Steps:</strong> ${updatedRecipe.steps}`;
        recipeDiv.querySelector('img').src = updatedRecipe.imageUrl;
    }
}

// Attach event listeners
recipeForm.addEventListener("submit", addRecipe);
window.addEventListener("load", init);
