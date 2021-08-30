const Drugs = require('../models/Drugs');

const app = require('express').Router();


app.get('/', (req, res)=>{
    res.render('index', {
        title: 'iDrug Authentication',
        errorToast: req.flash('errorToast')
    })
});

app.post('/auth-pin', async(req, res)=>{
    let { authPin } = req.body;
    authPin = authPin.replace(/-/ig, '').trim();

    let drug = await Drugs.findOne({ authPin });
    req.flash('successToast', 'Drug Found!!!');
    
    if(!drug) {
        drug = [];
        req.flash('successToast', '');
        req.flash('errorToast', 'Drug Found!!!');
    };
    
    
    res.render('auth-pin', {
        title: drug.name,
        drug,
        successToast: req.flash('successToast')
    });
});


module.exports = app;