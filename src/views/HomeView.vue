<template>
    <Header @upload="handleVideoUpload" @webcam="handleWebcam" @show-angles="showAnglesOnVideo = !showAnglesOnVideo"
        @update-selected-angles="updateSelectedAngles" @downloadCsv="handleDownload" :buttonText="webcamButtonText"></Header>
    <div class="container" v-show="videoSource || webcamEnabled">
        <div class="video">
            <VideoPlayer :videoSrc="videoSource" :stream="stream" @predictVideo="handlePredictVideo"></VideoPlayer>
            <canvas class="output_canvas" ref="canvas" width='640' height='360'></canvas>
            <div v-for="[angleName, angle] in calculatedAngles" :key="angleName">{{ angleName }} : {{ angle }}</div>
        </div>
        <img :src="canvasImageDataUrl" alt="Canvas Result" />
    </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import Header from '../components/Header.vue'
import VideoPlayer from '../components/VideoPlayer.vue'
import {
    detectForVideoOrWebcam,
    getFrameNumber,
    getAllPositions,
    initializeCanvas
} from "../composables/predictVideo";
import { writeToFile } from '../composables/writeToFile';
import { Joint } from '../jointsData';
import store from '../store'
let selectedAngles: Joint[] = [];
let showAnglesOnVideo: boolean = true;
const videoSource = ref<undefined | string>(undefined);
const stream = ref<undefined | MediaStream>(undefined);
const webcamEnabled = ref<boolean>(false);
const webcamButtonText = ref<string>('Enable')
const videoElement = ref<undefined | HTMLVideoElement>(undefined);
const canvas = ref<HTMLCanvasElement | undefined>(undefined);
const canvasImageDataUrl = ref("");
const currentFrame = ref<number>(0);
const lastFrame = ref<number>(-1);
const videoName = ref<string>('');

const handleDownload = () => {
    const f = getAllPositions();
    writeToFile(f, videoName.value);
}
const calculatedAngles = ref<Map<string, number>>(new Map());
const hasGetUserMedia = () => !!navigator.mediaDevices?.getUserMedia;

const updateSelectedAngles = (newAngles: Joint[]) => {
    selectedAngles = newAngles;
}

const handleVideoUpload = (source: string, name: string) => {
    videoSource.value = 'my-magic-protocol://getMediaFile/' + source;
    videoName.value = name.slice(0, name.lastIndexOf('.')) + '_' + new Date().toLocaleDateString('en-GB');
    store.dispatch('updateGlobalVariable', videoName.value);
    lastFrame.value = -1;
    stream.value = undefined;
    if (webcamEnabled.value) {
        handleWebcam();
    }
}
const handleWebcam = () => {
    if (hasGetUserMedia()) {
        webcamEnabled.value = !webcamEnabled.value; // switches on or off
        webcamButtonText.value = webcamEnabled.value ? 'Disable' : 'Enable';
        if (webcamEnabled.value) {
            lastFrame.value = -1;
            navigator.mediaDevices.getUserMedia({ video: true }).then((videoStream) => {
                videoSource.value = undefined;
                stream.value = videoStream;
            });
        } else {
            webcamEnabled.value = false;
            const stream = videoElement.value!.srcObject as MediaStream;
            stream?.getTracks()?.forEach((track) => track.stop());
        }
    } else {
        console.warn("getUserMedia() is not supported by your browser");
    }
}

const handlePredictVideo = (htmlVideoElement: HTMLVideoElement) => {
    if (videoElement.value === undefined) {
        videoElement.value = htmlVideoElement;
    }
    console.log('handlepredictvideo');
    predict();
}
const predict = () => {
    currentFrame.value = getFrameNumber(videoElement.value!);
    if (currentFrame.value !== lastFrame.value) {
        if (lastFrame.value == -1) {
            console.log("loading");
            videoElement.value?.pause();
            initializeCanvas(videoElement.value!, canvas.value!, webcamEnabled.value);
        }
        calculatedAngles.value = detectForVideoOrWebcam(performance.now(), currentFrame.value, selectedAngles, showAnglesOnVideo);
        if (lastFrame.value === -1) {
            videoElement.value?.play();
        }
        lastFrame.value = currentFrame.value;
        canvasImageDataUrl.value = canvas.value!.toDataURL();
    }
    calculatedAngles.value = detectForVideoOrWebcam(performance.now(), currentFrame.value, selectedAngles, showAnglesOnVideo);
    if (!videoElement.value?.paused) {
        window.requestAnimationFrame(predict);
    }
}
</script>
<style scoped>
.container {
    display: flex;
    left: 0;
    margin-top: 2%;
}

.video {
    position: relative;
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
</style>