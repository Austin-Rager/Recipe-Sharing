require('dotenv').config({ debug: false });

const express = require("express");
const cors = require("cors");
const session = require("express-session");
const bcrypt = require('bcrypt'); 

const {Account, Recipe} = require("./model.js");

const app = express();
app.use(cors());
app.use(express.json());

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            httpOnly: true
        }
    })
);
//registration users
app.post("/register", async (req,res) =>{
    const data = req.body;
    
    if (data.username === undefined || data.password === undefined){
        res.status(400).send("Must include username and password to register");
        return;
    }
    
    if (req.session.session_username !== undefined){
        res.status(403).send("A user is currently logged in");
        return;
    }

    try {
        const existingUser = await Account.findOne({username: data.username});
        if (existingUser) {
            res.status(403).send("Username already exists");
            return;
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);

        const newUser = await Account.create({
            name: data.name,
            username: data.username,
            email: data.email,
            password: hashedPassword, 
        });

        console.log("New user created:", newUser.username);
        res.status(201).send("Registration successful");
        
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).send("Registration failed");
    }
});

//login user
app.post("/login", async(req,res) =>{
    const data = req.body;
    
    if (!data.username || !data.password) {
        res.status(400).json({ error: "Username and password are required" });
        return;
    }

    try {
        const result = await Account.findOne({username: data.username});
        if (result) {
            const isValidPassword = await bcrypt.compare(data.password, result.password);
            if (isValidPassword) {
                req.session.session_username = data.username;
                res.status(200).json({username: data.username});
                return;
            }
        }
        res.status(403).json({ error: "Invalid username or password"});
        
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Login failed" });
    }
});

//logout
app.get("/logout", (req, res) =>{
    if(req.session.session_username !== undefined){
        req.session.session_username = undefined;
        res.status(200).send("Succesfull logout")
        return;
    }
    res.status(403).send("User is not logged in");
});

//post recipe
app.post("/recipe", async (req, res) => {
    const data = req.body;
    
    if (!req.session.session_username) {
        return res.status(401).json({ error: "Must be logged in to create a recipe" });
    }
    
    if (!data.name || !data.name.trim()) {
        return res.status(400).json({ error: "Recipe name is required" });
    }
    
    if (!data.ingredients || data.ingredients.length === 0) {
        return res.status(400).json({ error: "Recipe must have at least one ingredient" });
    }

    if (!data.instructions || data.instructions.length === 0) {
        return res.status(400).json({ error: "Recipe must have at least one instruction step" });
    }

    try {
        const newRecipe = await Recipe.create({
            name: data.name,
            description: data.description || "",
            ingredients: data.ingredients,
            instructions: data.instructions,
            rating: data.rating,
            time: data.time,
            difficulty: data.difficulty,
            creator: req.session.session_username, 
        });

        console.log("New recipe created by:", req.session.session_username);
        res.status(201).json({
            message: "Recipe created successfully",
            recipe: newRecipe
        });
        
    } catch (error) {
        console.error("Recipe creation error:", error);

        if (error.name === 'ValidationError') {
            res.status(400).json({ error: error.message });
        } else {
            res.status(500).json({ error: "Failed to create recipe" });
        }
    }
});

// Like a recipe
app.post("/recipe/:id/like", async (req, res) => {
    if (!req.session.session_username) {
        return res.status(401).json({ error: "Must be logged in" });
    }

    try {
        const recipeId = req.params.id;
        const username = req.session.session_username;

        const user = await Account.findOne({ username });
        const recipe = await Recipe.findById(recipeId);

        if (!recipe) {
            return res.status(404).json({ error: "Recipe not found" });
        }

        const alreadyLiked = user.likedRecipes.some(
            like => like.recipeId.toString() === recipeId
        );

        if (alreadyLiked) {
            return res.status(400).json({ error: "Already liked this recipe" });
        }

        user.likedRecipes.push({ recipeId });
        await user.save();

        recipe.likes = (recipe.likes || 0) + 1;
        await recipe.save();

        res.json({ 
            message: "Recipe liked", 
            likes: recipe.likes 
        });

    } catch (error) {
        console.error("Like error:", error);
        res.status(500).json({ error: "Failed to like recipe" });
    }
});

// Unlike a recipe
app.delete("/recipe/:id/like", async (req, res) => {
    if (!req.session.session_username) {
        return res.status(401).json({ error: "Must be logged in" });
    }

    try {
        const recipeId = req.params.id;
        const username = req.session.session_username;

        const user = await Account.findOne({ username });
        const recipe = await Recipe.findById(recipeId);

        user.likedRecipes = user.likedRecipes.filter(
            like => like.recipeId.toString() !== recipeId
        );
        await user.save();

        recipe.likes = Math.max((recipe.likes || 0) - 1, 0);
        await recipe.save();

        res.json({ 
            message: "Recipe unliked", 
            likes: recipe.likes 
        });

    } catch (error) {
        console.error("Unlike error:", error);
        res.status(500).json({ error: "Failed to unlike recipe" });
    }
});

// Get user's liked recipes
app.get("/user/liked-recipes", async (req, res) => {
    if (!req.session.session_username) {
        return res.status(401).json({ error: "Must be logged in" });
    }

    try {
        const user = await Account.findOne({ 
            username: req.session.session_username 
        }).populate('likedRecipes.recipeId');

        const likedRecipes = user.likedRecipes.map(like => like.recipeId);

        res.json({ likedRecipes });

    } catch (error) {
        console.error("Get liked recipes error:", error);
        res.status(500).json({ error: "Failed to get liked recipes" });
    }
});

// Update a recipe if user is the owner
app.put("/recipe/:id", async (req, res) => {
    if (!req.session.session_username) {
        return res.status(401).json({ error: "Must be logged in to update recipe" });
    }

    try {
        const recipeId = req.params.id;
        const username = req.session.session_username;
        const updateData = req.body;

        const recipe = await Recipe.findById(recipeId);
        
        if (!recipe) {
            return res.status(404).json({ error: "Recipe not found" });
        }

        if (recipe.creator !== username) {
            return res.status(403).json({ error: "You can only update your own recipes" });
        }

        if (updateData.name && !updateData.name.trim()) {
            return res.status(400).json({ error: "Recipe name cannot be empty" });
        }

        if (updateData.ingredients && updateData.ingredients.length === 0) {
            return res.status(400).json({ error: "Recipe must have at least one ingredient" });
        }

        if (updateData.instructions && updateData.instructions.length === 0) {
            return res.status(400).json({ error: "Recipe must have at least one instruction" });
        }

        const updatedRecipe = await Recipe.findByIdAndUpdate(
            recipeId,
            {
                ...(updateData.name && { name: updateData.name }),
                ...(updateData.description !== undefined && { description: updateData.description }),
                ...(updateData.ingredients && { ingredients: updateData.ingredients }),
                ...(updateData.instructions && { instructions: updateData.instructions }),
                ...(updateData.rating !== undefined && { rating: updateData.rating }),
                ...(updateData.time !== undefined && { time: updateData.time }),
                ...(updateData.difficulty !== undefined && { difficulty: updateData.difficulty })
            },
            { 
                new: true,
                runValidators: true 
            }
        );

        console.log("Recipe updated by:", username);
        res.status(200).json({
            message: "Recipe updated successfully",
            recipe: updatedRecipe
        });

    } catch (error) {
        console.error("Recipe update error:", error);
        
        if (error.name === 'ValidationError') {
            res.status(400).json({ error: error.message });
        } else if (error.name === 'CastError') {
            res.status(400).json({ error: "Invalid recipe ID" });
        } else {
            res.status(500).json({ error: "Failed to update recipe" });
        }
    }
});

// Get recipes created by the logged-in user
app.get("/users-recipes", async (req, res) => {
    if (!req.session.session_username) {
        return res.status(401).json({ error: "Must be logged in" });
    }

    try {
        const recipes = await Recipe.find({ 
            creator: req.session.session_username 
        }).sort({ createdAt: -1 }); 

        res.status(200).json({
            message: "Your recipes retrieved successfully",
            count: recipes.length,
            recipes: recipes
        });

    } catch (error) {
        console.error("Get my recipes error:", error);
        res.status(500).json({ error: "Failed to retrieve your recipes" });
    }
});

// Get all recipes
app.get("/recipes", async (req, res) => {
    try {
        const recipes = await Recipe.find({})

        res.status(200).json({
            message: "Recipes retrieved successfully",
            count: recipes.length,
            recipes: recipes
        });

    } catch (error) {
        console.error("Get recipes error:", error);
        res.status(500).json({ error: "Failed to retrieve recipes" });
    }
});


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});