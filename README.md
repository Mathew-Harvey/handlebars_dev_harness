# handlebars_report_generation

Problems:

how to make toc update to custom headings in the workflow

loop through all steps
if step has components
then
loop through components
if component is "section"
then
add section to results 
create var section.title = component.properties.title
results === array of sections
if section has components
then
loop through components (that are in that section)
if
component === subsection 
then
add subsection to section (section.subsection.title = component.porperties.title)
where the title is a varable, asigning the value of title to the value of component.properties.title
get data that subsection points to (component.datapath)

json path library (npm package)

take datapath, ($.data.rudder.rudder)using the work object, it will return the json that rudder.rudder points to


export const tryGetValueFromData = (value, data) => {
  if (value && value[0] === "$") {
    let result = jsonpath.query(data, value, 1)[0];
    // if (value === "$.phoneNumber") { //debug }
    if (result === undefined && data?.data) {
      result = jsonpath.query(data?.data, value, 1)[0];
    }
    if (result) {
      return result;
    }
  }
  return undefined;
};


merge title and data together

{
    title,
    type,
    context,
    ...data
}


    sections: [
            {
                "title": "Rudder"
                "type": "section",
                "context": "delivery",
                "children": [
                    {
                        "title":"Rudder",
                        "fouling": {
                            "fr0": "100",
                            "fr10": "",
                            "fr20": "",
                            "fr30": "",
                            "fr40": "",
                            "fr50": "",
                            "fr60": "",
                            "fr70": "",
                            "fr80": "",
                            "fr90": "",
                            "fr100": ""
                        },
                        "pdr": "",
                        "comments": "<ul>\n<li>Port and Starboard rudders were found to have an FR of 20 pre clean.</li>\n<li>Port and Starboard rudders were found to have a PDR of 10 to 50, with areas of delamaination occouring along weld semes and edges.&nbsp;</li>\n</ul>\n"
                    },
                    {
                        "title": "Rudeer 2",
                        "type":"subsection",
                        "context": "delivery",
                        "fouling": {
                            "fr0": "100",
                            "fr10": "",
                            "fr20": "",
                            "fr30": "",
                            "fr40": "",
                            "fr50": "",
                            "fr60": "",
                            "fr70": "",
                            "fr80": "",
                            "fr90": "",
                            "fr100": ""
                        },
                        "pdr": "",
                        "comments": "<ul>\n<li>Port and Starboard rudders were found to have an FR of 20 pre clean.</li>\n<li>Port and Starboard rudders were found to have a PDR of 10 to 50, with areas of delamaination occouring along weld semes and edges.&nbsp;</li>\n</ul>\n"
                    }
                ]
            }
    }

decorate worklog with property that i can test for
for each step loop through the step, look for sections