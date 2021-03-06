// Polyphonic Synth Tone generator based on WebAudio
// (very) inspired by https://devdocs.io/dom/web_audio_api/simple_synth

function initSynth(){

  const NOTES = [ 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B' ];
  
  const audioContext = new (window.AudioContext || window.webkitAudioContext);
  
  function makeCustomWaveform() {
    const sineTerms = new Float32Array([0, 0, 1, 0, 1]);
    const cosineTerms = new Float32Array(sineTerms.length);
    return audioContext.createPeriodicWave(cosineTerms, sineTerms);
  }
  
  var patches = [
    { type: 'sine' },
    { type: 'square' },
    { type: 'sawtooth' },
    { type: 'triangle' },
    { type: 'custom', apply: osc => osc.setPeriodicWave(makeCustomWaveform()) },
  ];
  
  var currentPatch = 2;

  function switchPatch() {
    currentPatch = (currentPatch + 1) % patches.length;
  }
  
  function playTone({ freq, velocity }, patch = patches[currentPatch]) {
    const osc = audioContext.createOscillator();
    const masterGainNode = audioContext.createGain();
    masterGainNode.connect(audioContext.destination);
    // masterGainNode.gain.value = 1.0;
    masterGainNode.gain.value = velocity / 127;
    osc.connect(masterGainNode);
    if (patch.apply) {
      patch.apply(osc);
    } else {
      osc.type = patch.type;
    }
    osc.frequency.value = freq;
    osc.start();
    return osc;
  }

  function playNote({ note, octave, velocity }, patch) {
    console.log('synth.playNote', { note, octave, velocity });
    const freq = 440 * Math.pow(Math.pow(2, 1 / 12), ((octave - 4) * 12) + NOTES.indexOf(note));
    return playTone({ freq, velocity }, patch);
  }

  return {
    playTone,
    playNote,
    switchPatch,
  };
}
