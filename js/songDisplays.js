
class songSectionBlocksControl {
    constructor(svg){
        this.svg = svg
        this.loadTemplateSong()
    }
    
    loadSong(song){
        console.log(song)
        this.setupStacks(song.structure)
        this.render(song.structure, song.id)
    }

    loadTemplateSong(){
        const templateSong = new song ('template')
        templateSong.structure = this.getDefaultStructure()
        this.loadSong(templateSong)
    }

    getDefaultStructure(){
        return [
            new verse ({title: 'verse1', sequence_in_song: 1}),
            new chorus ({title: 'chorus1', sequence_in_song: 2}),
            new verse ({title: 'verse2', sequence_in_song: 3}),
            new chorus ({title: 'chours2', sequence_in_song: 4}),
            new bridge ({title: 'bridge1', sequence_in_song: 5}),
            new chorus ({title: 'chorus3', sequence_in_song: 6})
        ]
    }

    render(data, songID){
        this.svg.selectAll('rect.' + songID)
            .data(data, d => d.id)
            .join('rect')
            .attr('class', songID)
            .attr('id', d => d.id)
            .attr('width', 12)
            .attr('height', 12)
            .attr('x', (d, i) => d.stackNumber * 15)
            .attr('y', (d, i) => d.positionInStack * -15 + 80)
            //.attr('fill', '#A9A9A9')
            .attr('fill', 'white')
            .attr('opacity', 0.25)
    }

    setupStacks(sections){
        let stackNumber = 0
        sections.forEach(thisSection => {
            console.log(thisSection.sequence)
                stackNumber = stackNumber + this.getStackIncrement(thisSection, sections)
                thisSection.stackNumber = stackNumber
                thisSection.positionInStack = this.getPositionInStack(thisSection.constructor.name)
            });
                
    }
    
    getStackIncrement(thisSection, allSections){
        const previousSectionType = this.getSectionTypeBySequenceNumber(thisSection.sequence - 1, allSections)
        switch(thisSection.constructor.name){
            case 'intro':
                return 0
            case 'verse':
                return this.getStackIncrementForVerse(previousSectionType)
            case 'chorus':
                console.log(thisSection.sequence )
                return this.getStackIncrementForChorus(previousSectionType)
            case 'bridge':
            case 'outro':
                return 1
            };
        }

    getPositionInStack(thisSectionType){
        switch(thisSectionType){
            case 'intro':
            case 'verse':
                return 1
            case 'chorus':
                return 2
            case 'bridge':
            case 'outro':
                return 3
        }
    }
    
    getSectionTypeBySequenceNumber(sequenceNumber, sections){
        console.log(sequenceNumber)
        if(sequenceNumber > 0 && sequenceNumber < sections.length){
            const previousSection = sections.find(section => section.sequence === sequenceNumber)
            return previousSection.constructor.name
        }
    }
    
    getStackIncrementForVerse(previousSectionType){
        return previousSectionType === 'intro' ? 0 : 1
    }

    getStackIncrementForChorus(previousSectionType){
        switch(previousSectionType){
            case 'intro':
            case 'bridge':
            case 'chorus':
                return 1
            case 'verse':
                return 0
        }
    }
}

class sectionSequencing {

    getSectionTypeBySequenceNumber(sequenceNumber, sections){
        console.log(sequenceNumber)
        if(sequenceNumber > 0 && sequenceNumber < sections.length){
            const previousSection = sections.find(section => section.sequence === sequenceNumber)
            return previousSection.constructor.name
        }
    }

    getPattern(thisSection, nextSection){
        if(thisSection === 'intro' && nextSection === 'verse'){}
    }

}

class sectionBlockRendering {

    constructor(canvas){
        this.canvas = canvas
    }

    render(data, songID){
        this.canvas.selectAll('rect.' + songID)
            .data(data, d => d.id)
            .join('rect')
            .attr('class', songID)
            .attr('id', d => d.id)
            .attr('width', 12)
            .attr('height', 12)
            .attr('x', (d, i) => d.stackNumber * 15)
            .attr('y', (d, i) => d.positionInStack * -15 + 80)
            //.attr('fill', '#A9A9A9')
            .attr('fill', 'white')
            .attr('opacity', 0.25)
    }

    getAttributes(thisSection, nextSection){
        if(thisSection.type === 'intro'){
            if(thisSection.formLabel === nextSection.formLabel){
                thisSection.stackNumber = nextSection.stackNumber
                if(nextSection.type === 'verse'){
                    thisSection.stackLevel = 1
                } else if (nextSection.type === 'chorus'){
                    thisSection.stackLevel = 2
                }
            }
        }
    }

}

class sectionBlockSizing {

    static calculateHeight(formOverlap){
        switch(formOverlap){
     

        }
    }

    static calculateWidth(){

    }



}




