<style lang="stylus">
.kinput {
  border: none;
  height: 100%;
  padding: 10px;
  &:focus {
    outline: none;
  }
}
</style>
<template lang="pug">
.column.fit
  //- header
  //- TODO its not only layers, its VIDEO, content meta....
  div(
    :style=`{height: '60px'}`
    ).row.full-width
    .col.full-height
      .row.fit.items-center.content-center.q-px-xl
        //- TODO change meta information of the content: layers, nodes, users, spheres, etc...
        //- meta.mode
        span.text-bold.text-green {{ modeName }}
        q-btn(
          v-if="mode === 'edit'"
          push round no-caps @click="playPause()"
          :color="meta.mode === 'play' ? 'red' : 'green'"
          :style=`{borderRadius: '10px'}`).q-px-sm
          span.text-bold {{meta.mode === 'play' ? 'Just watch' : 'Play all layers'}}
  //- body
  div(
    :style=`{position: 'relative'}`).col.full-width.scroll
    //- .row.full-width.q-px-sm
    //-   .row.full-width.bg-red.text-white
    //-     div(v-for="(l, li) in layers").row.full-width.q-pa-xs layer: {{li+1}}-{{l.figuresAbsolute}}
    .row.full-width.items-start.content-start.q-pa-sm.br
      div(
        v-for="(l, li) in layersFiltered" :key="li"
        :class=`{
          'bg-grey-10': meta.mode === 'watch' || li !== meta.layerIndex,
          'bg-grey-8': meta.mode !== 'watch' && li === meta.layerIndex}`
        :style=`{position: 'relative', minHeight: '40px', borderRadius: '10px', overflow: 'hidden'}`
        ).row.full-width.items-center.content-center.q-mb-sm
        //- inactive tint
        div(
          v-if="meta.mode === 'watch' || meta.layerIndex !== li" @click="layerClick(l, li)"
          :style=`{position: 'absolute', zIndex: 200, opacity: 0.3}`
          ).row.fit.cursor-pointer.bg-black
        //- inactive layer
        div(
          v-if="l.figuresAbsolute.length > 0"
          :style=`{height: '40px'}`
          ).row.full-width.items-center.content-center
          .col.full-height
            //- name SHOW
            div(
              v-if="li !== layerNameSetting"
              ).row.fit.items-center.content-center
              div(v-if="l.spheres.length > 0").col.full-height
                .row.fit.items-center.content-center.q-px-sm
                  span(v-if="l.spheres.length > 0").text-white {{ l.spheres[0].name }}
              q-btn(v-if="li === meta.layerIndex" round flat dense color="white" icon="edit" @click="layerNameSetStart(l,li)").q-mx-sm
              span(v-if="li === meta.layerIndex && l.spheres.length === 0").text-grey-5 Set layer name
            //- name EDIT
            div(
              v-if="li === layerNameSetting"
              :style=`{borderRadius: '10px', overflow: 'hidden'}`).row.fit.items-center.content-center.bg-green
              .col.full-height
                .row.fit.items-center.content-center
                  input(
                    v-model="layerName"
                    autofocus
                    @keyup.enter="layerNameSet(l,li)" @blur="layerNameSet(l, li)"
                    :style=`{background: 'none', color: 'white'}`).kinput.full-width
              q-btn(v-if="li === meta.layerIndex" round flat dense color="white" icon="check" @click="layerNameSet(l,li)").q-mx-sm
          div(:style=`{width: '83px'}`).row.full-height.justify-center.items-center.content-center
            span.text-white {{ $time(l.figuresAbsolute[0].t) }}
          div(:style=`{width: '83px'}`).row.full-height.justify-center.items-center.content-center
            span.text-white {{ $time(l.figuresAbsolute[1].t) }}
        //- active layer
        div(
          v-if="meta.mode !== 'watch' && meta.layerIndex === li"
          :style=`{height: height+'px'}`
          ).row.full-width.items-end.content-end.justify-end
          //- active layer EDIT
          div(
            v-if="mode === 'edit'"
            :style=`{height: '50px'}`).row.full-width.items-center.content-end.justify-end
            q-btn(
              round dense
              :color="li === meta.layerIndexPlay ? 'red' : 'green'"
              :icon="li === meta.layerIndexPlay ? 'pause' : 'play_arrow'").q-mx-sm
            .col.full-height
            q-btn(
              v-if="layers.length > 1"
              round flat color="red" icon="delete_outline" @click="layerDelete(li)").q-mr-sm
            .col.full-height
            q-btn(round flat color="green" icon="keyboard_arrow_left" @click="l.figuresAbsolute[0].t -= 0.100")
            q-btn(round flat color="green" icon="keyboard_arrow_right" @click="l.figuresAbsolute[0].t += 0.100")
            q-btn(round flat color="green" icon="keyboard_arrow_left" @click="l.figuresAbsolute[1].t -= 0.100")
            q-btn(round flat color="green" icon="keyboard_arrow_right" @click="l.figuresAbsolute[1].t += 0.100")
          //- active layer PICK
          div(
            v-if="mode === 'pick'"
            :style=`{height: '50px'}`).row.full-width.items-center.content-center.justify-between
            q-btn(dense no-caps color="green" @click="layerExport(l, li)").q-px-sm Export
</template>

<script>
export default {
  name: 'editorVideoLayers',
  props: ['mode', 'layers', 'composition', 'player', 'meta'],
  data () {
    return {
      height: 50,
      layerNameSetting: -1,
      layerName: ''
    }
  },
  computed: {
    layersFiltered () {
      return this.layers.filter(l => {
        // return l.figuresAbsolute.length > 0
        return true
      })
    },
    layer () {
      return this.layers[this.meta.layerIndex]
    },
    modeName () {
      switch (this.meta.mode) {
        case 'play': {
          return 'Playing all layers'
        }
        case 'watch': {
          return 'Just watching...'
        }
        case 'layer': {
          let name = this.layer.spheres.length > 0 ? this.layer.spheres[0].name : this.meta.layerIndex + 1
          return `Playing layer: ${name}`
        }
        default: {
          return 'Nothing'
        }
      }
    }
  },
  watch: {
    'meta.layerIndex': {
      handler (to, from) {
        this.$log('meta.layerIndex CHANGED', to)
        // TODO save the unsaved value?
        this.layerNameSetting = false
        this.layerName = ''
      }
    }
  },
  methods: {
    playPause () {
      this.$log('playPause', this.meta.mode)
      if (this.meta.mode === 'watch') {
        this.$emit('meta', ['mode', 'play'])
        this.$emit('meta', ['layerIndex', 0])
        this.$emit('meta', ['layerIndexPlay', -1])
        this.player.play()
      }
      else {
        this.$emit('meta', ['mode', 'watch'])
        this.$emit('meta', ['layerIndex', 0])
        this.$emit('meta', ['layerIndexPlay', -1])
      }
    },
    layerClick (l, li) {
      this.$log('layerClick', l, li)
      if (this.mode === 'edit') {
        this.$emit('meta', ['mode', 'layer'])
        this.$emit('meta', ['layerIndexPlay', li])
      }
      else if (this.mode === 'pick') {
        this.$emit('pick', JSON.parse(JSON.stringify(this.layers[li])))
      }
    },
    layerExport (l, li) {
      this.$log('layerExport', l, li)
      // this.$emit('layerExport', l)
    },
    layerPlay () {
      this.$log('layerPlay')
    },
    async layerDelete (li) {
      this.$log('layerDelete')
      if (this.layers.length > 1) {
        if (!confirm('Delete layer?')) return
        let index = li === 0 ? this.meta.layerIndex + 1 : this.meta.layerIndex - 1
        this.$emit('meta', ['mode', 'layer'])
        this.$emit('meta', ['layerIndex', index])
        this.$emit('meta', ['layerIndexPlay', index])
        // await this.$wait(300)
        this.$delete(this.layers, li)
      }
    },
    layerNameSetStart (l, li) {
      this.$log('layerNameSetStart', l, li)
      this.layerNameSetting = li
      this.layerName = l.spheres.length > 0 ? l.spheres[0].name : ''
      this.$log('layerNameSetStart name', this.layerName)
    },
    layerNameSet (l, li) {
      this.$log('layerNameSet', l, li)
      this.$log('layerNameSet name', this.layerName)
      if (this.layerName.length === 0) {
        this.$set(l, 'spheres', [])
      }
      else {
        this.$set(l.spheres, 0, {name: this.layerName})
      }
      // this.layerName = ''
      this.layerNameSetting = -1
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
