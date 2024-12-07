class songsDataHandling {
    static load(){
        this.#setSongs()
        console.log(this.songs)
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