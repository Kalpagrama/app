<style lang="sass">
.node-item
  &:hover
    background: rgb(45,45,45) !important
</style>

<template lang="pug">
.row.full-width
  q-dialog(
    v-model="isOpened" maximized
    )
    div(
      @click.self="isOpened = false"
      :style=`{
        zIndex: 10000,
        transform: 'translate3d(0,0,0)',
        width: $q.screen.width+'px',
        minWidth: Math.min($store.state.ui.pageWidth, $q.screen.width)+'px',
        height: $q.screen.height+'px',
        background: 'rgba(0,0,0,0.8)',
      }`
      ).row.full-width.items-center.content-center.justify-center
      div(
        :style=`{
          background: 'rgb(30,30,30)',
          borderRadius: '10px', overflow: 'hidden',
          maxWidth: $store.state.ui.pageWidth+'px',
        }`).row.full-width.q-pb-xs
        node-feed(:node="node" :isActive="true" :isVisible="true")
      .row.full-width.items-center.content-center.justify-center.q-pa-sm
        //- icon="south" icon-right="south"
        q-btn(
          @click="isOpened = false"
          flat dense color="white" no-caps)
          span.q-mx-sm Закрыть
  .row.full-width.items-start.content-start
    div(
      @click="onClick"
      :style=`{
        position: 'relative',
        borderRadius: '10px',
        minHeight: '50px',
        paddingLeft: '64px',
        paddingRight: node.items[1] ? '64px' : '64px',
        //- background: isActive ? 'rgb(38,38,38)' : 'rgb(35,35,35)',
        background: 'rgb(35,35,35)',
        textAlign: 'center',
      }`).row.full-width.items-center.content-center.justify-center.q-mb-sm.cursor-pointer.node-item
      img(
        :src="node.items[0].thumbUrl"
        :style=`{
          position: 'absolute', zIndex: 100,
          top: '0px', left: '0px',
          height: '50px',
          width: '50px',
          borderRadius: '10px',
          objectFit: 'cover',
          border: figures[0] ? '3px solid rgb(76,175,79)' : 'none'
        }`)
      small.text-white.text-bold {{ name }}
      img(
        v-if="node.items[1]"
        :src="node.items[1].thumbUrl"
        :style=`{
          position: 'absolute', zIndex: 100,
          top: '0px', right: '0px',
          height: '50px',
          width: '50px',
          borderRadius: '10px',
          objectFit: 'cover',
          border: figures[1] ? '3px solid rgb(76,175,79)' : 'none'
        }`)
</template>

<script>
export default {
  name: 'pageNodes_item',
  props: ['node', 'player', 'contentKalpa', 'nodeQuery', 'isActive', 'isSelected', 'isVisible'],
  components: {
  },
  data () {
    return {
      // isSelected: false,
      isOpened: false,
      figures: [],
    }
  },
  computed: {
    name () {
      if (this.node.vertices.length === 2) {
        if (this.node.vertices[0] === 'ESSENCE') return this.node.name
        else if (this.node.vertices[0] === 'ASSOCIATIVE') return 'Ассоциация'
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
    // isOpened: {},
    isSelected: {
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
              this.player.setState('figures', this.figures.reduce((acc, val) => {
                if (val) acc.push(val)
                return acc
              }, []))
            }
          }
          // set styles
        }
        else {
          this.player.setState('figures', [])
          this.figures = []
        }
      }
    }
  },
  methods: {
    onClick (e) {
      this.$log('onClick', e)
      if (!this.isSelected) {
        // this.isSelected = true
        this.$emit('select', this.node.oid)
      }
      if (this.isSelected) {
        this.player.pause()
        this.isOpened = true
      }
      // if (this.isSelected)
    }
  },
  mounted () {
    // this.$log('mounted')
    // if (this.nodeQuery === this.node.oid) {
    //   this.$emit('scrollme')
    // }
  }
}
</script>
