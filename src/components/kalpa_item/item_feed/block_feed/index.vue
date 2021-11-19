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
      :itemState="data"
      :showAuthorAlways="showAuthorAlways"
      :style=`{
      order: orderHeader,
    }`)
    div(:id="'item_image_for_render'").row.full-width
      masonry-cover(v-if="data.showMasonry" :block="block" :itemState="data" :style=`{height: '350px'}` @click.native="data.showMasonry = false")
      graph-view(
        v-else
        :maxHeight="450"
        :showMiniAddBtn="blockIsMine"
        :graphD3="block.graph"
        detailPosition="standard"
        @changed="block.setChanged(true)"
        :style=`{background: 'rgb(40,40,40)'}`)
    //- NAME: dynamic link/ dynamic fontSize

    slot(name="name")
    router-link(
      v-if="showName && block.oid"
      :to="'/block/' + this.block.oid"
      :style=`{
        order: 4,
        minHeight: '60px',
        fontSize: fontSize+'px',
        textAlign: 'center',
      }`
    ).row.full-width.items-center.content-center.justify-center.q-pa-md
      span(
        :class=`{
          'text-bold': block.name.length < 20
        }`
      ).text-white {{ block.name }}

    //- SPHERES
    essence-spheres(
      v-if="showSpheres && block.spheres.length > 0"
      :sphereOwner="block"
      :itemState="data"
      :style=`{
      order: 3,
    }`).q-py-xs
  //- FOOTER: actions, slot
  essence-actions(
    v-if="showActions && block.oid"
    :essence="block"
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
import masonryCover from 'src/components/kalpa_item/item_feed/block_feed/masonry_cover.vue'
import { assert } from 'src/system/common/utils'
import { reactive } from 'vue'

// этот элемент показывается в virtual scroll и не может иметь состояния!!! data - запрещено! И во вложенных - тоже!!!
export default {
  name: 'blockFeed',
  components: {
    essenceItems,
    essenceActions,
    essenceSpheres,
    essenceHeader,
    masonryCover
  },
  props: {
    block: { type: Object },
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
        this.$set_deprecated(this.itemState, key, reactive({
          showMasonry: true
        }))
      }
      return this.itemState[key]
    },
    blockIsMine () {
      return this.block.author.oid === this.$store.getters.currentUser.oid
    },
    fontSize () {
      let l = this.block.name.length
      if (l < 20) return 22
      else if (l < 30) return 20
      else if (l < 40) return 16
      else return 14
    },
  },
  methods: {
    masonryClick () {
      alert('masonryClick')
    }
  },
}
</script>
