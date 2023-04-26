<template>
  <div>  
    <b-card-group columns 
     style="max-width: 50rem;">
      <b-card v-if="card.locationType!='unused'" 
      >
        <b-card-text>{{card.rank}}{{card.suit}}</b-card-text>
      </b-card>
    </b-card-group>
  </div>

</template>

<script setup lang="ts">
import { formatCard,Card, areCompatible } from "../../../server/model"

// props
interface Props {
  card?: Card
}

// default values for props
const props = withDefaults(defineProps<Props>(), {
  card: undefined,
  legalToPlay:undefined
})





//let legalToPlay= 

// events
const emit = defineEmits<{
  (e: 'change', undoRedoIndex: number): void
}>()

function undoRedo(undoRedoIndex: number) {
  emit("change", undoRedoIndex)
}
</script>