class songBlocksDataHandling {

}


class songBlock {
    constructor(id, groupID){
        this.id = id
        this.groupID = groupID
    }
}

class melodyBlock extends songBlock {
    constructor(item){
        super(item.blockID + 'Melody', item.blockGroupID)
        this.peakNote = new note (item.peakNote)
        this.endNote = new note (item.endNote)
    }
}

class progressionBlock extends songBlock {
    constructor(item, progressionArray){
        super(item.blockID + 'Progression', item.blockGroupID)
        this.chords = []
        this.setChords(progressionArray)   
    }   

    setChords(progressionArray){
        progressionArray.forEach(item => {
            this.chords.push(new chord (item.chordName, item.chordLengthInBeats))
        })
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