const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
const vesselData = require("./vesselData.json");

const moment = require("moment");
const diana = require("./dianaDataEnrich.js");
const _toc = require("./toc.js");
const piledata = require("./piledata.json");
const newBioWF = require("./newBioWF.json")
const newEngWF = require("./newEngWF.json")
const supReportPack = require("./supReportPack")


app.use(express.static(__dirname + "/views"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let levelOneCounter = 0;
let levelTwoCounter = 0;
let levelThreeCounter = 0;

//Handlebars settings
app.set("view engine", "hbs");
app.engine(
  "hbs",
  exphbs({
    extname: "hbs",

    defaultLayout: "index",
    helpers: {


  

findNumbers: function(obj, options) {
  let result = '';
  
  function traverseObject(o) {
    for (let key in o) {
      if (typeof o[key] === 'object' && o[key] !== null) {
        traverseObject(o[key]);
      } else {
        if (/^\d+\.$/.test(o[key])) {
          result += `<p>${key}: ${o[key]}</p>`;
        }
      }
    }
  }
  
  traverseObject(obj);
  
  return result;
},

      getImages: function (path, attachments, options) {
        // make sure that the attachment path does not have any spaces and is lower case
        const attachmentPath = path?.replaceAll(" ", "").toLowerCase();
        // Find the section, case insensitive compare using toLowerCase.
        const matchingAttachments = attachments.filter(
          (x) => x.path?.replaceAll(" ", "").toLowerCase() === attachmentPath
        );
        return matchingAttachments
          .map((attachment) => {
            if (!options.fn) return { path };
            // add the fullApiUrl to the attachment object, to save fetching the url
            // in the handlebar template.
            attachment.fullApiUrl = getImageUrl(attachment.fullUri);
            // this method is to be used inside {{#getImages folder ../attachments}}
            // where the content <img src='{{fullApiUrl}}'/> can be used
            return options.fn(attachment);
          })
          .join("");
      },
      createDate: function (date, offset, ticks) {
        try {
          ticks = ticks.replace("NumberLong(", "").replace(")", "");
          offset = Number(offset).toString();
          return `{ "date":"${date}", "offset":${offset}, "ticks":${ticks} }`;
        } catch (e) {
          return `{"date":"","offset":0,"ticks":0,"message": ${e} }`;
        }
      },

      ifn: function (value, defaultValue) {
        return value === undefined || value === null ? defaultValue : value;
      },

      ifb: function (value, defaultValue) {
        return value === undefined || value === null ? defaultValue : value;
      },

      replace: function (value, context, replaceValue, withValue) {
        const regex = new RegExp(replaceValue, "g");
        return value.replace(regex, withValue);
      },

      hasValue: function (value) {
        return !(
          value === undefined ||
          value === null ||
          value === "<p></p>\n" ||
          value === ""
        );
      },

      array: function() {
        return Array.from(arguments).slice(0, -1);
      },

      lookAtMultiValue: function (values) {
        for (let i = 0; i < values.length; i++) {
          const value = values[i];
          if (
            value !== undefined &&
            value !== null &&
            value !== "<p></p>\n" &&
            value !== ""
          ) {
            return true;
          }
        }
        return false;
      },

      dateDiff: function (fromDate, toDate, format) {
        const date1 = new Date(toDate).getTime();
        const date2 = new Date(fromDate).getTime();
        const diff = date1 - date2;
        if (format === "m") {
          return diff / (1000 * 60);
        }
        if (format === "h") {
          return diff / (1000 * 60 * 60);
        }
        if (format === "d") {
          return Math.floor(diff / (1000 * 60 * 60 * 24));
        }
        return format;
      },

      dateDiffEx: function (outerFrom, outerTo, innerFrom, innerTo, format) {
        const date1 = new Date(outerFrom).getTime();
        const date2 = new Date(outerTo).getTime();

        const date3 = new Date(innerFrom).getTime();
        const date4 = new Date(innerTo).getTime();

        const outerDiff = date1 - date2;
        const innerDif = date3 - date4;

        const diff = outerDiff - innerDif;

        if (format === "m") {
          return diff / (1000 * 60);
        }
        if (format === "h") {
          return diff / (1000 * 60 * 60);
        }
        if (format === "d") {
          return diff / (1000 * 60 * 60 * 24);
        }
        return format;
      },

      sum: function (value, field) {
        try {
          if (value && Array.isArray(value) && value.length > 0) {
            return value.reduce(function (total, currentItem) {
              const itemValue = currentItem[field] ?? 0;
              return total + itemValue;
            }, 0);
          }
        } catch {}
        return 0;
      },

      sectionCounter: function(context, options) {
        var counts = {};
      
        for (var i = 0; i < context.length; i++) {
          var sectionName = context[i];
          if (!counts[sectionName]) {
            counts[sectionName] = 1;
          } else {
            counts[sectionName]++;
          }
        }
      
        var out = "";
        for (var section in counts) {
          out += options.fn({section: section, count: counts[section]});
        }
      
        return out;
      },

      add1: function(value) {
        return value + 1;
      },
      

      formatDate: function (dateTime, dateTimeFormat, timeZone = "utc") {
        if (dateTime === undefined || dateTime === null) {
          return DefaultEmptyPrintValue;
        }

        if (dateTimeFormat.toUpperCase() === "DAY") {
          return dateTime.substring(0, 2);
        }

        if (dateTimeFormat.toUpperCase() === "DD MMM YYYY") {
          //return dateTime.substring(0, 10);
          return moment(dateTime).format(dateTimeFormat);
        }

        if (dateTimeFormat.toUpperCase() === "HH:MM TT") {
          //return dateTime.substring(0, 18);
          return moment(dateTime).format(dateTimeFormat);
        }

        if (dateTimeFormat === "DD MMM YYYY") {
          dateTimeFormat = "DD MMM YYYY";
        }

        if (dateTimeFormat === "HH:mm TT") {
          dateTimeFormat = "HH:mm TT";
        }

        if (dateTimeFormat === "HH:MM") {
          dateTimeFormat = "HH:mm";
        }

        const currentTime = moment(dateTime.date ?? dateTime).utcOffset(
          dateTime.offset ?? 0
        );

        if (timeZone === "local") {
          return currentTime.local().format(dateTimeFormat);
        }
        if (timeZone === "saved") {
          return currentTime.format(dateTimeFormat);
        }

        return currentTime.utc().format(dateTimeFormat);
      },

      userInvite: function (user, role) {
        return `{ "id": "${user.id}", "name":"${user.name}", "email":"${user.email}", "roles":["${role}"]}`;
      },

     


        incrementLevelOneCounter: function() {
            levelOneCounter++;
            return levelOneCounter
        },
    
        getLevelOneCounter: function() {
            return levelOneCounter;
        },
        resetLevelOneCounter: function () {
          levelOneCounter = 0
        },

        getLevelTwoCounter: function() {
          return levelTwoCounter;
        },
    
        incrementLevelTwoCounter: function() {
            levelTwoCounter++;
            return levelTwoCounter;
        },
    
        resetLevelTwoCounter: function() {
            levelTwoCounter = 0;
        },

        getLevelThreeCounter: function() {
          return levelThreeCounter;
        },
    
        incrementLevelThreeCounter: function() {
            levelThreeCounter++;
            return levelThreeCounter;
        },
    
        resetLevelThreeCounter: function() {
            levelThreeCounter = 0;
        },

      increment: function (value) {
        return (value ?? 0) + 1;
      },

      eq: function (value1, value2) {
        return value1 === value2;
      },

      formatDateTime: function (dateTime, { date, offset }, dateTimeFormat) {
        if (dateTime === undefined) {
          return DefaultEmptyPrintValue;
        }
        if (typeof dateTime !== "string" && "date" in dateTime) {
          const currentTime = moment(dateTime.date).utcOffset(
            dateTime.offset ?? 0
          );
          return currentTime.local().format(dateTimeFormat);
        }

        const currentTime = moment(dateTime);
        return currentTime.local().format(dateTimeFormat);
      },

      ifValue: function (value, trueValue, falseValue) {
        let formattedVal = value;
        if (typeof formattedVal === "string")
          formattedVal = formattedVal.toLowerCase();
        if (
          formattedVal === true ||
          formattedVal === 1 ||
          formattedVal === "true" ||
          formattedVal === "yes"
        )
          return trueValue;
        if (
          value === false ||
          value === 0 ||
          value === "false" ||
          value === "no"
        )
          return falseValue;
        if (value !== undefined && value !== null) return trueValue;
        return falseValue;
      },

      ifValueBool: function (value, trueValue, falseValue) {
        if (
          value === true ||
          value === 1 ||
          value === "true" ||
          value === "yes" ||
          value === "Yes" ||
          value === "YES" ||
          value === "True" ||
          value === "TRUE"
        ) {
          return trueValue;
        }

        if (
          value === false ||
          value === 0 ||
          value === "false" ||
          value === "no" ||
          value === "No" ||
          value === "NO" ||
          value === "False" ||
          value === "FALSE"
        ) {
          return falseValue;
        }

        if (value !== undefined && value !== null) {
          if (value === trueValue) {
            return falseValue;
          }
        }

        return false;
      },

      // Date: {{now "dddd DD MMMM YYYY"}}
      now: function (dateTimeFormat) {
        return moment().format(dateTimeFormat ?? "ddd DD, MMM YYYY");
      },
      //for subsection numbering
      addOne: function (index) {
        return index + 1;
      },
      //for section numbering
      increased: function (index, lastIndex) {
        return lastIndex + (index + 1);
      },

      formatDayOfWeek: function (isoDate) {
        if (isoDate === undefined || isoDate === null)
          return DefaultEmptyPrintValue;
        const date = new Date(isoDate);
        const day = date.getDay();
        const days = [
          "",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ];
        return days[day];
      },

      ifProductMatch: function (value, displayValue) {
        if (
          value === "RMG 3.5%S" ||
          value === "LSFO" ||
          value === "MFO05" ||
          value === "RME180" ||
          value === "RMG 0.5%S" ||
          value === "RMG 180 0.5%S" ||
          value === "RMG 180 3.5%S"
        ) {
          return displayValue;
        }

        return "";
      },

      formatCase: function (value, caseValue) {
        if (caseValue === "upper" && typeof value === "string") {
          return value.toUpperCase();
        }

        if (caseValue === "lower" && typeof value === "string") {
          return value.toLowerCase();
        }

        return value;
      },
      formatDateTime: function (dateTime, dateTimeFormat) {
        let currentTime = moment(dateTime);
        let timeFixed = currentTime.local().format(dateTimeFormat);
        return timeFixed;
    },
    todaysDate: function () {
        let nowDate = moment().format("dddd DD MMMM YYYY")
        return nowDate
    },
    increased: function (index, lastIndex) 
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
    getImageUri: function (fullUri) {
        const image = "image place holder";
        return image;
    },

      hasValues: function (
        displayValue,
        param1,
        param2,
        param3,
        param4,
        param5,
        param6
      ) {
        if (
          param1 !== "" ||
          param2 !== "" ||
          param3 !== "" ||
          param4 !== "" ||
          param5 !== "" ||
          param6 !== ""
        ) {
          return displayValue;
        } else {
          return "";
        }
      },

      
    },
  })
);

const port = 8900;
app.listen(port);
console.log(`Server is running on Port: ${port}`);

// Route to display static src images
app.get("/static", (req, res) => {
  res.render("static");
});
app.get("/views/", (req, res) => {
  res.render("static");
});

app.get("/", (req, res) => {
  const data = diana.enrichData(vesselData);

  data.data.sections.map((section) => {
    console.log({ ...section });
  });

  res.render("mainClassInspection", data);
});

app.get("/newBioWF", (req, res) => {
  const data = diana.enrichData(newBioWF);

  data.data.sections.map((section) => {
    console.log({ ...section });
  });

  res.render("newBioWF", data);
});


app.get("/newEngWF", (req, res) => {
  const data = diana.enrichData(newEngWF);

  data.data.sections.map((section) => {
    console.log({ ...section });
  });

  res.render("newEngWF", data);
});


app.get("/supReportPack", (req, res) => {
  const data = diana.enrichData(supReportPack);

  data.data.sections.map((section) => {
    console.log({ ...section });
  });

  res.render("supReportPack", data);
});

