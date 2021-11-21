<style lang="sass">
.sphere-item
  &:hover
    background: rgb(50, 50, 50)
</style>

<template lang="pug">
div(
  :style=`{
  position: 'relative',
  overflow: 'hidden',
  borderRadius: '10px',
  minHeight: height + 'px',
  maxHeight: height + 'px',
  minWidth: height*1.6 + 'px',
  // background: 'linear-gradient(0deg, rgba(40,40,40,1) 0%, rgba(40,40,40,0) 100%)',
}`).b-0
  q-resize-observer(@resize="data.nodeWidth = $event.width")
  //image
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
  div(:style=`{pointerEvents: 'none', background: 'linear-gradient(0deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 50%)', zIndex: 10}`).fit.absolute-center
  div(:style=`{zIndex: 10}`).row.full-width.absolute-bottom
    //- NAME: dynamic link/ dynamic fontSize
    router-link(
      v-if="showName && node.oid"
      :to="nodeEssenceLink"
      :style=`{
      minHeight: '60px',
      fontSize: fontSize+'px',
      fontWeight: fontWeight,
      textAlign: 'center',
    }`
    ).row.full-width.items-end.content-end.justify-center
      span.text-grey-5.ellipsis.q-px-sm.q-pb-xs {{ nodeName }}
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
import { reactive } from 'vue'

// этот элемент показывается в virtual scroll и не может иметь состояния!!! data - запрещено! И во вложенных - тоже!!!
export default {
  name: 'nodeFeedTiny',
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
    showBadge: {type: Boolean, default: true},
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
    actionsColor: { type: String, default: 'grey-9' },
    height: { type: Number, required: true }
  },
  computed: {
    data() {
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      assert(this.itemState)
      let key = this.$options.name
      if (!this.itemState[key]) {
        this.$set_deprecated(this.itemState, key, reactive({
         // key: value
          nodeWidth: 100
        }))
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
      let w = this.data.nodeWidth
      if (l < 20 && w > 300) return 22
      else if (l < 30 && w > 300) return 20
      else if (l < 40 && w > 300) return 16
      else if (l <= 20 && w < 300) return 12
      else if (l > 20 && w < 300) return 12
      else return 14
    },
    fontWeight () {
      return 800
    }
  }
}
</script>
