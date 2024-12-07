class songsDataHandling {
    static load(){
        this.#setSongs()
    }

    static getSongs(){
        return this.songs
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
    constructor(name){
        this.name = name
    }
}