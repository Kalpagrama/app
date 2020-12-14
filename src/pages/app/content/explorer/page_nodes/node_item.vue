<style lang="sass">
.node-item
  &:hover
    background: rgb(50,50,50) !important
</style>

<template lang="pug">
//- .row.full-width.items-start.content-start
  //- small.text-white {{ node }}
  .row.full-width.items-center.content-center.q-px-xs
    q-btn(
      round flat dense color="white"
      :style=`{
        width: '30px',
        height: '30px',
        borderRadius: '50%',
      }`
      ).row.items-center.content-center.justify-center
      img(
        src="~/assets/vote.png"
        :style=`{
          width: '20px,', height: '20px',
          borderRadius: '50%',
        }`)
    .col
      .row.full-width.justify-between.q-px-xs
        router-link(:to="'/user/'+node.author.oid")
          span.text-grey-8 {{ node.author.name }}
    .row.full-height.items-center.content-center
      small.text-grey-8 {{ $date(node.createdAt) }}
      q-btn(
        round flat dense size="sm" color="grey-9" icon="more_horiz"
      ).q-ml-sm
  div(
    :style=`{
      paddingLeft: '26px',
    }`
    ).row.full-width.items-start.content-start
    div(
      :style=`{
        position: 'relative',
        background: isActive ? 'rgb(40,40,40)' : 'rgb(33,33,33)',
        borderRadius: '10px',
      }`
      ).row.full-width
      //- connection
      div(
        v-if="node.items.length === 2"
        :style=`{
          position: 'absolute', top: '50%', zIndex: 5,
          height: '1px',
        }`
        ).row.full-width.bg-grey-8
      //- 0 item
      div(
        :style=`{
          width: '50px',
        }`
        ).row.items-start.content-start
        img(
          v-if="node.items[0]"
          :src="node.items[0].thumbUrl"
          :style=`{
            height: '50px',
            width: '50px',
            borderRadius: '10px',
            objectFit: 'cover',
            zIndex: 10,
            border: figures[0] ? '3px solid rgb(76,175,79)' : 'none'
          }`)
        .row.full-width.justify-center
          small(v-if="node.items[0].layers").text-grey-8 {{ $time(node.items[0].layers[0].figuresAbsolute[0].t) }}
      //- center
      .col
        div(
          v-if="node.items.length === 1"
          ).row.fit.items-between.content-between.justify-start.q-px-sm.q-py-xs
          span.text-white {{ node.name || node.vertices }}
        div(
          v-if="node.items.length === 2"
          ).row.fit.items-center.content-center.justify-center
          span.text-white.q-mb-lg {{ name }}
      //- 1 item
      img(
        v-if="node.items[1]"
        :src="node.items[1].thumbUrl"
        :style=`{
          height: '50px',
          width: '50px',
          borderRadius: '10px',
          objectFit: 'cover',
          zIndex: 10,
          border: figures[1] ? '3px solid rgb(76,175,79)' : 'none'
        }`)
    .row.full-width.q-px-sm
      q-btn(flat dense color="grey-8" no-caps size="sm") Reply
    div(:style=`{position: 'relative',}`).row.full-width
      slot
.row.full-width
  .col
    node-feed(
      :node="node" :isActive="isActive" :isVisible="isVisible"
      :showName="isOpened"
      @itemActive="itemActiveHandle"
      :itemsStyles=`itemsStyles`
      :class=`{
      }`
      :style=`{
        borderRadius: '10px',
      }`)
      template(v-slot:items v-if="!isOpened")
        .row.full-width.items-start.content-start.q-px-sm
          div(
            @click="isOpened = true"
            :style=`{
              position: 'relative',
              borderRadius: '10px',
              minHeight: '60px',
              paddingLeft: '64px',
              paddingRight: node.items[1] ? '64px' : '64px',
              background: isActive ? 'rgb(45,45,45)' : 'rgb(40,40,40)',
            }`).row.full-width.items-center.content-center.justify-center.q-mb-sm.cursor-pointer.node-item
            //- TODO: paddingLeft, paddingRight 60px
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
            span(
              :style=`{
                //- fontSize: '20px',
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
  //- right side resizer
  div(
    :style=`{
      width: '60px',
    }`
    ).row.items-center.content-center.justify-center
    q-btn(
      @click="isOpened = !isOpened"
      round flat
      color="grey-8"
      :icon="isOpened ? 'unfold_less' : 'unfold_more'"
      :style=`{
        position: 'absolute', zIndex: 1000, right: '0px', top: '0px',
        width: '60px', height: '60px',
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
