require("dotenv").config();
const jwt = require("jsonwebtoken");
const express = require("express");
const app = express();

app.use(express.json());

const posts = [
    {
        username: "Yes",
        title: "Post 1"
    },
    {
        username: "No",
        title: "Post 2"
    }
];

app.listen(5000);

function authenticateToken(req, res, next) {
    const header = req.headers["authorization"];
    const token = header && header.split(" ")[1];
    if(token == null) {
        res.sendStatus(401);
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if(err) {
            res.sendStatus(403);
        }
        req.user = user;
        next();
    });
};

app.get("/posts", authenticateToken, (req, res) => {
    res.json(posts.filter(post => post.username == req.user.name));
});

app.post("/login", (res, req) => {
    const username = req.body.username;
    const user = {name: username};
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
    res.json({accessToken: accessToken});
});