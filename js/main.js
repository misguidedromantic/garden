window.onload = async function(){

    createCanvas()
    const canvas = getCanvas()
    const data = await getData()
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

async function getData(){

    const csvData = await loadSongsData()
    const sections = transformStructuralSectionsData(csvData)
    console.log(sections)

    return Promise.resolve()
    
}

async function loadSongsData(){
    return {
        songs: await d3.csv('data/songs.csv'),
        structuralSections: await d3.csv('data/structural_sections.csv'),
        formalSections: await d3.csv('data/formal_sections.csv')
    }
}

function transformStructuralSectionsData(csvData){
    const arr = []
    csvData.structuralSections.forEach(section => {
        const thisSection = new songSection(section.title)
        thisSection.ordinal = section.sequence_in_song
        thisSection.songID = section.song_id
        thisSection.formalSectionID = section.formal_section_id
        thisSection.type = section.type
        arr.push(thisSection)
    })
    return arr
}



class songSection {
    constructor(id){
        this.id = id
    }
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
                new section ('bridge 1', 'default song', 'C'),
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
    let stack = []

    for(let i = 0; i < sections.length; i++){
        stack.push(sections[i])
        if(isLastInStack(sections, i)){
            applyStackOrdinal(stack, stackOrdinal)
            applyStackLevel(stack, stackLevel)
            stack = []
            stackOrdinal = stackOrdinal + 1
        }
    }
}

function isLastInStack(sections, i){
    const subSequence = getSubSequence(sections, i)
    return isStackable(subSequence) ? false : true
}

function getSubSequence(sections, i){
    if(i === sections.length - 1){
        return [sections[i]]
    } else {
        return [sections[i],sections[i + 1]]
    }
}

function isStackable(subSequence){
    const sequenceDescription = getSequenceDescription(subSequence)
    switch(sequenceDescription){
        case 'intro-verse':
            return getFormalSectionLevel(subSequence[0]) === 0
        case 'chorus-bridge':
            return getFormalSectionLevel(subSequence[0]) > 0 && isFormMatched(subSequence) === false
        case 'verse-chorus':
            return true
        default:
            return false
    }
}

function getFormalSectionLevel(section){
    const letterNumber = section.formalSection.toLowerCase().charCodeAt(0) - 96;
    return letterNumber > 0 && letterNumber < 27 ? letterNumber : 0
}

function getSequenceDescription(subSequence){
    let description = ''
    for(let i = 0; i < subSequence.length; i++){
        if(i === 0){
            description = subSequence[i].type
        } else {
            description = description + "-" + subSequence[i].type
        }
    }
    return description
}

function isFormMatched(subSequence){
    let form = ''
    for(let i = 0; i < subSequence.length; i++){
        if(i === 0){
            form = subSequence[i].formalSection
        }
        else if (form !== subSequence[i].formalSection) {
            return false
        }
    }
    return true
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



