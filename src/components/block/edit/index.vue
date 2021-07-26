<style lang="sass">
.sphere-item
  &:hover
    background: rgb(50,50,50)
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
    node-header(
      v-if="showHeader && node.oid"
      :node="node"
      :showAuthorAlways="showAuthorAlways"
      :style=`{
        order: orderHeader,
      }`)
    //- ITEMS: one or two
    slot(name="items")
    composition(
      v-if="showItems && !$slots.items && node.items.length === 1"
      :composition="node.items[0]"
      :isVisible="isVisible"
      :isActive="isActive"
      :nodeOid="node.oid")
    node-items(
      v-if="showItems && !$slots.items && node.items.length === 2"
      v-bind="$props"
      :itemsStyles="itemsStyles"
      @itemActive="$emit('itemActive', $event)")
    //- NAME: dynamic link/ dynamic fontSize
    slot(name="name")
    router-link(
      v-if="showName && node.oid"
      :to="nodeEssenceLink"
      :style=`{
        order: 4,
        minHeight: '60px',
        fontSize: fontSize+'px',
        textAlign: 'center',
      }`
      ).row.full-width.items-center.content-center.justify-center.q-pa-md
      span(
        :class=`{
          'text-bold': node.name.length < 20
        }`
        ).text-white {{ nodeName }}
    //- SPHERES
    node-spheres(
      v-if="showSpheres && node.spheres.length > 0"
      :node="node"
      :style=`{
        order: 3,
      }`)
  //- FOOTER: actions, slot
  node-actions(
    v-if="showActions && node.oid"
    :node="node"
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
// import nodeItems from './node_items.vue'
import nodeItems from 'src/components/node/node_items/index.vue'
import nodeActions from 'src/components/node/node_actions.vue'
import nodeSpheres from 'src/components/node/node_spheres/index.vue'
import nodeHeader from 'src/components/node/node_header/index.vue'

export default {
  name: 'nodeFeed',
  components: {
    nodeItems,
    nodeActions,
    nodeSpheres,
    nodeHeader,
  },
  props: {
    node: {type: Object},
    nodeBackgroundColor: {type: String, default: 'rgb(30,30,30)'},
    nodeActionsColor: {type: String, default: 'rgb(200,200,200)'},
    isActive: {type: Boolean},
    isVisible: {type: Boolean},
    showHeader: {type: Boolean, default: true},
    showName: {type: Boolean, default: true},
    showAuthorAlways: {type: Boolean, default: false},
    showActions: {type: Boolean, default: true},
    showSpheres: {type: Boolean, default: true},
    showSpheresAlways: {type: Boolean, default: false},
    showCategory: {type: Boolean, default: true},
    showItems: {type: Boolean, default: true},
    orderHeader: {type: Number, default: -1},
    orderName: {type: Number, default: 1},
    orderSpheres: {type: Number, default: 2},
    orderActions: {type: Number, default: 3},
    itemsStyles: { type: Array, default () { return [{}, {}] } },
    styles: {type: Object},
    borderRadius: {type: String, default: '10px'},
    actionsColor: {type: String, default: 'grey-9'}
  },
  data () {
    return {
    }
  },
  computed: {
    nodeName () {
      if (this.node.items.length === 1 || this.node.vertices[0] === 'ESSENCE') {
        return this.node.name
      }
      else if (this.node.vertices[0] === 'ASSOCIATIVE') {
        return 'Ассоциация'
      }
      else {
        return this.$nodeItemType(this.node.vertices[0]).name + '  -  ' + this.$nodeItemType(this.node.vertices[1]).name
      }
    },
    nodeEssenceLink () {
      if (this.node.items.length === 2) {
        return `/graph/${this.node.items[0].oid}?oid=${this.node.oid}`
      }
      else {
        return '/node/' + this.node.oid
        // return '/sphere-full/' + this.node.sphereFromName.oid
      }
    },
    category () {
      if (!this.node) return null
      return this.$store.getters.nodeCategories.find(c => c.type === this.node.category)
    },
    fontSize () {
      let l = this.node.name.length
      if (l < 20) return 22
      else if (l < 30) return 20
      else if (l < 40) return 16
      else return 14
    }
  },
  mounted () {
    // this.$log('mounted', this.node.name)
  }
}
</script>
