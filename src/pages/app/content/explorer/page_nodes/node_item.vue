<style lang="sass">
.node-item
  &:hover
    background: rgb(50,50,50) !important
</style>

<template lang="pug">
node-feed(
  :node="node" :isActive="isActive" :isVisible="isVisible"
  :showName="isOpened"
  @itemActive="itemActiveHandle"
  :itemsStyles=`itemsStyles`
  :class=`{
    //- 'bg-red': nodeQuery === node.oid,
    //- 'bg-red': isActive,
    //- 'b-40': isActive,
  }`
  :style=`{
    //- minHeight: '192px',
    //- maxHeight: '192px',
    borderRadius: '10px',
  }`)
  template(v-slot:name v-if="isOpened")
    div(:style=`{position: 'relative'}`).row.full-width
      q-btn(
        @click="isOpened = false"
        round flat color="red" icon="vertical_align_center"
        :style=`{
          position: 'absolute', zIndex: 1000, right: '0px', top: '0px',
          width: '60px', height: '60px',
        }`)
  template(v-slot:items v-if="!isOpened")
    .row.full-width.items-start.content-start.q-px-sm
      div(
        @click="isOpened = true"
        :style=`{
          position: 'relative',
          borderRadius: '10px',
          height: '60px',
        }`).row.full-width.items-center.content-center.justify-center.b-40.q-mb-sm.cursor-pointer.node-item
        //- TODO: paddingLeft, paddingRight 60px,
        img(
          :src="node.items[0].thumbUrl"
          :style=`{
            position: 'absolute', zIndex: 100,
            top: '0px', left: '0px',
            height: '60px',
            width: '60px',
            borderRadius: '10px',
            objectFit: 'cover',
            border: figures[0] ? '3px solid rgb(76,175,79)' : 'none'
          }`)
        //- .col.full-height
          .row.fit.items-center.content-center.justify-center
        span(
          :style=`{
            fontSize: '20px',
          }`).text-white.text-bold {{ name }}
        img(
          v-if="node.items[1]"
          :src="node.items[1].thumbUrl"
          :style=`{
            position: 'absolute', zIndex: 100,
            top: '0px', right: '0px',
            height: '60px',
            width: '60px',
            borderRadius: '10px',
            objectFit: 'cover',
            border: figures[1] ? '3px solid rgb(76,175,79)' : 'none'
          }`)
</template>

<script>
export default {
  name: 'pageNodes_item',
  props: ['node', 'player', 'contentKalpa', 'nodeQuery', 'isActive', 'isVisible'],
  components: {
  },
  data () {
    return {
      isOpened: false,
      figures: [],
    }
  },
  computed: {
    name () {
      if (this.node.vertices.length === 2) {
        if (this.node.vertices[0] === 'ESSENCE') return this.node.name
        else if (this.node.vertices[0] === 'ASSOCIATIVE') return ''
        else {
          return this.$nodeItemType(this.node.vertices[0]).name + ' - ' + this.$nodeItemType(this.node.vertices[1]).name
        }
      }
      else {
        return this.node.name
      }
    },
    itemsStyles () {
      return this.figures.map(f => {
        if (f) {
          return {
            border: '3px solid rgb(76,175,79)'
          }
        }
        else {
          return {}
        }
      })
    }
  },
  watch: {
    isActive: {
      handler (to, from) {
        if (to) {
          // let figures = []
          this.node.items.map((i, idx) => {
            // from COMPOSITION
            if (i.layers) {
              if (i.layers[0].contentOid === this.contentKalpa.oid) {
                // this.figures[idx] = i.layers[0].figuresAbsolute
                this.$set(this.figures, idx, i.layers[0].figuresAbsolute)
              }
            }
            // from NODE with ONE item...
            if (i.items && i.items.length === 1) {
              if (i.items[0].layers[0].contentOid === this.contentKalpa.oid) {
                // this.figures[idx] = i.items[0].layers[0].figuresAbsolute
                this.$set(this.figures, idx, i.items[0].layers[0].figuresAbsolute)
              }
            }
          })
          // set figures
          if (this.figures.length > 0) {
            let figure = this.figures[0] || this.figures[1]
            if (figure) {
              // from VIDEO
              if (this.contentKalpa.type === 'VIDEO') {
                let start = figure[0].t
                this.player.setCurrentTime(start)
              }
              // from IMAGE
              else if (this.contentKalpa.type === 'IMAGE') {
                // TODO: zoom in?
                // this.player.setZoom(figures)
              }
              this.player.stateSet('figures', this.figures.reduce((acc, val) => {
                if (val) acc.push(val)
                return acc
              }, []))
            }
          }
          // set styles
        }
        else {
          this.player.stateSet('figures', [])
          this.figures = []
        }
      }
    }
  },
  methods: {
  },
  mounted () {
    this.$log('mounted')
    if (this.nodeQuery === this.node.oid) {
      this.$emit('scrollme')
    }
  }
}
</script>
