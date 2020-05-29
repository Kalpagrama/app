<template lang="pug">
div(
  :style=`{
    position: 'relative',
    borderRadius: '10px',
    overflow: 'hidden',
  }`
  ).column.full-width.b-40
  //- header
  div(:style=`{}`).row.full-width.items-center.content-center.q-pa-md
    q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$emit('close')")
    span(:style=`{fontSize: '16px'}`).text-white.text-bold Layer spheres
  //- body
  .col.full-width
    ws-sphere-list(
      :showHeader="false"
      :showItems="showItemsWs"
      @searchStarted="showItemsWs = true"
      @searchEnded="showItemsWs = false"
      @sphereClick="sphereClickWs"
      @created="sphereCreatedWs"
      ).full-height
      template(v-slot:items=`{items}`)
        .row.full-width
          div(v-if="!showItemsWs").row.full-width.q-px-sm.q-py-md
            draggable(
              :list="spheres" group="spheres" handle=".sphere-drag-handle"
              @start="spheresDragging = true"
              @end="spheresDragging = false").full-width
              div(
                v-for="(s,si) in spheres" :key="si" @click="sphereClick(s)"
                :style=`{
                  position: 'relative',
                  height: '40px',
                  borderRadius: '10px',
                  overflow: 'hidden',
                }`
                ).row.full-width.items-center.content-center.q-mb-xs.q-px-md.b-70.sphere-drag-handle
                span.text-white {{ '# '+s.name }}
                q-icon(
                  name="drag_indicator" color="white" size="20px"
                  :style=`{position: 'absolute', top: '10px', right: '10px', zIndex: 100}`)
</template>

<script>
import draggable from 'vuedraggable'

export default {
  name: 'layerItem-layerSpheres',
  components: {draggable},
  props: ['layer'],
  data () {
    return {
      showItemsWs: false
    }
  },
  computed: {
    spheres () {
      return this.layer.spheres
    }
  },
  methods: {
    sphereClick (s) {
      this.$log('sphereClick', s)
      this.layer.spheres = this.layer.spheres.filter(sphere => sphere.name !== s.name)
    },
    sphereClickWs (s) {
      this.$log('sphereClickWs', s)
      this.sphereAdd(s)
      this.showItemsWs = false
    },
    sphereCreatedWs (s) {
      this.$log('sphereCreatedWs', s)
      this.sphereAdd(s)
    },
    sphereAdd (s) {
      this.$log('sphereAdd', s)
      let i = this.layer.spheres.findIndex(sphere => sphere.name === s.name)
      if (i >= 0) return
      this.layer.spheres.push(s)
    }
  }
}
</script>
