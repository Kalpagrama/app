<template lang="pug">
div(
  :style=`{
    minHeight: '70px',
  }`
  ).row.full-width
  //- header
  div(
    :style=`{
      position: 'relative',
      minHeight: '70px',
    }`
    ).row.full-width.items-start.content-start.q-px-md
    .col.full-height
      edit-name(:node="node")
    q-btn(
      v-if="isOpened"
      @click="$emit('toggle')"
      round flat color="white"
      :icon="'keyboard_arrow_down'"
      ).q-mt-md
    q-btn(
      v-else
      @click="$emit('toggle')"
      flat color="white" no-caps
      ).q-mt-md Далее
  div(
    v-if="isOpened"
    :style=`{}`
    ).row.full-width
    edit-spheres(:node="node")
    actions(:node="node" :player="player" :contentKalpa="contentKalpa")
</template>

<script>
import editName from './edit_name.vue'
import editSpheres from './edit_spheres.vue'
import actions from './actions.vue'

export default {
  name: 'nodeEditor',
  props: ['player', 'contentKalpa', 'isOpened'],
  components: {
    editName,
    editSpheres,
    actions,
  },
  data () {
    return {
      node: {
        name: '',
        layout: 'HORIZONTAL',
        items: [],
        vertices: [],
        spheres: [],
        category: 'FUN',
      }
    }
  }
}
</script>
