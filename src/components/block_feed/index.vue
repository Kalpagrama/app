<style lang="sass">
.sphere-item
  &:hover
    background: rgb(50, 50, 50)
</style>

<template lang="pug">
  div(
    :style=`{
    position: 'relative',
    ...styles,
  }`
  ).row.full-width.items-start.content-start
    slot(name="wrapper")
    //- wrapper
    div(
      :style=`{
      position: 'relative',
      background: 'rgb(35,35,35)',
      borderRadius: borderRadius,
      ...styles,
    }`).row.full-width.items-start.content-start
      slot(name="wrapper-inside")
      //- HEADER: author, createdAt, actions, date, views
      essence-header(
        v-if="showHeader && block.oid"
        :essence="block"
        :showAuthorAlways="showAuthorAlways"
        :style=`{
        order: orderHeader,
      }`)
      graph-view(
        :height="700"
        :graphD3="block.graph"
        @changed="block.setChanged(true)"
        :style=`{background: 'rgb(40,40,40)'}`)
      //- NAME: dynamic link/ dynamic fontSize
      slot(name="name")
      .row.full-width.items-center.content-center.justify-center.q-pa-md
        span(
          :class=`{
          'text-bold': block.name.length < 20
        }`
        ).text-white {{ block.name }}
      //- SPHERES
      essence-spheres(
        v-if="showSpheres && block.spheres.length > 0"
        :node="block"
        :style=`{
        order: 3,
      }`)
    //- FOOTER: actions, slot
    essence-actions(
      v-if="showActions && block.oid"
      :essence="block"
      :nodeBackgroundColor="nodeBackgroundColor"
      :nodeActionsColor="nodeActionsColor"
      :isActive="isActive"
      :isVisible="isVisible"
      :style=`{
      order: 5,
    }`)
    slot(name="footer")
</template>

<script>
// import essenceItems from './node_items.vue'
import essenceItems from 'src/components/essence/essence_items/index.vue'
import essenceActions from 'src/components/essence/essence_actions.vue'
import essenceSpheres from 'src/components/essence/essence_spheres/index.vue'
import essenceHeader from 'src/components/essence/essence_header/index.vue'

export default {
  name: 'blockFeed',
  components: {
    essenceItems,
    essenceActions,
    essenceSpheres,
    essenceHeader
  },
  props: {
    block: { type: Object },
    nodeBackgroundColor: { type: String, default: 'rgb(30,30,30)' },
    nodeActionsColor: { type: String, default: 'rgb(200,200,200)' },
    isActive: { type: Boolean },
    isVisible: { type: Boolean },
    showHeader: { type: Boolean, default: true },
    showName: { type: Boolean, default: true },
    showAuthorAlways: { type: Boolean, default: false },
    showActions: { type: Boolean, default: true },
    showSpheres: { type: Boolean, default: true },
    showSpheresAlways: { type: Boolean, default: false },
    showCategory: { type: Boolean, default: true },
    showItems: { type: Boolean, default: true },
    orderHeader: { type: Number, default: -1 },
    orderName: { type: Number, default: 1 },
    orderSpheres: { type: Number, default: 2 },
    orderActions: { type: Number, default: 3 },
    itemsStyles: {
      type: Array,
      default () {
        return [{}, {}]
      }
    },
    styles: { type: Object },
    borderRadius: { type: String, default: '10px' },
    actionsColor: { type: String, default: 'grey-9' }
  },
  data () {
    return {}
  },
  computed: {
    fontSize () {
      let l = this.block.name.length
      if (l < 20) return 22
      else if (l < 30) return 20
      else if (l < 40) return 16
      else return 14
    }
  },
  mounted () {
  }
}
</script>
