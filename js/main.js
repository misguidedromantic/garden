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
                new section ('intro 1', 'good after bad'),
                new section ('verse 1', 'good after bad'),
                new section ('chorus 1', 'good after bad'),
                new section ('verse 2', 'good after bad'),
                new section ('chorus 2', 'good after bad'),
                new section ('chorus 3', 'good after bad')
            ]
        default:
            return [
                new section ('verse 1', 'default song'),
                new section ('chorus 1', 'default song'),
                new section ('verse 2', 'default song'),
                new section ('chorus 2', 'default song'),
                new section ('bridge 1', 'default song'),
                new section ('chorus 3', 'default song')
            ]
    }


}

class section {
    constructor(sectionTitle, songTitle){
        this.title = sectionTitle
        this.song = songTitle
        this.setType()
    }

    setType(){
        const words = this.title.split(' ')
        this.type = words[0]
    }

}

function sortSectionsIntoStacks(sections){

    let stackOrdinal = 0

    for(let i = 0; i < sections.length; i++){
        const thisSection = sections[i]
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
        }
        stackOrdinal = stackOrdinal + 1
    }
}



function getSectionLevel(section){
    switch(section.type){
        case 'bridge':
            return 3
        case 'chorus':
            return 2
        case 'verse':
            return 1
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



