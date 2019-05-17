const express = require('express');
const passport = require('passport')
const router = express.Router();
const User = require('../models/user');
const Book = require('../models/product');
const Event = require('../models/events');
const { isAuthenticated } = require('../helpers/auth');

const cloudinary = require('cloudinary');

cloudinary.config({
    cloud_name: 'degtjs2lg',
    api_key: '451512832657149',
    api_secret: 'gWG7gFbXGdjc9RbmoQZrTq9Yv38',

});

router.get('/', async (req, res) => {
    const books = await Book.find().sort({'_id':-1}).limit(3);
    res.render('index', {books});
});

router.get('/eventos', async (req, res) => {
    const events = await Event.find();
    res.render('events', { events });
});

router.get('/registrarse', (req, res) => {
    res.render('signup');
});

router.post('/registrarse', async (req, res) => {
    let errors = [];
    const { username, name, surname, email, password, cpassword } = req.body;

    if(password != cpassword) {
        console.log("Passwords do not match");
        errors.push({text: 'Passwords do not match.'});
    }

    if(password.length < 4){
        console.log("Pasword length is too short");
        errors.push({text: 'Pasword length is too short'});
    }

    const emailUser = await User.findOne({email: email});

    if(emailUser) {
        console.log("This email is on use");
        errors.push({text: 'This email is on use'});
    }

    const userName = await User.findOne({username: username});

    if(userName){
        console.log("This username is on use");
        errors.push({text: 'This username is on use'});
    }

    if(errors.length == 0){
        const newUser = new User({username, name, surname, email, password});
        newUser.password = await newUser.encryptPassword(password);
        await newUser.save();
        res.redirect('/login');
    }

    else{
        res.render('signup', {errors});
    }

});

router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
}));

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

router.get('/admin_eventos', (req, res) => {
    res.render('admin_event');
});

router.post('/admin_eventos', async (req, res) =>{
    let errors = [];
    const {event, type, date} = req.body;

    if(!event){
        console.log("Please insert event name")
        errors.push({text: 'Please insert event name'})
    }

    if(!type){
        console.log("Please insert event type")
        errors.push({text: 'Please insert event type'})
    }

    if(!date){
        console.log("Please insert event date")
        errors.push({text: 'Please insert event date'})
    }

    if(errors.length == 0){
        const newEvent = new Event({event, type, date});
        await newEvent.save();
        res.redirect('/');
    }

    else{
        res.render('admin_event', {errors, event, type, date});
    }
});

router.post('/eventos/borrar/:id', isAuthenticated, async (req, res) => {
    await Event.findByIdAndDelete(req.params.id);
    res.redirect('/eventos');
});

router.get('/admin_libro', async (req, res) =>{
    const books = await Book.find();
    res.render('admin_book', {books});
});

router.post('/admin_libro', isAuthenticated, async (req, res) =>{
    let errors = [];
    const {tittle, category, author, price} = req.body;
    const result = await cloudinary.v2.uploader.upload(req.file.path);

    if(errors.length == 0){
        const newBook = new Book({tittle, category, author, image: result.url, public_id: result.public_id, price});
        console.log(newBook);
        await newBook.save();
        res.redirect('/admin_libro');
    }
    //res.redirect('/');
});

router.post('/admin_libro/borrar/:id', isAuthenticated, async (req, res) => {
    const photo = await Book.findByIdAndDelete(req.params.id);
    const result = await cloudinary.v2.uploader.destroy(photo.public_id);
    console.log(result);
    res.redirect('/admin_libro');
});

router.get('/Erotico', async (req, res) =>{
    const books = await Book.find({ "category": "Erotic"});
    res.render('products', {books});
});

router.get('/Terror', async (req, res) =>{
    const books = await Book.find({ "category": "Terror"});
    res.render('products', {books});
});

router.get('/Aventura', async (req, res) =>{
    const books = await Book.find({ "category": "Adventure"});
    res.render('products', {books});
});

router.get('/Romantico', async (req, res) =>{
    const books = await Book.find({ "category": "Romantic"});
    res.render('products', {books});
});

router.get('/Historico', async (req, res) =>{
    const books = await Book.find({ "category": "Historic"});
    res.render('products', {books});
});

router.get('/Biografico', async (req, res) =>{
    const books = await Book.find({ "category": "Biografic"});
    res.render('products', {books});
});

module.exports = router;