<style lang="stylus">
.kinput {
  border: none;
  height: 100%;
  padding: 10px;
  &:focus {
    outline: none;
  }
}
.kbtn {
  border-radius: 10px
}
</style>

<template lang="pug">
.column.fit
  //- dialogs
  //- layerName
  q-dialog(v-model="layerNameDialogOpened" :maximized="$q.screen.xs" @hide="layerNameSet")
    div(
      :style=`{
        maxHeight: $q.screen.xs ? '100%' : '200px',
        maxWidth: $q.screen.xs ? '100%' : '300px',
        borderRadius: '10px'
      }`).column.fit.bg-white
      div(:style=`{height: '60px'}`).row.full-width.items-center.content-center.q-px-sm
        span.text-bold.text-black Set layer name
      div(:style=`{height: '60px'}`).row.full-width.q-px-sm
        input(
          v-model="layerName"
          autofocus placeholder="Suggest layer name"
          @keyup.enter="layerNameSet"
          :style=`{borderRadius: '10px'}`).kinput.full-width.bg-grey-4
      .col.full-width
      div(:style=`{height: '70px'}`).row.full-width.q-pa-sm
        q-btn(push color="green" no-caps @click="layerNameSet"
          :style=`{borderRadius: '10px'}`).fit
          span Save
  //- q-dialog(v-model="layerContentLayersShow" full-height position="right").window-height
  //-   div(:style=`{height: $q.screen.height+'px', width: '450px'}`).column.bg-red
  //-     h1 layer content layers
  //- header
  div(
    v-if="true"
    :style=`{height: '60px'}`).row.full-width.items-center.content-center.q-px-sm
    div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-center.justify-center
      q-btn(
        round push @click="compositionPlayButtonClick()"
        :color="meta.mode === 'play' && meta.playing ? 'red' : 'green'"
        :icon="meta.mode === 'play' && meta.playing ? 'pause' : 'play_arrow'")
    .col
    q-btn(round flat color="green" icon="school" @click="layerContentLayersShow = true")
    //- span WS
  //- body
  .col.full-width.scroll
    div(:style=`{paddingBottom: '300px'}`).row.full-width.items-start.content-start.q-pa-sm
      //- .row.full-width
      //-   small(v-for="(l,li) in layers" :key="li").full-width.text-white.q-ml-md {{l.spheres.length > 0 ? l.spheres[0].name : li}}
      //- .row.full-width.q-pa-xs
      //-   small.text-white {{ meta }}
      draggable(v-model="layers" handle=".layerhandle" @start="layerMoveStart" @end="layerMoved")
        //- transition-group
        layer(
          v-for="(l, li) in layers" :key="li"
          v-if="l.figuresAbsolute.length > 0"
          :index="li" :layer="l" :player="player" :meta="meta"
          @layerNameSetStart="layerNameSetStart"
          @layerDelete="layerDelete"
          @meta="$emit('meta', $event)")
</template>

<script>
import draggable from 'vuedraggable'
import layer from './layer'

const swap = (arr, x, y) => {
  var b = arr[x]
  arr[x] = arr[y]
  arr[y] = b
  return arr
}

export default {
  name: 'videoComposerLayers',
  components: { draggable, layer },
  props: ['composition', 'layers', 'player', 'meta'],
  data () {
    return {
      layerNameDialogOpened: false,
      layerNameSetIndex: -1,
      layerName: '',
      layerContentLayersShow: false
    }
  },
  computed: {
    layersFiltered () {
      return this.layers
    }
  },
  methods: {
    compositionPlayButtonClick () {
      this.$log('compositionPlayButtonClick')
      if (this.meta.playing && this.meta.mode === 'play') {
        this.player.pause()
      }
      else {
        this.$emit('meta', ['mode', 'play'])
        this.$emit('meta', ['layerIndex', 0])
        this.$emit('meta', ['layerIndexPlay', -1])
        this.player.play()
      }
    },
    layerMoveStart (e) {
      this.$log('layerMoveStart')
      this.$emit('meta', ['mode', 'play'])
      this.$emit('meta', ['layerIndex', 0])
      this.$emit('meta', ['layerIndexPlay', -1])
    },
    layerMoved (e) {
      this.$log('layerMoved', e)
      if (e.oldIndex !== e.newIndex) {
        this.$set(this.composition, 'layers', this.layers)
      }
    },
    layerNameSetStart (index) {
      this.$log('layerNameSetStart', index)
      this.layerNameSetIndex = index
      let layer = this.layers[index]
      if (layer.spheres.length > 0) {
        this.layerName = layer.spheres[0].name
      }
      this.layerNameDialogOpened = true
    },
    layerNameSet () {
      this.$log('layerNameSet', this.layerNameSetIndex)
      this.layerNameDialogOpened = false
      if (this.layerName.length === 0) return
      this.$set(this.layers[this.layerNameSetIndex].spheres, 0, {name: this.layerName})
      this.layerName = ''
      this.layerNameSetIndex = -1
    },
    async layerDelete (i) {
      this.$log('layerDelete', i)
      if (this.layers.length > 1) {
        if (!confirm('Delete layer?')) return
        let index = i === 0 ? this.meta.layerIndex + 1 : this.meta.layerIndex - 1
        this.$emit('meta', ['mode', 'layer'])
        this.$emit('meta', ['layerIndex', index])
        this.$emit('meta', ['layerIndexPlay', index])
        this.$wait(300).then(() => {
          this.$delete(this.layers, i)
        })
      }
    }
  }
}
</script>
