<style lang="sass" scoped>
.item-prev
  opacity: 0
  &:hover
    opacity: 1
    background: rgba(255,255,255,0.2) !important
.item-next
  cursor: pointer
  border-radius: 10px
  &:hover
    background: rgba(255,255,255,0.1) !important
.item-again
  &:hover
    background: rgba(255,255,255,0.2) !important
</style>

<template lang="pug">
div(
  :style=`{
    position: 'relative',
  }`
  ).row.full-width.items-start.content-start
  //- items preview: first item from meta => shaping the size
  img(
    v-if="true"
    :src="previewUrl" draggable="false"
    :class=`{
    }`
    :style=`{
      userSelect: 'none', objectFit: 'contain',
      maxHeight: $q.screen.height-120+'px',
      opacity: itemIndex === 0 ? 1 : 0
    }`
    ).full-width
  //- items wrapper
  div(
    :style=`{
      position: 'absolute',
      zIndex: 1000,
    }`
    ).row.fit.items-start.content-start
    //- items stats
    div(
      v-if="false && visible && active && items.length > 1"
      :style=`{
        position: 'absolute', zIndex: 20000, top: '0px',
        transform: 'translate3d(0,0,0)',
        height: '4px'
      }`
      ).row.full-width.items-center.q-px-sm
        div(
          v-for="(i,ii) in items" :key="ii"
          :style=`{height: '4px'}`).col.q-px-xs
            div(:style=`{
              borderRadius: '2px', overflow: 'hidden',
              background: itemIndex === ii ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)'
            }`).row.fit
    //- item prev
    div(
      v-if="visible && active && itemIndex !== 0 && items.length > 1"
      @click="itemsPrev()"
      :style=`{
        position: 'absolute', zIndex: 1000,
        left: '0px', top: '0px',
        width: '20%',
        height: '100%',
        borderRadius: '10px',
        overflow: 'hidden',
        background: 'rgba(255,255,255,0)',
      }`
      ).row.cursor-pointer
    //- item last
    //- item current
    div(
      v-for="(i,ii) in items" :key="i.oid+'-'+ii"
      v-if="ii >= itemIndex && ii <= itemIndex+1"
      :style=`{
        position: 'absolute', zIndex: 100+ii, right: '0px', bottom: '-0.5px',
        maxWidth: itemIndex === ii ? nowMaxWidth+'%' : nextMaxWidth+'%',
        maxHeight: itemIndex === ii ? nowMaxHeight+'%' : nextMaxHeight+'%',
        opacity: itemIndex === ii ? 1 : (nextMaxWidth / 100) + 0.3,
        transform: 'translate3d(0,0,0)',
      }`).row.full-width.items-start.content-start
      //- //- item prev
      //- div(
      //-   :style=`{
      //-     position: 'absolute', zIndex: 100+ii, left: '-58px',
      //-     width: '50px', height: '100%',
      //-   }`
      //-   ).row.items-center.content-center.justify-center.br
      //-   q-btn(round flat color="white" icon="keyboard_arrow_left" @click="itemsPrev()").fit.b-80
      //- item next
      div(v-if="ii === itemIndex+1" @click="itemsNext()" :style=`{position: 'absolute', zIndex: 20000}`).row.fit.cursor-pointer.item-next
      //- composition
      //- TODO composition, chain, another shit?
      //- :active="visible && active && itemIndex === ii || visible && active && nextMaxWidth > 25"
      composition(
        :ctx="ctx" :preview="i.thumbUrl" :value="i"
        :visible="visible"
        :active="active && itemIndex === ii"
        :mini="mini || itemIndex !== ii || nextMaxWidth > 50"
        :itemsCount="items.length"
        @started="itemStarted(ii)"
        @ended="itemEnded(ii)"
        :style=`{
          position: 'relative',
          borderRadius: '10px',
          overflow: 'hidden',
        }`)
        template(v-slot:video)
          //- .row.full-width.q-pa-xs.bg-pink pink
</template>

<script>
export default {
  name: 'nodeLayoutPip-nodeItems',
  props: ['ctx', 'node', 'nodeFull', 'visible', 'active', 'mini'],
  data () {
    return {
      itemIndex: 0,
      nextMaxWidth: 25,
      nextMaxHeight: 50,
      nowMaxWidth: 100,
      nowMaxHeight: 100
    }
  },
  computed: {
    previewUrl () {
      return this.node.meta.items[0].thumbUrl
    },
    items () {
      if (!this.nodeFull) return []
      else return this.nodeFull.items
    }
  },
  watch: {
    active: {
      handler (to, from) {
        this.$log('active CHANGED', to)
        // alert('nodeItems active CHANGED: ' + to)
      }
    },
  },
  methods: {
    itemsPrev () {
      this.$log('itemsPrev')
      this.itemIndex -= 1
    },
    itemsNext () {
      this.$log('itemsNext')
      this.$tween.to(
        this,
        0.5,
        {
          nextMaxWidth: 100,
          nextMaxHeight: 100,
          onComplete: () => {
            this.itemIndex += 1
            this.nextMaxWidth = 25
            this.nextMaxHeight = 50
          }
        }
      )
    },
    itemStarted (itemIndex) {
      this.$log('itemStarted', itemIndex)
    },
    itemEnded (itemIndex) {
      this.$log('itemEnded', itemIndex)
    }
  }
}
</script>
