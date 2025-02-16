


class songSectionRendering {
    static setupStacks(song, templateSong){
        let stackNumber = 0
        const stacks = []
        let currentStack = []

        for(let i = 0; i < templateSong.structure.length; i++){
            const section = templateSong.structure[i]

            if(section.sequence === 1){
                currentStack.push(section)
                stacks[stackNumber] = currentStack
            } else if (section.constructor.type === 'verse'){

            }


            
           

        }
    }

    static calculateStackNumberForVerse (thisVerse, allVerses){
        const thisVerseIndex = allVerses.findIndex(section => section.verse === thisVerse)
        let previousVerse = {}
        try{previousVerse = allVerses[thisVerseIndex - 1]}
        catch{}
    }

    static getPreviousSectionOfType(thisSection, allSections){
        
    }






     

    
    

   
}