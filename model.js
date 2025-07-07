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
});

mongoose.connect(
    "mongodb+srv://austin_rager:ISs1pWApPN9uAjfI@recipesharing.aezbg1q.mongodb.net/?retryWrites=true&w=majority&appName=recipesharing"
);

const Recipe = mongoose.model("Recipe", RecipeSchema);
const Account = mongoose.model("Account", AccountSchema);

module.exports = {Account, Recipe};