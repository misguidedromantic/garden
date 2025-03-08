window.onload = function(){

    createCanvas()
    const canvas = getCanvas()
    const data = getData()
    renderSectionBlocks(canvas, data)


}

function createCanvas(){
    d3.select('body')
        .append('svg')
        .attr('id','songLayouts')
}

function getCanvas(){
    return d3.select('#songLayouts')
}

function getData(){
    const defaultSections = getSections()
    sortSectionsIntoStacks(defaultSections)
    
    const goodAfterBadSections = getSections('good after bad')
    sortSectionsIntoStacks(goodAfterBadSections)

    return defaultSections
    
}

function getSections(songTitle){
    switch(songTitle){
        case 'good after bad':
            return [
                new section ('intro 1', 'good after bad', 'A'),
                new section ('verse 1', 'good after bad', 'A'),
                new section ('chorus 1', 'good after bad', 'B'),
                new section ('verse 2', 'good after bad', 'A'),
                new section ('chorus 2', 'good after bad', 'B'),
                new section ('chorus 3', 'good after bad', 'B')
            ]
        default:
            return [
                new section ('verse 1', 'default song', 'A'),
                new section ('chorus 1', 'default song', 'B'),
                new section ('verse 2', 'default song', 'A'),
                new section ('chorus 2', 'default song', 'B'),
                new section ('bridge 1', 'default song', 'B'),
                new section ('chorus 3', 'default song', 'B')
            ]
    }


}

class section {
    constructor(sectionTitle, songTitle, formalSection){
        this.title = sectionTitle
        this.song = songTitle
        this.formalSection = formalSection
        this.setType()
    }

    setType(){
        const words = this.title.split(' ')
        this.type = words[0]
    }

}

function sortSectionsIntoStacks(sections){

    let stackOrdinal = 0
    let stackLevel = 0

    for(let i = 0; i < sections.length; i++){
        
        const subSequence = getSubSequence(sections, i)

        applyStackOrdinal(subSequence, stackOrdinal)
        applyStackLevel(subSequence, stackLevel)

        i = i + subSequence.length - 1
        
        
      /*   const thisSection = sections[i]
        const nextSection = sections[i + 1]

        if(thisSection.type === 'verse' && nextSection.type === 'chorus'){
            thisSection.stackOrdinal = stackOrdinal
            nextSection.stackOrdinal = stackOrdinal
            thisSection.stackLevel = getSectionLevel(thisSection)
            nextSection.stackLevel = getSectionLevel(nextSection)
            i = i + 1
        } else {
            thisSection.stackOrdinal = stackOrdinal
            thisSection.stackLevel = getSectionLevel(thisSection)
        } */
        stackOrdinal = stackOrdinal + 1
    }
}

function getSubSequence(sections, i){

    const subSequence = [sections[i]]

    if(isTransitionSequence(sections, i) && isFormMatchedSequence(sections, i)){
        subSequence.push(sections[i + 1])

        if(isVerseChorusSequence(sections, i + 1)){
            subSequence.push(sections[i + 2])
        }
    } else if (isVerseChorusSequence(sections, i)){
        subSequence.push(sections[i + 1])
    }

    return subSequence


/*     if(isTransitionSequence(sections, i) && isFormMatchedSequence(sections, i)){
        
        return [sections[i], sections[i + 1]]
    } else if (isVerseChorusSequence(sections, i)){
        return [sections[i], sections[i + 1]]
    }else {
        return [sections[i]]
    } */
}



function applyStackOrdinal(subSequence, stackOrdinal){
    subSequence.forEach(section => {
        section.stackOrdinal = stackOrdinal
    });
}

function applyStackLevel(subSequence, stackLevel){
    subSequence.forEach(section => {
        section.stackLevel = getFormalSectionLevel(section)
    });
}


function isVerseChorusSequence(sections, i){
    if(sections[i].type === 'verse' && sections[i + 1].type === 'chorus'){
        return true
    }
}

function isTransitionSequence(sections, i){
    if(sections[i].type === 'intro' && sections[i + 1].type === 'verse'){
        return true
    }
}

function isFormMatchedSequence(sections, i){
    if(sections[i].formalSection === sections[i + 1].formalSection){
        return true
    }
}



function getFormalSectionLevel(section){
    const letterNumber = section.formalSection.toLowerCase().charCodeAt(0) - 96;
    return letterNumber > 0 && letterNumber < 27 ? letterNumber : getSectionLevel(section)
}


function getSectionLevel(section){
    switch(section.type){
        case 'bridge':
            return 4
        case 'intro':
            return 0
    }
}

function renderSectionBlocks (canvas, data){
    canvas.selectAll('rect')
        .data(data)
        .join('rect')
        .attr('height', 12)
        .attr('width', 12)
        .attr('fill', 'grey')
        .attr('x', d => d.stackOrdinal * 15 + 15)
        .attr('y', d => d.stackLevel * -15 + 60)
}



