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
    svg.selectAll('g')
        .data(songs, songs.id)
        .join('g')
        .attr('id', d => d.id)
        
}

