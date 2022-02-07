
const jsonPath = require('jsonpath')
// steps []  of steps
// sectoins [] of sections (results) each call will add to this sections array
function getSectionData(dianaWork, steps, sections) {

    // Loop through the steps
    steps.map(step => {
        console.log("Processing step " + step.displayName);
        
        // If the step has steps then process these first
        if (step.steps !== undefined && step.steps.length > 0)
        {
            // recursive call through all child steps
            getSectionData(dianaWork, step.steps, sections)
        }

        // no more steps to process
        // now check to see if the step has a layout
        // if so then this has the data we need
        if (step.layout?.components !== undefined) {
            console.log("Found Components");
            
            // Using the layout configuration find the sub section
            // data path to add to the data to the relevant section
            // The sub sections are added to a section that has a title.
            // The data is looked up using the configuration data path
            // of the sub section and merged with the new sub section
            // object
            // Schema:
            //
            //   section: {
            //    title: $.component.properties.title,
            //    context: [TODO],
            //    sections : [
            //      {
            //        title: $.component.properties.title,
            //        ...$.component.dataPath
            //      }
            //     ]
            //   }
            var result = step.layout.components.map(component => {
                console.log("Processing Component " + component.name);
    
                if (component.component === "section") {
                    console.log("Found Section " + component.name);
    
                    const section = {
                        title: component.properties?.title ?? component.label ?? component.name,
                        type: "section",
                        context: component.context,
                        sections: []
                    };
                
                    console.log("Processing sub sections");
                    
                    getSubSection(dianaWork, section, component.components);

                    sections.push({ ...section });
                }
            })
        }
        
    });
}

function getSubSection(dianaWork, section, components)
{
    return components?.map((component) => {
        console.log("Processing Component " + component?.name);
        if (component.component === "subsection") {
            
            console.log("Found Sub Section " + component.name + " path =" + component.dataPath);
            const path = component.dataPath; // $.rudder.ruddeer
            
            const value = jsonPath.query(dianaWork.data, path); // vessel data query
            console.log("Found Sub Section " + component.name, {value});

            if (value !== undefined && value.length > 0) {

                var child = {
                    title: component.properties?.title ?? component.label ?? component.name,
                    type: "subsection",
                    context: component.context,
                    ...value[0]
                };

                console.log("Created Sub Section", { child });

                section.sections.push(child);
            }
        }
    });
}

function enrichData(dianaWork) {
    var sectionData = [];

    getSectionData(dianaWork, dianaWork.steps, sectionData);

    dianaWork.data.sections = sectionData;

    return dianaWork;
    //
    // {{#each data.sections}}
    //  {{title}}
    // {{/each}}
    //
}

module.exports = { enrichData };