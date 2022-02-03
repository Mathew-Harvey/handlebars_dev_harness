const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
const vesselData = require('./vesselData.json')

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
    res.render("mainClassInspection", vesselData);
})

app.get('/hull', (req, res) => {
    res.render("mainHullInspection", vesselData);
})

//rebuild JSON file for handlebar template




const jsonPath = require('jsonpath')

var steps = jsonPath.query(vesselData, '$..steps[0,1,2].steps[0]')
var layout = jsonPath.query(vesselData, '$..layout.components[9].components[0].components')

// console.log(steps)
console.log(layout)



// tryGetValueFromData = (vesselData, data) => {
//     if (value && value[0] === "$") {
//         let result = jsonpath.query(vesselData, '$..layout', 1)[0];
//         if (result === undefined && data?.data) {
//             result = jsonpath.query(vesselData?.vesselData, value, 1)[0];
//         }console.log(tryGetValueFromData)
//         if (result) {
//             return result;
          
//         }
//     }
// }  
// return undefined;



// console.log(layout+' COMPONENTS')

// steps.filter(item => {
//     interateObject(item)
// })


// function interateObject(obj) {
//     for (prop in obj) {
//         if (typeof (obj[prop]) == "object") {
//             interateObject(obj[prop])
//         } else {
//             if (prop == "displayName" || prop == "") {
//                 console.log(prop.toUpperCase()+': ', obj[prop])
//             } else {
//                 if (obj[prop]== "Delivery"){
//                     var deliveryDetails = jsonPath.query()
//                 }
//             }
//         }
//     }
// }



// let rows = stepSearch.length;
// for(let i=0; i<rows; i ++){
//     let items = stepSearch[i].length;
//     // console.log(i, items)
//     for(let n=0; n<items; n++){
//         console.log(stepSearch[i][n])
//     }
// }

