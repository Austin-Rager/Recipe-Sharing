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

//post recipe


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});