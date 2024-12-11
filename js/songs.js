class songsDataHandling {
    static load(){
        this.#setSongs()
        this.#setupItentionAndTheAct()
    }

    static getSongs(){
        return this.songs
    }

    static getSong(title){
        return this.songs.find(song => song.title === title)
    }

    static addLyric(songTitle, text){
        const thisSong = this.getSong(songTitle)
        thisSong.lyrics.push(new lyric(text))
    }

    static #setSongs(){
        this.songs = [
            new song ('ton of nothing'),
            new song ('intention and the act'),
            new song ('toiling avoiding')
        ]
    }

    static #setupItentionAndTheAct(){

        const title = 'intention and the act'
    
        const stanza = [
            'you carry callous thoughts',
            'and moral stones to talk with',
            'judge post haste',
            'and with careless aim',
            'so you send them spinning at my face'
        ]
    
        stanza.forEach(line => songsDataHandling.addLyric(title, line))
    
    }

}

class song {
    constructor(title){
        this.title = title
        this.lyrics = []
    }
}

class lyric {
    constructor(text){
        this.text = text
    }

}
