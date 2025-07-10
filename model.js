const mongoose = require("mongoose");

const AccountSchema = new mongoose.Schema({
    name:{
        type: String, 
        required: [true, "User must have a Name"],
    },
    username:{
        type: String,
        required: [true, "User must have a username"],
        unique: true  
    },
    email:{
        type: String,
        required:[true , "User needs an Email"],
        unique: true  
    },
    password:{
        type:String,
        required:[true, "User needs a password"],
    },
    likedRecipes: [{
        recipeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Recipe'
        },
        likedAt: {
            type: Date,
            default: Date.now
        }
    }]
});

const RecipeSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true, "Recipe needs a name"],
    },
    description:{
        type:String,
        required: false,
    },
    ingredients: [{
        name: {
            type: String,
            required: [true, "Ingredient name is required"]
        },
        quantity: {
            type: Number,
            required: [true, "Quantity is required"]
        },
        unit: {
            type: String,
            required: [true, "Unit is required"],
            enum: ['cup', 'tbsp', 'tsp', 'oz', 'lb', 'g', 'kg', 'ml', 'l', 'piece', 'clove', 'bunch']
        },
        notes: {
            type: String,
            required: false
        }
    }],
    rating:{
        type: Number,
        required:false,
    },
    time:{
        type: String,
        required: false,
    },
    difficulty:{
        type:Number,
        required:false,
    },
    creator:{
        type: String,
        required:true
    },
    instructions:[{
            Steps:{
                type:String,
                required:true,
            },
        }],
    images: [{
        url: {
            type: String,
            required: true
        },
        key: {
            type: String,
            required: true
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    likes:{
        type: Number,
        required:false,
        default: 0,
    }
});

mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));


const Recipe = mongoose.model("Recipe", RecipeSchema);
const Account = mongoose.model("Account", AccountSchema);

module.exports = {Account, Recipe};