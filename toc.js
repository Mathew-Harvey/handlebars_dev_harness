
//
// Manage the table of contents so that sections and subsections get the correct numbering
//
// addSection(name, level) :
//  adds a new section at the level starting at 0...
//  each time a new section is added the hierarchy of sections
//  is maintained,
//     addSection("Summary", 0);   |  1. Summary         | parentSection: undefined, currentSection: Summary
//     addSection("Detail", 0)     |  2. Detail          | parentSection: undefined, currentSection: Detail
//     addSection("Part 1", 1)     |  3.1 Part 1         | parentSection: undefined, currentSection: Part 1
//     addSection("Sub Part 1", 2) |  3.1.1 Sub Part 1   | parentSection: Part 1, currentSection: Summary
//     addSection("Sub Part 2", 2) |  3.1.2 Sub Part 2   | parentSection: undefined, currentSection: Summary
//     addSection("Appendix", 0)   |  4. Appendix        | parentSection: undefined, currentSection: Summary
//     addSection("Appendix A", 1) |  4.1 Appendix A     | parentSection: undefined, currentSection: Summary
//     addSection("Appendix B", 1) |  4.2 Appendix B     | parentSection: undefined, currentSection: Summary
//
// sections: contains the hierarchy
// sections: contains the list of sections in order as a flat list
// parentSection: all sections at the same level are added to the parent
// currentSection: the current section becomes the parent when the level is increased
console.log("TOC");
const toc={
    // list of all sections
    sections: [],
    // current section numbers at each level
    sectionNumbers: [0, 0, 0, 0],
    // parent and current section state
    parentSection: undefined,
    currentSection: undefined,
    // add a new section at the level.
    // returns the section number and title like 1. Summary, 3.1.2 Sub Part 2
addSection: (name, level) => 
{
        // increment the section number at this level
        toc.sectionNumbers[level] += 1;
        // clear all subsequent levels to zero (2.0.0.0, or 2.1.0.0 etc)
        for (let i = level; i < toc.sectionNumbers.length; i++) {
            toc.sectionNumbers[i] = 0;
        }
        // build the section number such as 2.1.2
        const sectionNumber = toc.sectionNumbers.map(x => {
            if (x > 0) return x;   }).join(".");
        // create the section
        const newSection = {
            title: name,
            number: sectionNumber,
            level: level,
            parent: level > 0 ? toc.parentSection : undefined
        };
        // add section to all sections
        // this is used by code to create
        // a table of contents where the hierarchy
        // is not important.
        toc.sections.push(newSection);
        //
        // need to adjust the parent so that future sections are added correctly.
        //
        if (toc.parentSection.level === level) {
            toc.currentSection = newSection;
        }
        //
        // level is now less than the parent, gone from level 3 to level 2,  or level 3 to level 1
        //
        else if (toc.parentSection.level > level) {
            //
            // go backwards through parents of parents till we get to the right level.
            //
            while (toc.parentSection.level > level && toc.parentSection !== undefined) {
                toc.parentSection = toc.parentSection.parent;
            }
            //
            // level has been reset back to top
            // need to set parent to new section
            //
            if (level === 0) {
                toc.parentSection = newSection;
            }
        }
        //
        // level is now greater than parent,
        // parent is now current and current is new section
        //
        else {
            toc.parentSection = toc.currentSection;
            toc.currentSection = newSection;
        }
            console.log("section" + newSection.number + "." + newSection.title);
            return `${newSection.number}. ${newSection.title}`;
        }
};
      