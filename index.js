// This code is adapted from
// https://github.com/TylerPottsDev/yt-js-screen-recorder

let stream = null,
	audio = null,
	mixedStream = null,
	chunks = [], 
	recorder = null
	startButton = null,
	stopButton = null,
	downloadButton = null

async function setupStream () {
	try {
		stream = await navigator.mediaDevices.getDisplayMedia({
			video: true,
      audio: true
		})
		audio = await navigator.mediaDevices.getUserMedia({
			audio: {
				echoCancellation: true,
				noiseSuppression: true,
				sampleRate: 44100,
			},
		})
	} catch (err) {
		console.error(err)
	}
}

async function startRecording () {
	await setupStream()
	if (stream && audio) {
		mixedStream = new MediaStream([...stream.getTracks(), ...audio.getTracks()])
		recorder = new MediaRecorder(mixedStream)
    mixedStream.getVideoTracks()[0].addEventListener('ended', () => stopRecording())
		recorder.ondataavailable = handleDataAvailable
		recorder.onstop = handleStop
		recorder.start(1000)
		startButton.disabled = true
		stopButton.disabled = false
		console.log('Recording started')
	} else {
		console.warn('No stream available')
	}
}

function stopRecording () {
	recorder.stop()
	startButton.disabled = false
	stopButton.disabled = true
}

function handleDataAvailable (e) {
	chunks.push(e.data)
}

function handleStop (e) {
	const blob = new Blob(chunks, { 'type' : 'video/mp4' })
	chunks = []
	downloadButton.href = URL.createObjectURL(blob)
	downloadButton.download = `${Date.now()}.mp4` 
	downloadButton.disabled = false
	stream.getTracks().forEach((track) => track.stop())
	audio.getTracks().forEach((track) => track.stop())
	console.log('Recording stopped')
}

window.addEventListener('load', () => {
	startButton = document.querySelector('.start-recording')
	stopButton = document.querySelector('.stop-recording')
	downloadButton = document.querySelector('.download-video')
	startButton.addEventListener('click', startRecording)
	stopButton.addEventListener('click', stopRecording)
})