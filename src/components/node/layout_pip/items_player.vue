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
    position: 'relative'
  }`
  ).row.full-width.items-start.content-start.b-50
  //- preview
  img(
    :src="preview" draggable="false"
    :style=`{maxHeight: 500+'px', userSelect: 'none', objectFit: 'contain', opacity: active ? 1 : 0.5}`).full-width
  //- items wrapper
  div(
    v-if="true"
    :style=`{position: 'absolute'}`).row.fit.bg-black
    //- items stats
    div(
      v-if="visible && active && items.length > 1"
      :style=`{
        position: 'absolute', zIndex: 20000, top: '0px',
        height: '4px'
      }`
      ).row.full-width.items-center.q-px-sm
        div(
          v-for="(i,ii) in items" :key="ii"
          :style=`{height: '4px'}`).col.q-px-xs
            div(:style=`{
              borderRadius: '0 0 2px 2px', overflow: 'hidden',
              background: itemIndex === ii ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)'
            }`).row.fit
    //- item prev
    div(
      v-if="visible && active && itemIndex !== 0 && items.length > 1" @click="itemsPrev()"
      :style=`{
        position: 'absolute', top: '10%', height: '70%', zIndex: 20000, width: '20%',
        borderRadius: '0 10px 10px 0'
      }`
      ).row.items-center.content-center.justify-center.cursor-pointer.item-prev
        q-btn(round flat color="white" icon="keyboard_arrow_left")
    //- item last
    div(
      v-if="items.length > 1 && itemIndex+1 === items.length" @click="itemsAgain()"
      :style=`{
        position: 'absolute', zIndex: 20000, right: '0px', bottom: '0px',
        maxWidth: '25%', height: '100px',
        borderRadius: '10px', overflow: 'hidden',
        background: 'rgba(255,255,255,0.1)',
      }`
      ).row.full-width.items-center.content-center.justify-center.cursor-pointer.item-again
      q-btn(round flat color="white" icon="refresh")
    //- items
    div(
      v-for="(i,ii) in items" :key="i.oid+'-'+ii"
      v-if="ii >= itemIndex && ii <= itemIndex+1"
      :style=`{
        position: 'absolute', zIndex: 100+ii, right: '0px', bottom: '0px',
        maxWidth: itemIndex === ii ? nowMaxWidth+'%' : nextMaxWidth+'%',
        maxHeight: itemIndex === ii ? nowMaxHeight+'%' : nextMaxHeight+'%',
        opacity: itemIndex === ii ? 1 : (nextMaxWidth / 100) + 0.3
      }`).row.full-width
      //- item next
      div(v-if="ii === itemIndex+1" @click="itemsNext()" :style=`{position: 'absolute', zIndex: 20000}`).row.fit.cursor-pointer.item-next
      //- composition
      //- TODO composition, chain, another shit?
      composition(
        :ctx="ctx" :preview="i.thumbUrl" :value="i"
        :visible="visible"
        :active="visible && active && itemIndex === ii || visible && active && nextMaxWidth > 25"
        :mini="itemIndex !== ii || nextMaxWidth > 50"
        :itemsCount="items.length"
        @ended="compositionEnded(ii)")
</template>

<script>
export default {
  name: 'nodeLayoutPip-itemsPlayer',
  props: ['ctx', 'index', 'node', 'nodeFull', 'visible', 'active', 'essence', 'mini', 'opened', 'nodeLoad'],
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
    preview () {
      return this.node.meta.items[0].thumbUrl
    },
    items () {
      if (this.nodeFull) {
        return this.nodeFull.items
      }
      else {
        return this.node.meta.items
      }
    },
    // items () {
    //   return [...this.itemsRaw, ...this.itemsRaw, ...this.itemsRaw]
    // }
  },
  watch: {
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
    itemsAgain () {
      this.$log('itemsAgain')
      this.itemIndex = 0
    },
    compositionEnded (index) {
      this.$log('compositionEnded', index)
      let itemIndexTo = index + 1
      if (this.items[itemIndexTo]) {
        this.itemIndex = itemIndexTo
      }
      else {
        this.itemIndex = 0
      }
    }
  },
  mounted () {
    // this.$log('mounted')
  },
  beforeDestroy () {
    // this.$log('beforeDestroy')
  }
}
</script>
