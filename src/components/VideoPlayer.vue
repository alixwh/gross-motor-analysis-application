<template>
    <video ref="videoElement" id="videoElement" width='640' height='360' :src="videoSrc" @play="onPlay" @pause="onPause"
        @timeupdate="ontimeupdate" @loadedmetadata="handleVideoLoaded" autoplay playsinline></video>
    <div class="controls">
        <div class="vontdsadfa">
            <button class="video_control_button" @click="rewind"><i class="bi bi-rewind-fill"></i></button>
            <button class="video_control_button" @click="playPause">
                <i v-if="!isPlaying" class="bi bi-play-fill"></i>
                <i v-else class="bi bi-pause-fill"></i>
            </button>
            <button class="video_control_button" @click="fastForward"><i class="bi bi-fast-forward-fill"></i></button>
        </div>
        <button class="video_control_button addb" @click="addRange" data-bs-toggle="tooltip"
            title="Click on the timeline to add a new range"><i class="bi bi-plus-circle-fill"></i></button>
    </div>
    <div class="timeline_div">
        <Timeline ref="timelineComponent" @video-time="updateTime" :duration="duration" v-bind:current-time="currentTime">
        </Timeline>
    </div>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue';
import Timeline from './timeline/Timeline.vue'

const videoElement = ref<HTMLVideoElement | null>(null);
const isPlaying = ref(false);
const duration = ref<number | undefined>(undefined);
const timelineComponent = ref<InstanceType<typeof Timeline> | null>(null);

const handleVideoLoaded = () => {
    duration.value = videoElement.value?.duration || 1;
};

const props = defineProps<{
    videoSrc?: string,
    stream?: MediaStream
}>()
const emit = defineEmits([ 'predictVideo' ]);

const addRange = () => {
    timelineComponent.value?.addRange();

}
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
    emit('predictVideo', videoElement.value);
};
const onPause = () => {
    isPlaying.value = false;
};
const ontimeupdate = () => {
    if (!isPlaying.value) {
        emit('predictVideo', videoElement.value);
    }
}
const thisInterval = setInterval(function () {
    if (videoElement.value) {
        currentTime.value = videoElement.value.currentTime;
    }
}, 100);

watch(() => props.stream, (newStream) => {
    videoElement.value!.srcObject = newStream!
})

const updateTime = (newTime: number) => {
    videoElement.value!.currentTime = newTime;
}
const currentTime = ref<number | undefined>(undefined)
</script>
<style scoped>
.controls {
    display: flex;
    justify-content: center;
    align-items: center;
    padding-top: 10px;
    padding-bottom: 10px;
    background: #51515a;
    position: relative;
}

.vontdsadfa {
    align-content: center;
}

.video_control_button {
    background-color: inherit;
    border: none;
    cursor: pointer;
    font-size: 24px;
    margin: 0 10px;
    padding: 5px;
}

.addb {
    position: absolute;
    right: 0;
}
</style>