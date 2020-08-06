var player;
var timerId;
var lastPlayerTime = 0;
var loopStart = 0;
var loopEnd = 0;
var loop = false;

function onYouTubeIframeAPIReady() {            
    player = new YT.Player('playerElement', {
        
        height: '100%',
        width: '100%',
        playerVars: {
            autoplay: '0',
            controls: '1',
            enablejsapi: '1',
            fs: '0',
            rel: '0',
            showinfo: '0',
            iv_load_policy: '3',
            modestbranding: '1',
            cc_load_policy: '0'
        },
        events: {
            onReady: function(event) { 
                player.loadVideoById('wgg5Tch0-Hs', 0)
            },
            onStateChange: function(event) { sendPlayerStateChange(event.data) },
            onError: function(error) { console.log(error) }
        }
    });
    
    initialize()
}


function sendPlayerStateChange(playerState) {
    clearTimeout(timerId);
    if (YT.PlayerState.PLAYING === playerState) {
        timerId = setInterval(function() {
            onCurrentSecond( player.getCurrentTime() )
        }, 100 );
    }
}

function onCurrentSecond(time) {
    if (loop && (time + 0.1) >= loopEnd) {
        console.log(`Looping now: ${time} >= ${loopEnd}`)
        seek(loopStart)
    }

    lastPlayerTime = time
    const colonString = fractionalSecondToColonMsString(time)
    document.getElementById('playerTime').innerHTML = 'Current player time: ' + colonString;
}

function fractionalSecondToColonMsString(time) {
    const totalSeconds = Math.floor(time)
    const minutes = Math.floor(totalSeconds / 60.0)
    let remainingSeconds = totalSeconds % 60
    let milliseconds = Math.round((time - totalSeconds) * 10)
    if (milliseconds >= 10) {
        remainingSeconds++
        milliseconds = 0
    }
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}.${milliseconds}`
}

function colonMsStringToFractionalSecond(time) {
    const timeParts = time.split(':')
    const secsString = timeParts[timeParts.length - 1]
    const minsString = timeParts.length > 1 ? timeParts[timeParts.length - 2] : "0"
    const secs = parseFloat(secsString)
    const mins = parseInt(minsString)
//      console.log(`Converting ${time} to secs: ${minsString} = ${mins} - ${secsString} = ${secs}`)
    const fracSecs = mins * 60 + secs
//    console.log(`Returning converted: ${fracSecs}`)
    return fracSecs
}

function initialize() {
    document.getElementById("start_settoplayer").addEventListener("click", 
        function() {setTime("start", lastPlayerTime)});
    document.getElementById("end_settoplayer").addEventListener("click",
        function() {setTime("end", lastPlayerTime)});

    document.getElementById("start_seek").addEventListener("click",
        function() {seekToInputId("start")});
    document.getElementById("end_seek").addEventListener("click",
        function() {seek(getTime("end") - 1)});
        
    document.getElementById("start_minus").addEventListener("click", 
        function() {fineTuneTime("start", false)});
    document.getElementById("start_plus").addEventListener("click", 
        function() {fineTuneTime("start", true)});
    document.getElementById("end_minus").addEventListener("click", 
        function() {fineTuneTime("end", false)});
    document.getElementById("end_plus").addEventListener("click", 
        function() {fineTuneTime("end", true)});
    document.getElementById("loop_phrase").addEventListener("click", 
        function() {toggleLoop()});
    document.getElementById("form_editor").addEventListener("submit", onFormSubmit);
    document.getElementById("url_text").addEventListener("input", onFormSubmit);

    document.getElementById("start").addEventListener("input", function() 
    {
        loopStart = getTime("start")
    });
    document.getElementById("end").addEventListener("input", function() {
        loopEnd = getTime("end")
    });
}

function fineTuneTime(inputId, isAdd) {
    const fracSecs = getTime(inputId)
    const newVal = isAdd ? fracSecs + 0.1 : fracSecs - 0.1
    if (newVal < 0) return
    setTime(inputId, newVal)
}

function setTime(inputId, time) {
    if (inputId === "start") {
        loopStart = time
    } else if (inputId == "end") {
        loopEnd = time
    }
    const newTimeString = fractionalSecondToColonMsString(time)
    document.getElementById(inputId).value = newTimeString
    seek(time)
}

function getTime(inputId) {
    const timeString = document.getElementById(inputId).value
    const time = colonMsStringToFractionalSecond(timeString)
    return time
}

function seekToInputId(inputId, time) {
    seek(getTime(inputId))
}

function seek(time) {
    player.seekTo(time)
}

function toggleLoop() {
    loop = !loop
    setIsLooping(loop)
}

function setIsLooping(loop) {
    document.getElementById("loop_phrase").innerHTML = loop ? "Stop looping" : "Loop phrase"
    if (loop) {
        loopStart = getTime("start")
        loopEnd = getTime("end")
        seek(loopStart)
    }
}

function onFormSubmit(event) {
    event.preventDefault();
    const urlVal = document.getElementById("url_text").value
    const vidId = urlVal.match(/[A-Za-z0-9_-]{11}/g)
    if (vidId[0]) {
        player.loadVideoById(vidId[0], 0)
        setIsLooping(false)
    }
}