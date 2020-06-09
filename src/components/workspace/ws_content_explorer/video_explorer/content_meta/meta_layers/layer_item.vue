<style lang="sass" scoped>
.layer
  cursor: pointer
  &:hover
    background: rgb(100,100,100)
</style>

<template lang="pug">
div(
  :class=`{
    'b-80': stateExplorer.layerSelected === layer.id,
    'b-70': stateExplorer.layerSelected !== layer.id,
  }`
  :style=`{
    position: 'relative',
    minHeight: '40px',
    borderRadius: '10px',
    overflow: 'hidden'
  }`
  ).row.full-width.items-between.content-between
  //- header
  div(
    :class=`{
      'b-90': stateExplorer.layerSelected === layer.id,
      'b-70': stateExplorer.layerSelected !== layer.id,
    }`
    :style=`{
      position: 'relative',
      height: '40px',
      borderRadius: '10px',
      overflow: 'hidden'
    }`).row.full-width.q-pl-md.layer
    //- progress tint
    div(
      v-if="stateExplorer.layerSelected === layer.id && stateExplorer.currentTime >= layerStart && stateExplorer.currentTime <= layerEnd"
      :style=`{
        position: 'absolute', zIndex: 100,
        left: '0px',
        width: ((stateExplorer.currentTime-layerStart)/layerDuration)*100+'%',
        pointerEvents: 'none',
        borderRadius: '10px',
        overflow: 'hidden',
        opacity: 0.5
      }`
      ).row.full-height.bg-white
    //- layer name
    div(
      @click="layerClick"
      ).col.q-py-sm
      span.text-white {{ layerName }}
      div(v-if="false").row.full-width.text-grey-4
        small {{ $time(layerStart) }}
        small.q-mx-xs -
        small {{ $time(layerEnd) }}
        small.q-mx-xs /
        small {{ $time(layerDuration) }}
    //- layer actions and drag
    div().row.full-height.items-start.content-start.q-pa-xs
      q-btn(round flat dense color="grey-5" icon="more_vert")
        kalpa-menu-popup(:actions="actions")
  //- tools
  div(
    v-if="stateExplorer.layerSelected === layer.id"
    ).row.full-width.items-center.content-center.q-pa-xs
    q-btn(round flat dense color="white" icon="edit" @click="layerEdit()")
    .col
    q-btn(round flat dense color="white" icon="refresh" @click="layerRefresh()")
</template>

<script>
export default {
  name: 'metaLayers-layerItem',
  props: ['stateExplorer', 'layer', 'layerIndex'],
  data () {
    return {
    }
  },
  computed: {
    layerName () {
      if (this.layer.spheres.length > 0) return this.layer.spheres[0].name
      else return ''
    },
    layerStart () {
      return this.layer.figuresAbsolute[0].t
    },
    layerEnd () {
      return this.layer.figuresAbsolute[1].t
    },
    layerDuration () {
      return this.layerEnd - this.layerStart
    },
    actions () {
      return {
        edit: {
          name: 'Edit',
          fn: () => {
            this.$log('Edit')
          }
        },
        createNode: {
          name: 'Create node',
          fn: () => {
            this.$log('Create node')
          }
        },
        copy: {
          name: 'Copy',
          fn: () => {
            this.$log('Copy')
          }
        },
        delete: {
          name: 'Delete',
          fn: () => {
            this.$log('Delete')
          }
        }
      }
    }
  },
  watch: {
    // 'stateExplorer.layerSelected': {
    // }
  },
  methods: {
    layerEdit () {
      this.$log('layerEdit')
    },
    layerRefresh () {
      this.$log('layerRefresh')
      this.stateExplorer.player.setCurrentTime(this.layerStart)
      this.stateExplorer.set('currentTime', this.layerStart)
      this.stateExplorer.player.play()
    },
    layerClick () {
      this.$log('layerClick')
      this.stateExplorer.set('layerSelected', this.layer.id)
      this.stateExplorer.player.setCurrentTime(this.layerStart)
      this.stateExplorer.set('currentTime', this.layerStart)
      this.stateExplorer.player.play()
    }
  }
}
</script>
