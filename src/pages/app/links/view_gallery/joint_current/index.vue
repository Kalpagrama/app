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
    span(:style=`{zIndex: 300,}`).text-white {{ joint.name || joint.vertices }}
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
        //- header
        //- div(
          v-if="joint.items[itemIndex].type === 'NODE'"
          :style=`{
            position: 'absolute', zIndex: 100, top: '0px',
          }`
          ).row.full-width.items-center.content-center.q-pa-sm
          q-btn(
            :to="'/node/'+joint.items[itemIndex].oid"
            round flat color="white" icon="adjust")
          .col
            span.text-white {{ joint.items[itemIndex].name }}
        //- router-link(
          v-if="joint.items[itemIndex].type === 'NODE'"
          :to="'/node/'+joint.items[itemIndex].oid"
          :style=`{
            position: 'absolute', zIndex: 100, bottom: '0px',
            background: 'linear-gradient(0deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)',
            borderRadius: '0 0 10px 10px',
          }`
          ).row.full-width.items-center.content-center.justify-center.q-pa-sm
          q-icon(name="adjust" size="20px" color="white").q-mr-xs
          span.text-white {{ joint.items[itemIndex].name }}
        q-btn(
          v-if="true"
          round flat color="green" icon="fas fa-link"
          :to="'/links/'+joint.items[itemIndex].oid"
          :style=`{
            position: 'absolute', zIndex: 1000,
            right: '8px',
            top: 'calc(50% - 20px)',
          }`)
        //- img
        //- img(
          draggable="false"
          :src="joint.items.find(i => i.oid !== item.oid).thumbUrl"
          :style=`{
            borderRadius: '10px',
            objectFit: 'contain',
            //- maxHeight: '400px',
            maxHeight: height-200+'px',
          }`
          ).full-width.b-40
        node-items-item(
          :item="joint.items[itemIndex]"
          :itemOpened="false"
          :itemActive="true")
</template>

<script>
export default {
  name: 'jointCurrent',
  props: ['item', 'joint', 'height'],
  components: {
    nodeItemsItem: () => import('components/node_feed/node_items_item.vue'),
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
