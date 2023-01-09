const app = require('express').Router();
const passport = require('passport');
const { ensureAuthenticated: ensureAuth } = require('../config/auth');
const Drugs = require('../models/Drugs');
const genIDs = require('../utils/genIDs');
const fs = require('fs');
const path = require('path');
const Reports = require('../models/Reports');


app.get('/', (req, res)=>{
    // console.log(req.flash('successToast'));
    res.render('admin/login', {
        title: 'Admin Login',
        bodyClass: 'admin-login',
        successToast: req.flash('successToast'),
        errorToast: req.flash('errorToast')
    })
});

app.post('/', (req, res, next)=>{
    passport.authenticate('local', {
        successRedirect: '/admin/dashboard',
        failureRedirect: '/admin/',
        failureFlash: true
    })(req, res, next);
});

app.get('/dashboard', async(req, res)=>{
    const drugs = await Drugs.find({ }).sort({'time': -1}).limit(5);
    let pharmaciesArray = await Drugs.find({ }).distinct('pharmacy');
    let pharmacies = [];
    
    pharmaciesArray = pharmaciesArray.reverse().slice(0,6);
    for(let i=0; i<pharmaciesArray.length; i++){
        pharmacies.push(await Drugs.findOne({ pharmacy: pharmaciesArray[i] }).sort({'time': -1}));
    }
    
    const totalPharmacies = (await Drugs.distinct('pharmacy', { })).length;
    const totalDrugs = await Drugs.find({ }).count();

    res.render('admin/dashboard', {
       title: 'Dashboard',
       drugs,
       pharmacies,
       totalDrugs,
       totalPharmacies,
       successToast: req.flash('successToast'),
       errorToast: req.flash('errorToast')
    });
});

app.get('/pharmacies', (req, res)=>{
    res.render('admin/pharmacies', {
       title: 'Pharmacies',
       logo2: true,
    });
});

app.get('/reports', async(req, res)=>{
    const reports = await Reports.find({ }).sort({'createdAt': -1}).limit(20);
    res.render('admin/reports', {
       title: 'Reports',
       logo2: true,
       reports
    });
});

app.get('/drugs', async(req, res)=>{
    const drugs = await Drugs.find({ }).sort({'time': -1}).limit(20);
    res.render('admin/drugs', {
       title: 'Drugs',
       logo2: true,
       drugs
    });
});

app.get('/drugs/new', (req, res)=>{
    res.render('admin/new-drug', {
        title: 'Add Drugs',
        logo2: true,
        filepond: true
    })
});

app.post('/drugs/new', (req, res)=>{
    const {
        image,
        name,
        pharmacy,
        batchNo,
        nafdacNo,
        productionDate,
        expiryDate
    } = req.body;

    
    async function genDrugID(){

        let drugID = genIDs();
        let authPin = genIDs(['genUpperCase', 'genNumbers'], 15);
        
        const matchDrugID = await Drugs.findOne({ drugID });
        const matchAuthPin = await Drugs.findOne({ authPin });
        if(matchDrugID){
            return genDrugID();
        }
        
        if(matchAuthPin){
            return genDrugID();
        }
        
        if(!fs.existsSync(path.resolve(__dirname,'../public/img/drugs'))){
            fs.mkdirSync(path.resolve(__dirname,'../public/img/drugs'));
        }
    
        const buffer = Buffer.from(JSON.parse(image).data, "base64");
        fs.writeFileSync(path.resolve(__dirname,'../public/img/drugs/', `${drugID}.png`), buffer);
    
        Drugs.create({
            image: `${drugID}.png`,
            drugID,
            name,
            pharmacy,
            batchNo,
            nafdacNo,
            productionDate,
            expiryDate,
            authPin,
            time: new Date().setHours(new Date().getHours() + 1)
        })
    
        req.flash('successToast', `Adding Drug: ${name} successful`);
        res.redirect(301, '/admin/dashboard');

    }

    genDrugID();

});

app.get('/drugs/delete/:drugID', async(req, res)=>{
    const drugID = req.params.drugID;

    var drug = await Drugs.findOneAndDelete({ drugID })
    fs.unlinkSync(path.resolve(__dirname,'../public/img/drugs/'+drug.image));

    req.flash('successToast', 'Drug Deleted!!!')
    res.redirect(301, '/admin/dashboard');

});

app.post('/drugs/edit/:drugID', async(req, res)=>{
    const drugID = req.params.drugID;
    const {
        name,
        pharmacy,
        batchNo,
        nafdacNo,
        productionDate,
        expiryDate
    } = req.body;

    await Drugs.findOneAndUpdate({ drugID }, {$set: {
            name,
            pharmacy,
            batchNo,
            nafdacNo,
            productionDate,
            expiryDate,
        }
    });

    req.flash('successToast', 'Edited Succesfully');
    res.redirect(301, '/admin/dashboard');

});

app.get('/drugs/:drugID', async(req, res)=>{
    const drugID = req.params.drugID;
    const drug = await Drugs.findOne({ drugID });

    if(!drug) {
        req.flash('errorToast','Drug Not Found');
        return res.redirect('/admin/dashboard')
    };

    res.render('admin/drug', {
        title: drug.name,
        logo2: true,
        filepond: true,
        drug
    });
});

module.exports = app;