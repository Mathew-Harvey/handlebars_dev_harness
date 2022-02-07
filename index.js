const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
const vesselData = require('./vesselData.json')

const diana = require('./dianaDataEnrich.js');

app.use(express.static(__dirname + "/public"));
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
            let timeFixed = currentTime.local().format(dateTimeFormat)
            return timeFixed
        },
        todaysDate: function () {
            let nowDate = moment().format("dddd DD MMMM YYYY")
            return nowDate  
        },
        increment: function (index) {
            return index + 1;
        },
        eq: function (value1, value2) {
            return (value1 === value2);
        }

        // THIS HELPER IS FOR DIANA INTEGRATION
        // Handlebars.registerHelper("getImages", function (path, options) {
        //     const attachments = currentWork.attachments.filter((x) => x.path === path);
        //     return attachments.map((attachment) => {
        //     return options.fn(attachment);
        //     });
        //     });
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
