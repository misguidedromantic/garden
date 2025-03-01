window.onload = function(){

    createCanvas()
    const canvas = getCanvas()
    const data = getData()



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
    const goodAfterBadSections = getSections('good after bad')
    
}

function getSections(songTitle){
    switch(songTitle){
        case 'good after bad':
            return [
                new section ('intro 1', 'good after bad'),
                new section ('verse 1', 'good after bad'),
                new section ('chorus 1', 'good after bad')
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

function sortSectionsIntoStacks(sections){

    const stacks = []


    for(let i = 0; i < sections.length; i++){
        if(sections[i].type === 'verse'){
            stacks.push([
                sections[i]
            ])
        }


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
        this.typeOrdinal = words[1]
    }

}

function renderSectionBlocks (canvas, data){
    canvas.selectAll('rect')
        .data(data)
        .join('rect')
        .attr('height', 10)
        .attr('width', 10)
        .attr('fill', 'grey')
        .attr('x', (d, i) => {

        })
}



