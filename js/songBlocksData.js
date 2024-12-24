


class songBlock {
    constructor(id){
        this.id = id
    }
}

class melodyBlock extends songBlock {
    constructor(item){
        super(item.blockID + 'Melody')
        this.kickNote = new note (item.kickNote)
        this.peakNote = new note (item.peakNote)
        this.endNote = new note (item.endNote)
    }
}

class progressionBlock extends songBlock {
    constructor(item){
        super(item.blockID + 'Progression')
        this.chords = []
        this.setChords(item.chords, item.chordLengths)   
    }   

    setChords(chords, chordLengths){
        const chordNameValues = chords.split(';')
        const chordLengthValues = chordLengths.split(';') 
        for(let i = 0; i < chordNameValues.length; i++){
            this.chords.push(new chord (chordNameValues[i], chordLengthValues[i]))
        }
    }
}

class blockDataHandling {

    static getGroupNumber(groupID){
        return groupID.slice(2)
    }

    static getBlockNumberInGroup(blockID){
        const blockTypeIndex = this.#getBlockTypeIndex(blockID)
        return blockID.slice(1, blockTypeIndex)
    }

    static #getBlockTypeIndex(blockID){
        const iMelody = blockID.indexOf('Melody') 
        const iProgression = blockID.indexOf('Progression')
        return iMelody > 0 ? iMelody : iProgression
    }

}