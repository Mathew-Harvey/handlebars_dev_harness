const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
const vesselData = require('./vesselData.json');
const mooringData =  require ('./mooringData.json');
const bioFouling = require ('./Biofouling.json');
const moment = require("moment");
const diana = require('./dianaDataEnrich.js');
const _toc = require("./toc.js");
const piledata = require ('./piledata.json')
const dianaFlowData = require ('./dianaFlowV2.json');
const dianaLayoutData = require ('./dianaLayoutV1.json');


app.use(express.static(__dirname + "/views"));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

//Handlebars settings 
app.set("view engine", "hbs");
app.engine("hbs", exphbs({
    extname: "hbs",
    defaultLayout: "index",
    helpers: {

        loadImage: function (fullUri) {
            const image = getImageUrl(fullUri);
            return `<img alt='${image}' src='${image}' width='180' height='136'/>`;
          },
    
        getImageUri: function (fullUri) {
            return getImageUrl(fullUri);
          },
    
        getImages: function (path, attachments, options) {
              // make sure that the attachment path does not have any spaces and is lower case
              const attachmentPath = path?.replaceAll(' ', '').toLowerCase();
              // Find the section, case insensitive compare using toLowerCase.
              const matchingAttachments = attachments.filter(
                (x) => x.path?.replaceAll(' ', '').toLowerCase() === attachmentPath,
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
                .join('');
        },
        createDate:function (date, offset, ticks) {
              try {
                ticks = ticks.replace('NumberLong(', '').replace(')', '');
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
              const regex = new RegExp(replaceValue, 'g');
              return value.replace(regex, withValue);
            },

        hasValue: function (value) {
            return !(value === undefined || value === null || value === '<p></p>\n' || value === '');
          },
    
          Handlebars.registerHelper('lookAtMultiValue', function (values: string[]) {
            for (let i = 0; i < values.length; i++) {
              const value = values[i];
              if (value !== undefined && value !== null && value !== '<p></p>\n' && value !== '') {
                return true;
              }
            }
            return false;
          });
    
          Handlebars.registerHelper(
            'dateDiff',
            safeRegisterHelper(function (fromDate: string, toDate: string, format: string) {
              const date1 = new Date(toDate).getTime();
              const date2 = new Date(fromDate).getTime();
              const diff = date1 - date2;
              if (format === 'm') {
                return diff / (1000 * 60);
              }
              if (format === 'h') {
                return diff / (1000 * 60 * 60);
              }
              if (format === 'd') {
                return Math.floor(diff / (1000 * 60 * 60 * 24));
              }
              return format;
            }),
          );
    
          Handlebars.registerHelper(
            'dateDiffEx',
            safeRegisterHelper(function (
              outerFrom: string,
              outerTo: string,
              innerFrom: string,
              innerTo: string,
              format: string,
            ) {
              const date1 = new Date(outerFrom).getTime();
              const date2 = new Date(outerTo).getTime();
    
              const date3 = new Date(innerFrom).getTime();
              const date4 = new Date(innerTo).getTime();
    
              const outerDiff = date1 - date2;
              const innerDif = date3 - date4;
    
              const diff = outerDiff - innerDif;
    
              if (format === 'm') {
                return diff / (1000 * 60);
              }
              if (format === 'h') {
                return diff / (1000 * 60 * 60);
              }
              if (format === 'd') {
                return diff / (1000 * 60 * 60 * 24);
              }
              return format;
            }),
          );
    
          Handlebars.registerHelper('sum', function (value: any[], field: string) {
            try {
              if (value && Array.isArray(value) && value.length > 0) {
                return value.reduce(function (total, currentItem) {
                  const itemValue = currentItem[field] ?? 0;
                  return total + itemValue;
                }, 0);
              }
            } catch {}
            return 0;
          });
    
          Handlebars.registerHelper(
            'formatDate',
            safeRegisterHelper(function (dateTime: any, dateTimeFormat: string, timeZone = 'utc') {
              if (dateTime === undefined || dateTime === null) {
                return DefaultEmptyPrintValue;
              }
    
              if (dateTimeFormat.toUpperCase() === 'DAY') {
                return dateTime.substring(0, 2);
              }
    
              if (dateTimeFormat.toUpperCase() === 'DD MMM YYYY') {
                //return dateTime.substring(0, 10);
                return moment(dateTime).format(dateTimeFormat);
              }
    
              if (dateTimeFormat.toUpperCase() === 'HH:MM TT') {
                //return dateTime.substring(0, 18);
                return moment(dateTime).format(dateTimeFormat);
              }
    
              if (dateTimeFormat === 'DD MMM YYYY') {
                dateTimeFormat = 'DD MMM YYYY';
              }
    
              if (dateTimeFormat === 'HH:mm TT') {
                dateTimeFormat = 'HH:mm TT';
              }
    
              if (dateTimeFormat === 'HH:MM') {
                dateTimeFormat = 'HH:mm';
              }
    
              const currentTime = moment(dateTime.date ?? dateTime).utcOffset(dateTime.offset ?? 0);
    
              if (timeZone === 'local') {
                return currentTime.local().format(dateTimeFormat);
              }
              if (timeZone === 'saved') {
                return currentTime.format(dateTimeFormat);
              }
    
              return currentTime.utc().format(dateTimeFormat);
            }),
          
    
        userInvite: safeRegisterHelper(function (user, role) {
              return `{ "id": "${user.id}", "name":"${user.name}", "email":"${user.email}", "roles":["${role}"]}`;
            }),
     
    
          Handlebars.registerHelper('increment', function (value: number) {
            return (value ?? 0) + 1;
          });
    
          Handlebars.registerHelper('eq', function (value1: string, value2: string) {
            return value1 === value2;
          });
    
          Handlebars.registerHelper(
            'formatDateTime',
            safeRegisterHelper(function (
              dateTime: undefined | { date: string; offset?: string } | string,
              dateTimeFormat: string,
            ) {
              if (dateTime === undefined) {
                return DefaultEmptyPrintValue;
              }
              if (typeof dateTime !== 'string' && 'date' in dateTime) {
                const currentTime = moment(dateTime.date).utcOffset(dateTime.offset ?? 0);
                return currentTime.local().format(dateTimeFormat);
              }
    
              const currentTime = moment(dateTime);
              return currentTime.local().format(dateTimeFormat);
            }),
          );
    
          Handlebars.registerHelper(
            'ifValue',
            function (value: string | boolean | number, trueValue: any, falseValue: any) {
              let formattedVal = value;
              if (typeof formattedVal === 'string') formattedVal = formattedVal.toLowerCase();
              if (
                formattedVal === true ||
                formattedVal === 1 ||
                formattedVal === 'true' ||
                formattedVal === 'yes'
              )
                return trueValue;
              if (value === false || value === 0 || value === 'false' || value === 'no')
                return falseValue;
              if (value !== undefined && value !== null) return trueValue;
              return falseValue;
            },
          );
    
          Handlebars.registerHelper(
            'ifValueBool',
            function (value: string | boolean | number, trueValue: any, falseValue: any) {
              if (
                value === true ||
                value === 1 ||
                value === 'true' ||
                value === 'yes' ||
                value === 'Yes' ||
                value === 'YES' ||
                value === 'True' ||
                value === 'TRUE'
              ) {
                return trueValue;
              }
    
              if (
                value === false ||
                value === 0 ||
                value === 'false' ||
                value === 'no' ||
                value === 'No' ||
                value === 'NO' ||
                value === 'False' ||
                value === 'FALSE'
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
          );
    
          // Date: {{now "dddd DD MMMM YYYY"}}
          Handlebars.registerHelper('now', function (dateTimeFormat: string) {
            return moment().format(dateTimeFormat ?? 'ddd DD, MMM YYYY');
          });
          //for subsection numbering
          Handlebars.registerHelper('addOne', function (index: number) {
            return index + 1;
          });
          //for section numbering
          Handlebars.registerHelper('increased', function (index: number, lastIndex: number) {
            return lastIndex + (index + 1);
          });
    
          Handlebars.registerHelper(
            'formatDayOfWeek',
            safeRegisterHelper(function (isoDate: string) {
              if (isoDate === undefined || isoDate === null) return DefaultEmptyPrintValue;
              const date = new Date(isoDate);
              const day = date.getDay();
              const days = [
                '',
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
                'Sunday',
              ];
              return days[day];
            }),
          );
    
          Handlebars.registerHelper('ifProductMatch', function (value: string, displayValue: string) {
            if (
              value === 'RMG 3.5%S' ||
              value === 'LSFO' ||
              value === 'MFO05' ||
              value === 'RME180' ||
              value === 'RMG 0.5%S' ||
              value === 'RMG 180 0.5%S' ||
              value === 'RMG 180 3.5%S'
            ) {
              return displayValue;
            }
    
            return '';
          });
    
          try {
            const eData = enrichWorkData(currentWork);
            return template(eData);
          } catch (ex: any) {
            return getErrorResponse(printContext.htmlTemplate, handleBarsTemplate, ex.toString());
          }
        };
    
        Handlebars.registerHelper(
          'formatCase',
          safeRegisterHelper(function (value: string | null, caseValue: string) {
            if (caseValue === 'upper' && typeof value === 'string') {
              return value.toUpperCase();
            }
    
            if (caseValue === 'lower' && typeof value === 'string') {
              return value.toLowerCase();
            }
    
            return value;
          }),
        );
    
        Handlebars.registerHelper(
          'hasValues',
          function (
            displayValue: string,
            param1: string,
            param2: string,
            param3: string,
            param4: string,
            param5: string,
            param6: string,
          ) {
            if (
              param1 !== '' ||
              param2 !== '' ||
              param3 !== '' ||
              param4 !== '' ||
              param5 !== '' ||
              param6 !== ''
            ) {
              return displayValue;
            } else {
              return '';
            }
          },
        );
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


    const data = diana.enrichData(vesselData);

    data.data.sections.map(section => {
        console.log({ ...section })
    });

    res.render("mainClassInspection", data);
})

app.get('/pile', (req, res) => {
    const data = diana.enrichData(piledata);

  

    data.data.sections.map(section => {
        console.log({ ...section })
    });

    res.render("pileReport", data);
})

app.get('/biofouling', (req, res) => {


    const data = diana.enrichData(bioFouling);

    data.data.sections.map(section => {
        console.log({ ...section })
    });
 
})

app.get('/classSurvey', (req, res) => {
 
    
    const data = diana.enrichData(vesselData);

    data.data.sections.map(section => {
        console.log({ ...section })
    });

    res.render("classSurvey", data);
})

app.get('/dotmooring', (req, res) => {
   

    const data = diana.enrichData(mooringData);

    data.data.sections.map(section => {
        console.log({ ...section })
    });

    res.render("dotMooringReport_v5", data);
})

app.get('/mooring', (req, res) => {
  

    const data = diana.enrichData(mooringData);

    data.data.sections.map(section => {
        console.log({ ...section })
    });

    res.render("mooringReport_v9", data);
})
app.get('/repairmooring', (req, res) => {
   

    const data = diana.enrichData(mooringData);

    data.data.sections.map(section => {
        console.log({ ...section })
    });

    res.render("classSurvey", data);
})

app.get('/basic', (req, res) => {
   

    const data = diana.enrichData(vesselData);

    data.data.sections.map(section => {
        console.log({ ...section })
    });

    res.render("basicReport", data);
})
app.get('/IWHC', (req, res) => {
  

    const data = diana.enrichData(vesselData);

    data.data.sections.map(section => {
        console.log({ ...section })
    });

    res.render("inWaterHullClean", data);
})
app.get('/pre', (req, res) => {
  

    const data = diana.enrichData(vesselData);

    data.data.sections.map(section => {
        console.log({ ...section })
    });

    res.render("prePurchaseInWaterSurvey", data);
})

app.get('/dianaFlow', (req, res) => {
    res.render("dianaFlowV2",dianaFlowData);
})

app.get('/dianaLayout', (req, res) => {
    res.render("dianaLayoutV1", dianaLayoutData);
})



