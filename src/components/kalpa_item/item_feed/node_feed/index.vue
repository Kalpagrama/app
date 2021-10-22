<style lang="sass">
.sphere-item
  &:hover
    background: rgb(50, 50, 50)
</style>

<template lang="pug">
  div(
    :style=`{
      position: 'relative',
      borderRadius: '10px',
      overflow: 'hidden',
      ...styles,
    }`
  ).row.full-width.items-start.content-start
    slot(name="wrapper")
    //- wrapper
    div(
      :style=`{
      position: 'relative',
      background: 'rgb(35,35,35)',
      borderRadius: '0px 0px 10px 10px',
      // ...styles,
    }`).row.full-width.items-start.content-start
      slot(name="wrapper-inside")
      //- HEADER: author, createdAt, actions, date, views
      essence-header(
        v-if="showHeader && node.oid"
        :essence="node"
        :itemState="data"
        :showAuthorAlways="showAuthorAlways"
        :style=`{
        order: orderHeader,
      }`)
      //- ITEMS: one or two
      slot(name="items")
      composition(
        v-if="showItems && !$slots.items && node.items.length === 1"
        :composition="node.items[0]"
        :showContext="showContext"
        :itemState="data"
        :isVisible="isVisible"
        :isActive="isActive"
        :nodeOid="node.oid")
      essence-items(
        v-if="showItems && !$slots.items && node.items.length === 2"
        :node="node"
        :itemState="data"
        :isActive="isActive"
        :isVisible="isVisible")
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
          q-badge(v-if="node.items[0].countStat.countNodes>1" align="top" dark rounded color="green") {{node.items[0].countStat.countNodes}}
      //- SPHERES
      essence-spheres(
        v-if="showSpheres && node.spheres.length > 0"
        :node="node"
        :itemState="data"
        :style=`{
        order: 3,
      }`).q-py-xs
    //- FOOTER: actions, slot
    essence-actions(
      v-if="showActions && node.oid"
      :essence="node"
      :itemState="data"
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
import essenceItems from 'src/components/essence/essence_items'
import essenceActions from 'src/components/essence/essence_actions.vue'
import essenceSpheres from 'src/components/essence/essence_spheres'
import essenceHeader from 'src/components/essence/essence_header'
import { RxCollectionEnum } from 'src/system/rxdb'
import { assert } from 'src/system/common/utils'
import cloneDeep from 'lodash/cloneDeep'

// этот элемент показывается в virtual scroll и не может иметь состояния!!! data - запрещено! И во вложенных - тоже!!!
export default {
  name: 'nodeFeed',
  components: {
    essenceItems,
    essenceActions,
    essenceSpheres,
    essenceHeader
  },
  props: {
    node: { type: Object },
    itemState: { type: Object},
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
    showContext: { type: Boolean },
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
  computed: {
    data() {
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      assert(this.itemState)
      let key = this.$options.name
      if (!this.itemState[key]) {
        this.$set(this.itemState, key, {
         // key: value
        })
      }
      return this.itemState[key]
    },
    nodeName () {
      if (this.node.items.length === 1 || this.node.vertices[0] === 'ESSENCE') {
        return this.node.name
      } else if (this.node.vertices[0] === 'ASSOCIATIVE') {
        return 'Ассоциация'
      } else {
        return this.$nodeItemType(this.node.vertices[0]).name + '  -  ' + this.$nodeItemType(this.node.vertices[1]).name
      }
    },
    nodeEssenceLink () {
      if (this.node.items.length === 2) {
        return `/cube/${this.node.items[0].oid}?oid=${this.node.oid}`
      } else {
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
  }
}
</script>
