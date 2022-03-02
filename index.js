const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
const vesselData = require('./vesselData.json');
const mooringData =  require ('./mooringData.json');
const moment = require("moment");
const diana = require('./dianaDataEnrich.js');

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
            var diff=0;
            var remainder=0;
            var wholeNum=0;
            var nextIndex=0;
            // need to formulate a more dynamic computation
            // what if the index is greater than 20
            console.log('index ' + index);
            if(index >10)
            { 
                remainder= index % 10;
                wholeNum= (index-remainder)/10;
                console.log('remainder ' + remainder + ' wholeNum ' + wholeNum);
                if(remainder>0) 
                {
                    diff = index-(wholeNum * 10);
                }
               else {diff=0;}
            }
            else
            {
                diff=(index-lastIndex);
            }
            // 3 here is the fixed section in the report which include 
            // Project Particular, Methodology and Reference Tables
            // since the last section is 3 make sure that the next value is 1 higher than the last thus (return value+1 )
            console.log('diff ' + diff);
            nextIndex=index-(wholeNum*10);
            if(nextIndex<=(lastIndex+1)) {
                nextIndex=lastIndex+1;
                console.log('< next index '+ nextIndex);
                return nextIndex;
            }                     
            else 
            {
                nextIndex=(index-(wholeNum*10));
                console.log('> next index '+ nextIndex);
                return nextIndex;
            }
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
app.get('/classSurvey', (req, res) => {
    console.log("outputing result");
    
    const data = diana.enrichData(vesselData);

    data.data.sections.map(section => {
        console.log({ ...section })
    });

    res.render("classSurvey", data);
})
app.get('/dotmooring', (req, res) => {
    console.log("outputing result");

    const data = diana.enrichData(mooringData);

    data.data.sections.map(section => {
        console.log({ ...section })
    });

    res.render("dotMooringReport_v5", data);
})
app.get('/mooring', (req, res) => {
    console.log("outputing result");

    const data = diana.enrichData(mooringData);

    data.data.sections.map(section => {
        console.log({ ...section })
    });

    res.render("mooringReport_v8", data);
})
app.get('/repairmooring', (req, res) => {
    console.log("outputing result");

    const data = diana.enrichData(mooringData);

    data.data.sections.map(section => {
        console.log({ ...section })
    });

    res.render("mooringrepair_v5", data);
})