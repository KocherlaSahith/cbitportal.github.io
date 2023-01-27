const express = require('express');
const path = require('path');
const ejsMate = require('ejs-mate');
const { ObjectId } = require("mongodb")
const methodOverride = require('method-override');
var alert = require('alert');

require('dotenv').config()
 
 
const db = require('./db');
const { appendFile } = require('fs');
const { name } = require('ejs');
db.initDb((err, db) => {
    if (err) {
        console.log(err)
    } else {
        console.log("connected")
        const port = process.env.PORT || 3001
        app.listen(port)
    }
})
const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))


app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.get('/', async (req, res) => {
    res.render("home")
})
app.get('/login', async (req, res) => {
    res.render("login")
})
app.get('/home', async (req, res) => {
    res.render("home")
})
app.post('/signup',async(req,res)=>
{
    const lst = req.body
    const database = db.getDb().db("clg_data");
    await database.collection("users").insert(req.body);

    res.render('login')
})
app.post('/stu_submit',async(req,res)=>
{
    const lst = req.body
    const database = db.getDb().db("clg_data");
    await database.collection("messages").insert(req.body);
    alert("Problem posted succesfully!")
    res.render("prompt")
})
app.get('/signup', async (req, res) => {
    res.render("signup")
})
app.get('/logout',async(req,res)=>{
    res.render('home')
})
app.get('/Messages/:s_name',async(req,res)=>{
    const {s_name}=req.params
    const database = db.getDb().db("clg_data")
    const lst=await database.collection("responses").find({s_name:s_name}).toArray()
    if(lst.length!=0)
    res.render('student_messages',{lst})
    else
    res.render('prompt')
})
app.post('/home',async(req,res)=>{
    const lst = req.body
     console.log(lst)
    const database = db.getDb().db("clg_data")
    const lst1 = await database.collection("users").find({ name: req.body.name, password: req.body.password }).toArray()
    //console.log(lst2)
    if(lst1.length!=0 && lst1[0].type=="student"){
        const lst2=await database.collection("users").find({type:"mentor",branch:lst1[0].branch}).toArray()
        res.render("student_home",{lst1,lst2})
    }
    else if(lst1.length!=0 && lst1[0].type=="mentor"){
        const database = db.getDb().db("clg_data")
        const lst3=await database.collection("messages").find({m_name:lst1[0].name}).toArray()
        console.log(lst3)
        const higher=await database.collection("users").find({type:"HOD",branch:lst1[0].branch}).toArray()
        console.log(higher.length)
        console.log(higher)
        if(lst3.length!=0){
        res.render("admin_home",{lst3,higher})
        }
        else{
            res.render('prompt')
        }
    }
    else if (lst1.length!=0 && lst1[0].type=="HOD"){
        const lst4=await database.collection("elevated").find({hod_name:lst1[0].name}).toArray()
        res.render('hod_home',{lst1,lst4})
    }
    else if (lst1.length!=0 && lst1[0].type=="admin"){
        const lst5=await database.collection("eventdb").find({}).toArray()
        res.render('ea_login',{lst5})
    }
    else{
        //res.send("Wrong credentials")
        alert("Either Username or password are wrong")
        res.render('login')
    }
})
app.get('/solved/:s_name/:m_name', async (req, res) => {
   
    const {s_name}= req.params
    const {m_name}=req.params
    const database = db.getDb().db("clg_data")
    console.log(req.body)
    await database.collection("messages").deleteOne({s_name:s_name});
    const lst3=await database.collection("messages").find({m_name:m_name}).toArray()
    if(lst3.length!=0){
     res.render('admin_home',{lst3})
    }
    else{
       res.render('prompt')
    }
})
app.get('/esculate/:s_name/:m_name/:hod_name/:message',async(req,res)=>{
    const {s_name}=req.params
    const {m_name}=req.params
    const {hod_name}=req.params
    const {message}=req.params
    const database = db.getDb().db("clg_data")
    await database.collection("elevated").insert({s_name:s_name,m_name:m_name,hod_name:hod_name,message:message});
    await database.collection("messages").deleteOne({s_name:s_name});
    await database.collection('responses').insert({s_name:s_name,m_name:m_name,response:'Issue esculated to HOD!'})
    alert("Esculated succesfully!")
    res.render('prompt')
})
app.post('/send_message/:s_name/:m_name',async(req,res)=>{
    const {s_name}=req.params
    const {m_name}=req.params
    console.log(s_name,m_name)
    console.log(req.body)
    const database = db.getDb().db("clg_data")
    await database.collection("responses").insert({s_name:s_name,m_name:m_name,response:req.body.response})
    alert("Message sent succesfully")
    res.render('prompt')
})
app.get('/delete_message/:idd/:s_name',async(req,res)=>{
    const {idd}=req.params
    const database=db.getDb().db('clg_data')
    await database.collection('responses').deleteOne({_id:ObjectId(idd)})
    const {s_name}=req.params
    const lst=await database.collection("responses").find({s_name:s_name}).toArray()
    if(lst.length!=0)
    res.render('student_messages',{lst})
    else
    res.render('prompt')
})
app.get('/my_issues/:s_name',async(req,res)=>{
    const {s_name}=req.params
    const database = db.getDb().db("clg_data")
    const lst=await database.collection("messages").find({s_name:s_name}).toArray()
    if(lst.length!=0)
    res.render('student_issues',{lst})
    else
    res.render('prompt')
})
app.get('/unsend_message/:idd/:s_name',async(req,res)=>{
    const {idd}=req.params
    const database=db.getDb().db('clg_data')
    await database.collection('messages').deleteOne({_id:ObjectId(idd)})
    const {s_name}=req.params
    const lst=await database.collection("messages").find({s_name:s_name}).toArray()
    if(lst.length!=0)
    res.render('student_issues',{lst})
    else
    res.render('prompt')
})
app.get('/events',async(req,res)=>{
    const database=db.getDb().db('clg_data')
    const lst=await database.collection("eventdb").find({}).toArray()
    res.render('events_home',{lst})
})
app.get('/add_event',async(req,res)=>{
    res.render('add_new_event')
})
app.post('/adding_new',async(req,res)=>
{
    const lst = req.body
    const database = db.getDb().db("clg_data");
    await database.collection("eventdb").insert(req.body);
    alert("Event added succesfully!")
})