const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const path = require('path');
const { request } = require('http');
const { response } = require('express');
const User = require('./Models/users');
const bcrypt=require("bcrypt");

const DB_HOST=cred.env.DB_HOST;
const DB_USER=cred.env.DB_USER;
const DB_PASSWORD=cred.env.DB_PASSWORD;
const DB_DATABASE=cred.env.DB_DATABASE;
const DB_PORT=cred.env.DB_PORT;


const db = mysql.createPool({
    connectionLimit: 100,
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    port: DB_PORT
 })

 const port=cred.env.PORT;
 app.listen(port, 
    ()=> console.log(`Server started on port ${port}...`));

db.getConnection( (err, connection)=>{
    if(err) throw(err);
    console.log("DB connected successful: "+ connection.threadID);
})


const app=express();

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended:true }));
app.use(express.static(path.join(__direname, 'static')));


app.get('/', function(request,response){
    response.sendFile(path.join(__dirname + 'login.html'));
});

app.post("/createUser", async (req, res) => {
    const usern=req.body.name;
    const hashedPassword = await bcrypt.hash(req.body.password,10);
    
    db.getConnection( async (err, connection) =>{
        if (err) throw (err);

        const sqlSearch = "SELECT * FROM accounts WHERE username = ?";
        const search_query = mysql.format(sql.Search, [usern]);

        const sqlInsert = "INSERT INTO accounts VALUES (0, ?, ?)";
        const insert_query = mysql.format(sqlInsert, [usern, hashedPassword]);

        await connection.query (search_query, async (err, result) =>{
            if(err) throw(err);
            console.log("-----> Search Results");
            console.log(result.length)

            if(result.length!=0){
                connection.release();
                console.log("-----> User Already Exists");
                res.sendStatus(409);
            }
            else{
                await connection.query (insert_query, (err, result)=> {
                    connection.release();
                    if (err) throw (err);
                    console.log ("-----> Created new User");
                    console.log(result.insertId);
                    res.sendStatus(201);
                })
            }
        })
    })

})

app.post('/auth', function(request, response){
    let username = request.body.username;
    let password = request.body.password;

    if(username && password){
        db.getConnection(async (err, connection) =>{
            if(error) throw error;
            connection.query("SELECT * FROM accounts WHERE username = ? AND password = ?", [username, password], function(error, results, fields){
                if(results.length>0){
                    request.session.loggedin = true;
                    request.session.username = username;
                    const userO=new User(results[0].id, results[0].username, results[0].password, results[0].email);
                    response.redirect('/home');
                }else{
                    response.send('Incorrect Username and/or Password');
                }
                response.end();
            })
        });
    }else{
        response.send('Please enter both a Username and Password');
        response.end();
    }
});

