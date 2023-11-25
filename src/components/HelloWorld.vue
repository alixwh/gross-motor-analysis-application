<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { PoseLandmarker, FilesetResolver, DrawingUtils, NormalizedLandmark } from '@mediapipe/tasks-vision'

const landmarkDescriptions = [ 'nose', 'left eye (inner)', 'left eye', 'left eye (outer)', 'right eye (inner)', 'right eye', 'right eye (outer)', 'left ear', 'right ear', 'mouth (left)', 'mouth (right)', 'left shoulder', 'right shoulder', 'left elbow', 'right elbow', 'left wrist', 'right wrist', 'left pinky', 'right pinky', 'left index', 'right index', 'left thumb', 'right thumb', 'left hip', 'right hip', 'left knee', 'right knee', 'left ankle', 'right ankle',
  'left heel', 'right heel', 'left foot index', 'right foot index'
];
let selected = ref<number[]>([]);
let landmarks: NormalizedLandmark[][] = [];
const videoFile = ref(undefined);
const canvasImageDataUrl = ref("");
let angle = ref(0);

const handleVideoUpload = (event: any) => {
  videoFile.value = event.srcElement.files[ 0 ].path;
}

const videoFileUploaded = computed(() => {
  if (videoFile.value) {
    return 'my-magic-protocol://getMediaFile/' + videoFile.value;
  }
  return videoFile.value;
});

let poseLandmarker: PoseLandmarker | undefined = undefined;
const createPoseLandmarker = async () => {
  const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.6/wasm");
  poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/1/pose_landmarker_heavy.task`,
      delegate: "GPU"
    },
    runningMode: 'VIDEO',
    numPoses: 1
  });
};
createPoseLandmarker();
let video: HTMLVideoElement | undefined = undefined;
let webcamVideo: HTMLVideoElement | undefined;
const webcamEnabled = ref(false);
let canvasElement: HTMLCanvasElement | undefined = undefined;
let canvasCtx: CanvasRenderingContext2D | null = null;
let drawingUtils: DrawingUtils | undefined = undefined;
let enableWebcamButton: HTMLButtonElement;
let stream: MediaStream;

onMounted(() => {
  canvasElement = document.getElementById(
    "output_canvas"
  ) as HTMLCanvasElement;
  canvasCtx = canvasElement.getContext("2d");
  drawingUtils = new DrawingUtils(canvasCtx!);

  const hasGetUserMedia = () => !!navigator.mediaDevices?.getUserMedia;
  // If webcam supported, add event listener to button for when user wants to activate it.
  if (hasGetUserMedia()) {
    enableWebcamButton = document.getElementById("webcamButton") as HTMLButtonElement;
    enableWebcamButton.addEventListener("click", enableCam);
  } else {
    console.warn("getUserMedia() is not supported by your browser");
  }
})


const playbackRatesOptions = [ 0.5, 0.75, 1, 1.5, 1.75, 2 ];
const calculateDistance = (x1: number, y1: number, x2: number, y2: number) => {
  const dx = x1 - x2;
  const dy = y1 - y2;
  return Math.sqrt(dx * dx + dy * dy);
}
const clickOnLandmark = () => {
  console.log("smt");
  canvasElement!.addEventListener('click', (event: any) => {
    console.log("seal");

    const normalizedX = event.offsetX / canvasElement!.width;
    const normalizedY = event.offsetY / canvasElement!.height;
    if (landmarks.length) {
      let closestLandmarkIndex = -1;
      let minDistance = 0.01;
      for (let i = 0; i < landmarks[ 0 ].length; i++) {
        const landmark = landmarks[ 0 ][ i ];
        const distance = calculateDistance(normalizedX, normalizedY, landmark.x, landmark.y);
        if (distance < minDistance) {
          minDistance = distance;
          closestLandmarkIndex = i;
        }
      }
      if (closestLandmarkIndex !== -1) {
        if (!selected.value.includes(closestLandmarkIndex)) {
          selected.value.push(closestLandmarkIndex)
        } else {
          selected.value.splice(selected.value.indexOf(closestLandmarkIndex), 1)
        }
        lastVideoTime -= 0.1;
        window.requestAnimationFrame(predictVideo);
      }
    }

  })
}

const calculateAngle = (A: NormalizedLandmark, B: NormalizedLandmark, C: NormalizedLandmark) => {
  // console.log("coordinates");
  // console.log(A);
  // console.log(B);
  // console.log(C);
  // console.log("_______________");
  // let BA = calculateDistance(B.x, B.y, A.x, A.y);
  // let BC = calculateDistance(B.x, B.y, C.x, C.y);
  // let AC = calculateDistance(A.x, A.y, C.x, C.y);
  // angle.value = Math.acos((BA * BA + BC * BC - AC * AC) / (2 * BA * BC))
  // console.log("distances");
  // console.log("BA: " + BA);
  // console.log("BC: " + BC);
  // console.log("AC: " + AC);
  // console.log("_______________");
  // angle.value = angle.value * 180 / Math.PI;
  // if (angle.value < 0) {
  //     angle.value = 180 + angle.value};
  // console.log("angle: " + ang);
  // console.log("_______________");
  // return ang;


  // if(A.x==0 || B.x==0 || C.x==0) {
  //       return 0}
  //   let numerator = B.y * (A.x - C.x) + A.y * (C.x - B.x) + C.y * (B.x - A.x);
  //   let denominator = (B.x - A.x) * (A.x - C.x) + (B.y - A.y) * (A.y - C.y);
  //       angle.value = Math.atan(numerator/denominator);
  //       angle.value = angle.value * 180 / Math.PI;

  // let temp = Math.atan2(C.y - B.y, C.x - B.x) - Math.atan2(A.y - B.y, A.x - B.x);
  // angle.value = temp * 180 / Math.PI;
  //       if (angle.value < 0) {
  //           angle.value = 360 + angle.value;}
  //       return angle;


  angle.value = Math.atan2(C.y - B.y, C.x - B.x) - Math.atan2(A.y - B.y, A.x - B.x);
  angle.value = Math.abs(angle.value * 180 / Math.PI);
  if (angle.value > 200) { // aga hüpermobiilsus
    angle.value = 360 - angle.value;
  }
  console.log(angle.value);
}

let lastVideoTime = -1;
const predictVideo = () => {
  let startTimeMs = performance.now();
  if (lastVideoTime !== videoElement.value!.currentTime) {
    if (lastVideoTime == -1) {
      videoElement.value!.pause();
      console.log('loading');
      videoElement.value!.currentTime = 0;
      clickOnLandmark()
    }
    lastVideoTime = videoElement.value!.currentTime;
    poseLandmarker!.detectForVideo(videoElement.value!, startTimeMs, (result) => {
      canvasCtx!.save();
      canvasCtx!.clearRect(0, 0, canvasElement!.width, canvasElement!.height);
      landmarks = result.landmarks
      drawingUtils!.drawConnectors(result.landmarks[ 0 ], PoseLandmarker.POSE_CONNECTIONS);
      if (result.landmarks[ 0 ]) {
        result.landmarks[ 0 ].forEach((landmark, index) => {
          const color = selected.value.includes(index) ? 'red' : 'white'
          drawingUtils!.drawLandmarks([ landmark ], {
            radius: (data) => DrawingUtils.lerp(data.from!.z, -0.15, 0.1, 8, 1),
            color: color
          });

        })
      }
      canvasCtx!.restore();
      canvasImageDataUrl.value = canvasElement!.toDataURL();
      if (selected.value.length == 3) {
        let x2 = selected.value;
        let x = result.landmarks[ 0 ];
        calculateAngle(x[ x2[ 0 ] ], x[ x2[ 1 ] ], x[ x2[ 2 ] ]);
      }
    });
    if (lastVideoTime == 0) {
      videoElement.value!.play();
    }
  }
  if (isPlaying.value) {
    window.requestAnimationFrame(predictVideo);
  }
}

async function predictWebcam() {
  let startTimeMs = performance.now();
  if (lastVideoTime !== webcamVideo!.currentTime) {
    lastVideoTime = webcamVideo!.currentTime;
    poseLandmarker!.detectForVideo(webcamVideo!, startTimeMs, (result) => {
      canvasCtx!.save();
      canvasCtx!.clearRect(0, 0, canvasElement!.width, canvasElement!.height);
      landmarks = result.landmarks
      drawingUtils!.drawConnectors(result.landmarks[ 0 ], PoseLandmarker.POSE_CONNECTIONS);
      if (result.landmarks[ 0 ]) {
        result.landmarks[ 0 ].forEach((landmark, index) => {
          const color = selected.value.includes(index) ? 'red' : 'white'
          drawingUtils!.drawLandmarks([ landmark ], {
            radius: (data) => DrawingUtils.lerp(data.from!.z, -0.15, 0.1, 8, 1),
            color: color
          });

        })
      }
      canvasCtx!.restore();
      canvasImageDataUrl.value = canvasElement!.toDataURL();
      if (selected.value.length == 3) {
        let x2 = selected.value;
        let x = result.landmarks[ 0 ];
        calculateAngle(x[ x2[ 0 ] ], x[ x2[ 1 ] ], x[ x2[ 2 ] ]);
      }
    });
  }
  if (isPlaying.value === true) {
    window.requestAnimationFrame(predictWebcam);
  }
}

function enableCam() {
  webcamVideo = document.getElementById("videoElement") as HTMLVideoElement;
  if (!poseLandmarker) {
    console.log("Wait! poseLandmaker not loaded yet.");
    return;
  }

  if (isPlaying.value === true) {
    isPlaying.value = false;
    webcamEnabled.value = false;
    webcamVideo.style.display = "none";
    enableWebcamButton.innerText = "ENABLE PREDICTIONS";

  } else {
    isPlaying.value = true;
    webcamEnabled.value = true;
    webcamVideo.style.display = "block";
    enableWebcamButton.innerText = "DISABLE PREDICTIONS";
    clickOnLandmark()
  }

  // getUsermedia parameters.
  const constraints = {
    video: true
  };
  // Activate the webcam stream.
  if (isPlaying.value === true) {
    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      console.log("in get user media");
      ;
      webcamVideo!.srcObject = stream;
      webcamVideo!.addEventListener("loadeddata", predictWebcam);

    });
  } else {
    stream = webcamVideo.srcObject as MediaStream;
    stream.getTracks().forEach((track) => track.stop());
  };
}

// video player:
const videoElement = ref<HTMLVideoElement | null>(null);
const isPlaying = ref(false);
const playPause = () => {
  if (videoElement.value) {
    if (videoElement.value.paused) {
      videoElement.value.play();
    } else {
      videoElement.value.pause();
    }
  }
};
const rewind = () => {
  if (videoElement.value) {
    videoElement.value.currentTime -= 5;
  }
};
const fastForward = () => {
  if (videoElement.value) {
    videoElement.value.currentTime += 5;
  }
};
const onPlay = () => {
  isPlaying.value = true;
  predictVideo()
};
const onPause = () => {
  isPlaying.value = false;
};
const ontimeupdate = () => {
  if (!isPlaying.value) {
    predictVideo();
  }

}
</script>

<template>
  <div class="container">
    <label class="btn btn-secondary" for="file">CHOOSE FILE</label>
    <input id="file" type="file" accept="video/mp4" v-on:change="handleVideoUpload" style="display:none">
    <button class="btn btn-secondary" id="webcamButton">ENABLE WEBCAM</button>
  </div>
  <div v-show="videoFileUploaded || webcamEnabled">
    <div class="container">
      <div class="video">
        <video ref="videoElement" id="videoElement" width='960' height='540' :src="videoFileUploaded" @play="onPlay"
          @pause="onPause" @timeupdate="ontimeupdate" autoplay playsinline></video>
        <div class="controls">
          <button class="video_control_button" @click="rewind">&#171;</button>
          <button class="video_control_button" @click="playPause">
            <span v-if="!isPlaying">▶</span>
            <span v-else>◼</span>
          </button>
          <button class="video_control_button" @click="fastForward">&#187;</button>
        </div>
        <canvas class="output_canvas" id="output_canvas" width="960" height="540"></canvas>
      </div>
      <img :src="canvasImageDataUrl" alt="Canvas Result" v-show="videoFileUploaded || webcamEnabled" />
    </div>
    <ul>Selected:
      <li v-for="id in selected">{{ landmarkDescriptions.at(id) }}</li>
    </ul>
    <div>Angle: {{ angle.toFixed(2) }}</div>
  </div>
</template>
<style scoped>
.container {
  display: flex;
  gap: 10%;
}

.btn {
  margin: 0px;
}

.video {
  position: relative;
}

.controls {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
}


.video_control_button {
  background-color: none;
  border: none;
  cursor: pointer;
  font-size: 24px;
  margin: 0 10px;
  padding: 5px;
}

.output_canvas {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 100
}

img {
  background-color: #1a1a1a;
  margin-left: 15px;
  height: 80%;
  width: 80%;
}

ul {
  color: black;
  list-style: none;
}

li {
  color: black;
}
</style>
