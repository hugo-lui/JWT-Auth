require("dotenv").config();
const jwt = require("jsonwebtoken");
const pool = require("./db");
const express = require("express");
const app = express();

app.use(express.json());

app.listen(5001);

let refreshTokens = [];

function generateToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "5m"});
}

app.post("/token", (req, res) => {
    const refreshToken = req.body.token;
    if(refreshToken == null) {
        return res.sendStatus(401);
    }
    else if(!refreshTokens.includes(refreshToken)) {
        return res.sendStatus(403);
    }
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if(err) {
            return res.sendStatus(403);
        }
        const accessToken = generateToken({name: user.name});
        res.json({accessToken: accessToken});
    });
});

app.post("/login", (res, req) => {
    const username = req.body.username;
    const user = {name: username};
    const accessToken = generateToken(user);
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
    refreshTokens.push(refreshToken);
    res.json({accessToken: accessToken, refreshToken: refreshToken});
});

app.delete("/logout", (res, req) => {
    refreshTokens = refreshTokens.filter(token => token !== req.body.token);
    res.sendStatus(204);
});