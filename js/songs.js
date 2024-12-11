class songsDataHandling {
    static load(){
        this.#setSongs()
    }

    static getSongs(){
        return this.songs
    }

    static getSong(title){

    }

    static addLyric(song, words){
        thissongs.lyrics.push(words)

    }

    static #setSongs(){
        this.songs = [
            new song ('ton of nothing'),
            new song ('intention and the act'),
            new song ('toiling avoiding')
        ]
    }

}

class song {
    constructor(title){
        this.title = title
    }
}

class lyric {
    constructor(phrase){
        this.phrase = phrase
    }



}


function setupItentionAndTheAct(songIATA){

}
