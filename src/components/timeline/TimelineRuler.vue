<template>
    <div class="ruler" ref="ruler">
        <div class="ruler-marks" @click="updateTime" v-if="duration">
            <div :class="{ 'ruler-mark': true, 'big': index % ~~(duration/5) === 0 }" v-for="(n, index) in itemCount" :key="index"
                :style="{ left: getMarkPosition(index) }">
                <div class="label">{{ index % ~~(duration/5) === 0 ? formatTime(index) : '' }}</div>
            </div>
        </div>
        <hr class="ruler-line">
    </div>
</template>
  
<script setup lang="ts">
import { computed, ref } from 'vue';
const ruler = ref<HTMLDivElement | undefined>(undefined);
const props = defineProps<{ duration?: number }>();
const emit = defineEmits([ 'videoTime' ]);
const itemCount = computed(() => props.duration ? Math.ceil(props.duration) + 1: 20 );
const getMarkPosition = (index: number) => {
    const spaceBetweenMarks = (ruler.value?.clientWidth!) / props.duration!;
    return `${index * spaceBetweenMarks}px`;
};
const formatTime = (seconds: number) => {
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};
const updateTime = (e: any) => {
    const position = (e.clientX - ruler.value!.getBoundingClientRect()!.left) / ruler.value!.clientWidth
    emit('videoTime', position * props.duration!);
}
</script>
  
<style scoped>
.ruler {
    position: absolute;
    width: 100%;
    height: 30px;
    padding-top: 5px;
    background-color: #4b4b4b;
}

.ruler-marks {
    width: 100%;
    height: 20px;
}

.ruler-mark {
    position: absolute;
    width: 0.5px;
    height: 25%;
    background-color: #ced4da;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.ruler-mark.big {
    height: 60%;
    background-color: #ced4da;
    color: #f0f0f0;
}

.ruler-line {
    width: 100%;
    color: #f0f0f0;
    height: 3px;
    margin: 2px;
}

.label {
    user-select: none;
}
</style>
  