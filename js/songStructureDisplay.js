


class songSectionRendering {
    static setupStacks(sections){
        let stackNumber = 0
        sections.forEach(thisSection => {
            stackNumber = stackNumber + this.getStackIncrement(thisSection, previousSection, nextSection)
            thisSection.stackNumber = stackNumber
        });
            
    }

    static getStackIncrement(thisSection, allSections){
        const previousSectionType = this.getSectionTypeBySequenceNumber(thisSection.sequenceNumber - 1, allSections)
        switch(thisSection.constructor.name){
            case 'intro':
                return 0
            case 'verse':
                return this.getStackNumberForVerse(previousSectionType)
            case 'chorus':
                return this.getStackIncrementForChorus(previousSectionType)
            case 'bridge':
            case 'outro':
                return 1
        };
    }

    static getSectionTypeBySequenceNumber(sequenceNumber, sections){
        if(sequenceNumber > 0 && sequenceNumber < sections.length){
            const previousSection = sections.find(section => section.sequence = sequenceNumber)
            return previousSection.constructor.name
        }
    }

    static getStackIncrementForVerse(previousSectionType){
        return previousSectionType === 'intro' ? 0 : 1
    }

    static getStackIncrementForChorus(previousSectionType){
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