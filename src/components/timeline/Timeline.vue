<template>
  <div class="timeline" ref="timeline" @mouseup="stopResizing" @mousemove="resizeRange($event)"
    @mousedown="startRangeCreation">
    <TimelineRuler :duration="duration" @video-time="handleRulerTimeUpdate"></TimelineRuler>
    <div class="markers" ref="markers">
      <div class="timeline-marker" v-for="range in ranges" :key="range.id" :style="getMarkerStyle(range)"
        @click="selectRange(range.id)" :class="{ 'selected': isSelectedRange(range.id) }">
        <div class="resize-handle start" @mousedown.stop="startResizing(range, true, $event)"><i
            class="bi bi-three-dots-vertical"></i>
        </div>
        <label class="label">{{ range.label }}</label>
        <div class="resize-handle end" @mousedown.stop="startResizing(range, false, $event)"><i
            class="bi bi-three-dots-vertical"></i>
        </div>
      </div>
    </div>
    <div class="current-time-indicator" :style="{ left: currentTimeIndicatorPosition }"></div>
  </div>
  <div v-if="selectedRangeId != null">
    <RangeCard :duration="duration" v-bind:selectedRange="selectedRange" @deleteRange="deleteRange"></RangeCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import TimelineRuler from './TimelineRuler.vue'
import RangeCard from './RangeCard.vue';
const ranges = ref<VideoSection[]>([]);
const lastId = ref<number>(-1);
const timeline = ref<HTMLDivElement | null>(null);
const markers = ref<HTMLDivElement | null>(null);
const selectedRangeId = ref<number | null>(null);
const resizingRangeId = ref<number>(-1);
const resizingEdgeIsStart = ref<boolean | undefined>(undefined);
const offsetX = ref(0);
const emit = defineEmits(['videoTime']);
const props = defineProps<{
  duration?: number;
  currentTime?: number;
}>()


const selectRange = (rangeId: number) => {
  selectedRangeId.value = rangeId;
};

const deleteRange = (rangeId: number) => {
  if (selectedRangeId.value == rangeId) {
    selectedRangeId.value = null;
  }
  ranges.value = ranges.value.filter(obj => obj.id !== rangeId);
};

const isSelectedRange = (rangeId: any) => {
  return selectedRangeId.value === rangeId;
};

const startResizing = (range: VideoSection, isStart: boolean, e: any) => {
  e.preventDefault();
  resizingRangeId.value = range.id;
  resizingEdgeIsStart.value = isStart;
  offsetX.value = timeline.value?.getBoundingClientRect().left!;
};

const resizeRange = (e: any) => {
  if (resizingRangeId.value !== -1) {
    const timelineElement = timeline.value;
    const mouseX = e.clientX - offsetX.value;
    const range = ranges.value.find((range) => range.id == resizingRangeId.value)
    if (range) {
      if (resizingEdgeIsStart.value) {
        range.start = Math.max(0, Math.min(range.end - 0.01, mouseX / timelineElement!.clientWidth));
        if (props.duration) {
          emit('videoTime', range.start * props.duration);
        }
      } else if (resizingEdgeIsStart.value == false) {
        range.end = Math.min(1, Math.max(range.start + 0.01, mouseX / timelineElement!.clientWidth));
        if (props.duration) {
          emit('videoTime', range.end * props.duration);
        }
      }
    }
  }
};
const stopResizing = () => {
  resizingRangeId.value = -1;
  resizingEdgeIsStart.value = undefined;
  offsetX.value = 0;
  creatingNewRange = false;
};

const selectedRange = computed(() => {
  return ranges.value.find((range) => range.id === selectedRangeId.value);
});

let creatingNewRange = false;
let newRangeStart = 0;
let newRangeEnd = 0;

const addRange = () => {
  creatingNewRange = true;
  const timelineElement = markers.value;
  if (timelineElement) {
    timelineElement.classList.add('highlighted-timeline');
  }
  setTimeout(() => {
    if (timelineElement) {
      timelineElement.classList.remove('highlighted-timeline');
      creatingNewRange = false;
    }
  }, 3000);
}
const startRangeCreation = (event: MouseEvent) => {
  if (creatingNewRange) {
    markers.value?.classList.remove('highlighted-timeline')
    newRangeStart = event.offsetX / timeline.value!.clientWidth;
    newRangeEnd = newRangeStart;
    const newId = lastId.value += 1;
    lastId.value = newId;
    const newSection = { id: newId, start: newRangeStart, end: newRangeEnd, label: 'Range' + newId } as VideoSection
    ranges.value.push(newSection)
    selectedRangeId.value = newId;
    resizingRangeId.value = newId;
    resizingEdgeIsStart.value = false;
    startResizing(newSection, false, event)
  }
}
const handleRulerTimeUpdate = (e: any) => {
  emit('videoTime', e);

}
const currentTimeIndicatorPosition = computed(() => {
  if (props.duration && props.currentTime) {
    return `${(props.currentTime / props.duration) * 100}%`;
  }
  return '0';
});

const getMarkerStyle = (range: any) => {
  const left = `${range.start * 100}%`;
  const width = `${(range.end - range.start) * 100}%`;
  return { left, width };
};

defineExpose({ addRange });
</script>

<style scoped>

.timeline {
  width: 100%;
  background-color: #4b4b4b;
  position: relative;
  margin-top: 10px;
}

.markers {
  width: 100%;
  height: 90px;
}

.highlighted-timeline {
  background: #999;
  cursor: pointer;
  border: black 5px;
}

.timeline-marker {
  background-color: #e9ecef;
  height: 35px;
  bottom: 12.5px;
  position: absolute;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
}

.label {
  user-select: none;
}

.timeline-marker.selected {
  background-color: #e74c3c;
}

.resize-handle {
  width: 12px;
  height: 100%;
  position: absolute;
  top: 0;
  cursor: ew-resize;
  background-color: white;
  justify-content: center;
  align-items: center;
  display: flex;
}

.resize-handle.start {
  left: -7px;
  border-radius: 5px 0 0 5px;
}

.resize-handle.end {
  right: -7px;
  border-radius: 0 5px 5px 0;
}

.current-time-indicator {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: #3498db;
  z-index: 2;
}
</style>
