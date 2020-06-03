<template lang="pug">
div(
  :style=`{
    position: 'relative',
    //- minHeight: $q.screen.xs ? '200px' : '330px',
  }`
  ).row.full-width.items-start.content-start
  //- items preview: first item from meta => shaping the size
  img(
    :src="previewUrl" draggable="false"
    :class=`{
    }`
    :style=`{
      userSelect: 'none', objectFit: 'contain',
      maxHeight: $q.screen.height-120+'px',
      opacity: active ? 1 : 1
    }`
    ).full-width
  //- items wrapper
  div(
    :style=`{
      position: 'absolute',
      zIndex: 1000,
    }`
    ).row.fit.items-start.content-start
    //- item prev
    //- item next
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
      }`).row.full-width.fit
      //- item next
      div(v-if="ii === itemIndex+1" @click="itemsNext()" :style=`{position: 'absolute', zIndex: 20000}`).row.fit.cursor-pointer.item-next
      //- composition
      //- TODO composition, chain, another shit?
      composition(
        :ctx="ctx" :preview="i.thumbUrl" :value="i"
        :visible="visible"
        :active="visible && active && itemIndex === ii || visible && active && nextMaxWidth > 25"
        :mini="mini || itemIndex !== ii || nextMaxWidth > 50"
        :itemsCount="items.length"
        @started="itemStarted(ii)"
        @ended="itemEnded(ii)")
        template(v-slot:video)
          //- span.bg-red shit
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
  methods: {
    itemStarted (itemIndex) {
      this.$log('itemStarted', itemIndex)
    },
    itemEnded (itemIndex) {
      this.$log('itemEnded', itemIndex)
    }
  }
}
</script>
