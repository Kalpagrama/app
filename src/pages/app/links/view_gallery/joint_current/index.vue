<template lang="pug">
.row.full-width.items-start.content-start
  //- header joint name
  div(
    :style=`{
      position: 'relative',
      //- overflow: 'hidden',
      minHeight: '60px',
      textAlign: 'center',
      //- paddingLeft: '60px', paddingRight: '60px',
    }`
    ).row.full-width.items-center.content-center.justify-center.q-pa-sm
    span(v-if="joint.vertices[0] === 'ESSENCE'").text-white.text-bold {{ joint.name }}
    span(v-else-if="joint.vertices[0] === 'ASSOCIATIVE'").text-white.text-bold {{$t('Association')}}
    div(v-else).row.full-width
      .row.full-width.justify-center
        span.text-white.text-bold {{ $nodeItemType(joint.vertices[itemIndex === 1 ? 0 : 1]).name }}
      .row.full-width.justify-center
        span.text-white.text-bold {{ $nodeItemType(joint.vertices[itemIndex]).name }}
    //- q-icon(
      name="fas fa-link" size="80px"
      :style=`{
        color: 'rgb(38,38,38)',
        position: 'absolute', zIndex: 20000,
        top: '-10px',
        //- left: 'calc(50% - 40px)',
        left: '8px',
      }`)
    //- q-btn(
      @click="$emit('close')"
      round flat color="grey-6" icon="clear"
      :style=`{
        position: 'absolute', zIndex: 200,
        top: '8px', right: '8px',
      }`)
  //- body
  item-feed(
    :item="joint"
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
        node-items-item(
          :item="joint.items[itemIndex]"
          :itemOpened="false"
          :itemActive="true"
          :styles=`{
          }`)
  //- footer
  div(
    :style=`{
      position: 'fixed', bottom: '0px', left: '0px', zIndex: 1000,
      paddingBottom: 'calc(8px + env(safe-area-inset-bottom))'
    }`
    ).row.full-width.items-center.content-center.justify-center.q-px-sm.q-pt-sm
    div(
      :style=`{
        background: 'rgb(40,40,40)',
        borderRadius: '20px',
        maxWidth: '400px',
      }`).row.full-width.items-center.content-center.justify-between.q-pa-sm
        q-btn(round flat color="white" icon="west" @click="$emit('close')")
        q-btn(
          @click="$emit('create')"
          color="green" icon="add"
          :style=`{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
          }`)
        q-btn(
          :to="'/cube/'+joint.items[itemIndex].oid"
          round flat color="green" icon="fas fa-link")
</template>

<script>
import nodeItemsItem from 'src/components/kalpa_item/item_feed/node_feed/node_items_item.vue'

export default {
  name: 'jointCurrent',
  props: ['item', 'joint'],
  components: {
    nodeItemsItem,
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
