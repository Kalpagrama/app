<template lang="pug">
div(
  :style=`{
  }`
  ).row.full-width.items-start.content-start.q-px-xs
  //- header joint name
  div(
    :style=`{
      position: 'relative',
      overflow: 'hidden',
      minHeight: '60px',
      textAlign: 'center',
      paddingLeft: '60px', paddingRight: '60px',
    }`
    ).row.full-width.items-center.content-center.justify-center.q-pa-sm
    span(v-if="joint.vertices[0] === 'ESSENCE'").text-white {{ joint.name }}
    span(v-else-if="joint.vertices[0] === 'ASSOCIATIVE'").text-white Ассоциация
    div(v-else).row.full-width
      .row.full-width.justify-center
        span.text-white {{ $nodeItemType(joint.vertices[itemIndex === 1 ? 0 : 1]).name }}
      .row.full-width.justify-center
        span.text-white {{ $nodeItemType(joint.vertices[itemIndex]).name }}
    q-icon(
      name="fas fa-link" size="80px"
      :style=`{
        color: 'rgb(38,38,38)',
        position: 'absolute', zIndex: 200,
        top: '-10px',
        //- left: 'calc(50% - 40px)',
        left: '8px',
      }`)
    q-btn(
      @click="$emit('close')"
      round flat color="grey-6" icon="clear"
      :style=`{
        position: 'absolute', zIndex: 200,
        top: '8px', right: '8px',
      }`)
  node-feed(
    :node="joint"
    :isActive="true"
    :isVisible="true"
    :showItems="true"
    :showName="false"
    :orderHeader="3")
    template(v-slot:items)
      div(
        :style=`{
          position: 'relative',
        }`
        ).row.full-width.items-start.content-start
        q-btn(
          v-if="true"
          round flat color="green" icon="fas fa-link"
          :to="'/links/'+joint.items[itemIndex].oid"
          :style=`{
            position: 'absolute', zIndex: 1000,
            right: '8px',
            top: 'calc(50% - 20px)',
          }`)
        node-items-item(
          :item="joint.items[itemIndex]"
          :itemOpened="false"
          :itemActive="true")
</template>

<script>
import nodeFeed from 'components/node_feed/index.vue'
import nodeItemsItem from 'components/node_feed/node_items_item.vue'

export default {
  name: 'jointCurrent',
  props: ['item', 'joint', 'height'],
  components: {
    nodeFeed,
    nodeItemsItem,
    // nodeItemsItem: () => import('components/node_feed/node_items_item.vue'),
  },
  data () {
    return {
    }
  },
  computed: {
    itemIndex () {
      return this.joint.items.findIndex(i => i.oid !== this.item.oid)
    },
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
