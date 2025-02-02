window.onload = function(){
    loadSongs()
}

async function loadSongs (){
    const extractor = new csvExtractLoadTransform
    const songsData = await extractor.getAllRecordsFromFile('data/songs.csv')
    const milestonesData = await extractor.getAllRecordsFromFile('data/milestones.csv')
    
    const songs = getSongs(songsData)
    addMilestonesToSongs(milestonesData, songs)

    const div = createDiv('songs', 'absolute')
    const svg = createSVGCanvas ('songs', div)

    const filtered = songs.filter(song => song.milestones !== undefined)
    renderSongMilestones(svg, filtered)
}

function getSongs(songsData){
    let songs = []
    songsData.forEach(songData => {
        songs.push(new song(songData.short_title, songData.title))
    })
    return songs
}

function addMilestonesToSongs(milestonesData, songs){
    const grouped = d3.group(milestonesData, d => d.song_id)
    songs.forEach(song => {
        if(grouped.has(song.id)){
            song.milestones = grouped.get(song.id)
        }
    })
}

function renderSongMilestones(svg, songs){
    const groups = svg.selectAll('g')
        .data(songs, songs.id)
        .join('g')
        .attr('id', d => d.id)
        .attr('transform', (d,i) => getTranslateString(10, i * 50 + 40))
        .append('text')
        .text(d => d.title)

    songs.forEach(song => {
        const thisG = d3.select('g#' + song.id)
        thisG.selectAll('rect')
            .data(song.milestones)
            .join('rect')
            .attr('id', d => d.id)
            .attr('height', 10)
            .attr('width', 10)
            .attr('x', d => {
                const dateObject = new Date(d.date)
                const year = dateObject.getFullYear()
                const month = dateObject.getMonth()
                const day = dateObject.getDate()
                return (year - 2000) * 12 + month
                


            })
    })

}

function getTranslateString(x, y){
    return 'translate(' + x + ',' + y + ')'
}

