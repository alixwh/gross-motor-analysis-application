<template>
    <div class="card" :class="{ editing: editing }" style="width: 18rem;">
        <div class="card-body">
            <div v-if="editing && selectedRange">
                <label for="label">Label</label>
                <input id="label" type="text" class="form-control" v-model="selectedRange.label">
                <label for="start">Start</label>
                <input id="start" type="number" class="form-control" v-model="selectedStartValue">
                <label for="end">End</label>
                <input id="end" type="number" class="form-control" v-model="selectedEndValue">
            </div>
            <div v-else>
                <h5 class="card-title">
                    {{ selectedRange?.label }}
                </h5>
                <h6 class="card-subtitle mb-2 text-body-secondary">
                    Start: {{ (selectedRange!.start * duration!).toFixed(2) }}
                </h6>
                <h6 class="card-subtitle mb-2 text-body-secondary">
                    End: {{ (selectedRange!.end * duration!).toFixed(2) }}
                </h6>
            </div>
            <button v-if="editing" class="btn btn-success" @click="handleEditing(false)">Save</button>
            <button v-else class="btn btn-warning" @click="handleEditing(true)">Edit</button>
            <button class="btn btn-danger" @click="$emit('deleteRange', selectedRange?.id)">Delete</button>
            <button class="btn btn-secondary"
                @click="downloadFromRange(selectedRange!.start * duration!, selectedRange!.end * duration!)">Download</button>
        </div>
    </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue';
import store from '../../store';
import { getPositionsBetweenFrames } from '../../composables/predictVideo';
import { writeToFile } from '../../composables/writeToFile';
const props = defineProps<{ selectedRange?: VideoSection, duration?: number; }>();
defineEmits(['deleteRange']);

const editing = ref<boolean>(false);
const handleEditing = (value: boolean) => {
    editing.value = value;
};

const downloadFromRange = (start: number, end: number) => {
    console.log();

    const d = getPositionsBetweenFrames(Math.floor(start * 10), Math.floor(end * 10));
    writeToFile(d, store.state.myGlobalVariable + '-' + start.toPrecision(2) + '-' + end.toPrecision(2));
};

const selectedStartValue = computed({
    get: () => props.selectedRange!.start * props.duration! || 0,
    set: (value) => props.selectedRange!.start = value / props.duration!
});


const selectedEndValue = computed({
    get: () => props.selectedRange!.end * props.duration! || 0,
    set: (value) => props.selectedRange!.end = value / props.duration!
});


</script>
<style scoped>
.card {
    margin: 30px;
}

.editing {
    text-align: left;
}

.btn {
    margin: 5px;
}
</style>