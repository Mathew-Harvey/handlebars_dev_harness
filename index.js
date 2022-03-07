const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
const vesselData = require('./vesselData.json')
const moment = require("moment")

const diana = require('./dianaDataEnrich.js');
const _toc = require("./toc.js");
app.use(express.static(__dirname + "/views"));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

//Handlebars settings 
app.set("view engine", "hbs");
app.engine("hbs", exphbs({
    extname: "hbs",
    defaultLayout: "index",

    

    helpers: {
        formatDateTime: function (dateTime, dateTimeFormat) {
            let currentTime = moment(dateTime);
            let timeFixed = currentTime.local().format(dateTimeFormat);
            return timeFixed;
        },
        todaysDate: function () {
            let nowDate = moment().format("dddd DD MMMM YYYY")
            return nowDate
        },
        increased: function (index,lastIndex) 
        {   
           return (lastIndex + (index +1));
        },
        addOne: function(index)
        {
            //this function is to get the index of an array
            //subsection
            return index+1;
        },
        getSectionValue: function () {
            // document.getElementById('section').value;
            var getvalue = $("#section").val();
            sectionCtr = getvalue + 1;
            return sectionCtr;
        },
        eq: function (value1, value2) {
            return (value1 === value2);
        },
        getImages: function (path, attachments, options) {
            // console.log({attachments, options});
            const links = attachments?.filter((x) => x.path === path);
            return links?.map((attachment) => {
                return options.fn(attachment);
            });
        },
        
        loadImage: function(fullUri)
        {
            const image = getImageUrl(fullUri) ?? fullUri;
            return `<img src='${image}' width='180' height='136'/>`;
        },
        getImageUrl: function(fullUri)
        {
            const image = getImageUrl(fullUri) ?? fullUri;
            return image;
        },
        hasValue: function (value){
            
                if (value === undefined || value === "<p></p>\n" || value === "") {
                  return false;
                } else {
                  return true;
                }
        },
        toc: function(section, level)
        {
            return _toc.addSection(section,level);
        },
       
    }
}));

const port = 8900;
app.listen(port);
console.log(`Server is running on Port: ${port}`)

// Route to display static src images
app.get("/static", (req, res) => {
    res.render("static");
});
app.get("/views/", (req, res) => {
    res.render("static");
});

app.get('/', (req, res) => {
    console.log("outputing result");

    const data = diana.enrichData(vesselData);

    data.data.sections.map(section => {
        console.log({ ...section })
    });

    res.render("mainClassInspection", data);
})

app.get('/hull', (req, res) => {
    const data = diana.enrichData(vesselData);

    console.log("outputing result");

    dianaWork.data.sections.map(section => {
        console.log({ ...section })
    });

    res.render("mainHullInspection", data);
})

app.get('/biofouling', (req, res) => {
    console.log("outputing result");

    const data = diana.enrichData(vesselData);

    data.data.sections.map(section => {
        console.log({ ...section })
    });

    res.render("BioFoulingReport", data);
})
app.get('/dotmooring', (req, res) => {
    console.log("outputing result");

    const data = diana.enrichData(vesselData);

    data.data.sections.map(section => {
        console.log({ ...section })
    });

    res.render("dotMooringReport", data);
})
app.get('/classSurvey', (req, res) => {
    console.log("outputing result");
    
    const data = diana.enrichData(vesselData);

    data.data.sections.map(section => {
        console.log({ ...section })
    });

    res.render("classSurvey", data);
})
app.get('/vehicleRecovery', (req, res) => {
    console.log("outputing result");
    
    const data = diana.enrichData(vesselData);

    data.data.sections.map(section => {
        console.log({ ...section })
    });

    res.render("vehicleRecoveryReport", data);
})