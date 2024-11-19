let recipeForm = document.getElementById("addRecipe");
let recipeName = document.getElementById("recipeName");
let ingredients = document.getElementById("ingredientsList");
let steps = document.getElementById("preparationList");
let imageUrl = document.getElementById("imageUrl");
let displayArea = document.querySelector(".recipeList");

let recipes = [];
if (localStorage.getItem("recipes")) {
    recipes = JSON.parse(localStorage.getItem("recipes"))
    recipes.forEach((recipe, index) => {
        displayRecipe(recipe, index);
    });
};

function cleanInputFields() {
    recipeName.value = "";
    ingredients.value = "";
    steps.value = "";
    imageUrl.value = "";
};

function deleteRecipe(index) {
    recipes.splice(index, 1);
    localStorage.setItem('recipes', JSON.stringify(recipes));
    displayArea.innerHTML = "";
    recipes.forEach((recipe, index) => {
        displayRecipe(recipe, index);
    });
};

function displayRecipe(recipe, index) {
    let recipeDiv = document.createElement("div");
    recipeDiv.classList.add("recipe")
    // add image 
    let imageElement = document.createElement("img");
    imageElement.src = recipe.imageUrl;
    imageElement.alt = `${recipe.name} Image`;
    imageElement.style.maxWidth = "100%";
    recipeDiv.appendChild(imageElement);
    // add name
    let nameElement = document.createElement("h3");
    nameElement.innerText = recipe.name;
    recipeDiv.appendChild(nameElement);
    // add ingredients
    let ingredientsElement = document.createElement("p");
    ingredientsElement.innerHTML = `<strong>Ingredients:</strong> ${recipe.ingredients.split(', ').join(', ')}`;
    recipeDiv.appendChild(ingredientsElement);
    // add prep steps
    let stepsElement = document.createElement("p");
    stepsElement.innerHTML = `<strong>Steps:</strong> ${recipe.steps}`;
    recipeDiv.appendChild(stepsElement);

    let deleteButton = document.createElement('button');
    deleteButton.textContent = "Delete";

    // add an event handler, as an inline function
    deleteButton.onclick = function () {
        deleteRecipe(index);
    };
    recipeDiv.appendChild(deleteButton);
    // add to the display area
    displayArea.appendChild(recipeDiv);
};

recipeForm.addEventListener('submit', function (event) {
    event.preventDefault();
    let enteredRecipeName = recipeName.value;
    let enteredIngredients = ingredients.value;
    let enteredSteps = steps.value;
    let enteredImageUrl = imageUrl.value;

    let newRecipe = {
        name: enteredRecipeName,
        ingredients: enteredIngredients,
        steps: enteredSteps,
        imageUrl: enteredImageUrl
    };

    recipes.push(newRecipe);
    let index = recipes.length - 1;
    displayRecipe(newRecipe, index);
    localStorage.setItem('recipes', JSON.stringify(recipes));
    cleanInputFields();
    // We'll be adding more functionality here in the next steps.
});