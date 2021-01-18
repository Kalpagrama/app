<style lang="sass">
.node-item
  &:hover
    background: rgb(40,40,40) !important
</style>

<template lang="pug">
.row.full-width
  //- opened node dialog...
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
        }`).row.full-width.q-pb-xl
        node-feed(:node="node" :isActive="true" :isVisible="true")
      .row.full-width.items-center.content-center.justify-center.q-pa-sm
        //- icon="south" icon-right="south"
        q-btn(
          @click="isOpened = false"
          flat dense color="white" no-caps)
          span.q-mx-sm Закрыть
  //- body new
  div(
    @click="onClick"
    :style=`{
      position: 'relative', zIndex: 10,
      background: nodeSelected ? 'rgb(40,40,40)' : 'rgb(35,35,35)',
      borderRadius: '10px',
      minHeight: '50px',
    }`
    ).row.full-width.items-start.content-start.justify-start
    //- div()
    div(
      :style=`{
        position: 'relative',
        height: '50px',
        //- borderRadius: '10px',
        //- background: 'rgb(40,40,40)',
      }`
      ).row
      img(
        draggable="false"
        :src="node.items[contentItemIndex].thumbUrl"
        :style=`{
          zIndex: 200,
          height: '50px',
          borderRadius: '10px',
          background: nodeSelected ? 'rgb(45,45,45)' : 'rgb(35,35,35)',
          opacity: node.items.length === 1 ? 1 : 0,
        }`)
      //- items 2
      div(
        v-if="node.items[1]"
        :style=`{
          position: 'absolute', zIndex: 999,
        }`
        ).row.fit
        img(
          draggable="false"
          :src="node.items[contentItemIndex].thumbUrl"
          :style=`{
            position: 'absolute', zIndex: 100, top: '0px', right: '0px',
            width: '60%',
            maxHeight: '50px',
            objectFit: 'cover',
            borderRadius: '10px',
          }`)
        img(
          draggable="false"
          :src="node.items[contentItemIndex === 0 ? 1 : 0].thumbUrl"
          :style=`{
            position: 'absolute', zIndex: 90, bottom: '0px', left: '0px',
            width: '60%',
            maxHeight: '50px',
            objectFit: 'cover',
            borderRadius: '10px',
            opacity: 0.9,
          }`)
    .col
      div(v-if="node.items.length === 1 || node.name.length > 0").row.fit.items-center.content-center.q-pa-sm
        span.text-white {{ node.name }}
      div(v-else).row.fit.items-center.content-center.q-px-sm.q-pt-xs
        .row.full-width.justify-start
          span.text-white {{ $nodeItemType(node.vertices[contentItemIndex]).name }}
        div.row.full-width.justify-start
          span(
            :style=`{
              //- marginLeft: '-10px',
            }`
            ).text-white {{ $nodeItemType(node.vertices[contentItemIndex === 0 ? 1 : 0]).name }}
    div(
      :style=`{
        minHeight: '50px',
        minWidth: '50px',
      }`
      ).row.items-center.content-center.justify-center
      node-vote-ball(
        :node="node"
        :showRateUser="false"
        :showRainbow="false"
        :showRateCounts="false"
        :showRateName="false"
        :style=`{
          opacity: 0.5
        }`)
  //- .row.full-width.bg-red
    small.text-white {{ node.items[contentItemIndex] ? true : false }}
  //- div(
    v-if="nodeSelected"
    :style=`{
      marginTop: '-10px',
      height: '50px',
      borderRadius: '0 0 10px 10px',
    }`
    ).row.full-width.bg-red
  //- body
  //- div(
    :style=`{
      //- background: nodeSelected ? 'red' : 'none'
    }`
    ).row.full-width.items-start.content-start
    div(
      @click="onClick"
      :style=`{
        position: 'relative',
        borderRadius: '10px',
        minHeight: '50px',
        paddingLeft: '64px',
        paddingRight: node.items[1] ? '64px' : '64px',
        //- background: isActive ? 'rgb(38,38,38)' : 'rgb(35,35,35)',
        background: nodeSelected ? 'red' : 'rgb(35,35,35)',
        textAlign: 'center',
      }`).row.full-width.items-center.content-center.justify-center.cursor-pointer.node-item
      img(
        :src="node.items[0].thumbUrl"
        :style=`{
          position: 'absolute', zIndex: 100,
          top: '0px', left: '0px',
          height: '50px',
          width: '50px',
          borderRadius: '10px',
          objectFit: 'cover',
          //- border: figures[0] ? '3px solid rgb(76,175,79)' : 'none'
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
          //- border: figures[1] ? '3px solid rgb(76,175,79)' : 'none'
        }`)
</template>

<script>
export default {
  name: 'pageNodes_item',
  props: ['node', 'player', 'contentKalpa', 'nodeSelected', 'isActive', 'isSelected', 'isVisible'],
  components: {
    nodeVoteBall: () => import('components/node/node_vote_ball.vue'),
  },
  data () {
    return {
      // isSelected: false,
      isOpened: false,
      figures: [],
    }
  },
  computed: {
    contentItemIndex () {
      if (this.node.items.length === 1) {
        // return this.node.items[0]
        return 0
      }
      else {
        return this.node.items.findIndex(i => {
          return i.items && i.items[0].layers[0].contentOid === this.contentKalpa.oid
        })
      }
    },
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
      this.$emit('select')
      // if (!this.isSelected) {
      //   // this.isSelected = true
      //   this.$emit('select', this.node.oid)
      //   // this.$router.replace({query: {nodeOid: this.node.oid}})
      // }
      // if (this.isSelected) {
      //   this.player.pause()
      //   this.isOpened = true
      // }
      // // if (this.isSelected)
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
