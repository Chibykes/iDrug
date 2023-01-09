const Drugs = require('../models/Drugs');
const Reports = require('../models/Reports');

const app = require('express').Router();


app.get('/', (req, res)=>{
    res.render('index', {
        title: 'iDrug Authentication',
        errorToast: req.flash('errorToast')
    })
});

app.get('/report-drug', (req, res)=>{
    res.render('report-drug', {
        title: 'Report Drug',
        errorToast: req.flash('errorToast'),
        successToast: req.flash('successToast')
    })
});

app.post('/report-drug', (req, res)=>{

    try{
        Reports.create(req.body);
        req.flash('successToast', 'Drug Report Sent.');
    } catch (e) {
        req.flash('errorToast', 'Drug Report not Sent.');
    }
    
    res.render('report-drug', {
        title: 'Report Drug',
        errorToast: req.flash('errorToast'),
        successToast: req.flash('successToast')
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