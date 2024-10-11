


function setupSongMap(){


    
    const songMapCanvas = createSVGCanvas('songmap-SVGCanvas', divs.songMap)
    setupSongs()
    
    placeSongs(songMapCanvas, songs)

}

function placeSongs(canvas, songs){

    const dots = d3.range(songs.length).map(() => ({
          x: Math.random() * canvas.attr('width'),
          y: Math.random() * canvas.attr('height')
        }));
      
        canvas.selectAll("circle")
          .data(dots)
          .enter()
          .append("circle")
          .attr("cx", d => d.x)
          .attr("cy", d => d.y)
          .attr("r", 3)
          .attr("fill", "steelblue");

}