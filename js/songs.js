function getSongs(){
    return [
        new song ('ton of nothing'),
        new song ('intention and the act'),
        new song ('toiling avoiding')
    ]
}

class song {
    constructor(name){
        this.name = name
    }
}