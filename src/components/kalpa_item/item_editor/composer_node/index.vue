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
      essence-header(
        v-if="showHeader && node.oid"
        :essence="node"
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
      essence-items(
        v-if="showItems && !$slots.items && node.items.length === 2"
        v-bind="$props")
      //- NAME: dynamic link/ dynamic fontSize
      slot(name="name")
      q-input(
        v-if="showName && node.oid"
        v-model="node.name"
        :style=`{
        order: 4,
        minHeight: '60px',
        fontSize: fontSize+'px',
        textAlign: 'center',
      }`
      ).row.full-width.items-center.content-center.justify-center.q-pa-md
      //- SPHERES
      essence-spheres(
        v-if="showSpheres && node.spheres.length > 0"
        :node="node"
        :style=`{
        order: 3,
      }`)
    //- FOOTER: actions, slot
    essence-actions(
      v-if="showActions && node.oid"
      :essence="node"
      :nodeBackgroundColor="nodeBackgroundColor"
      :nodeActionsColor="nodeActionsColor"
      :isActive="isActive"
      :isVisible="isVisible"
      :style=`{
      order: 5,
    }`)
    q-btn(
      :label="$t('Create node')"
      :loading="publishing"
      :style=`{height: '50px', borderRadius: '0px'}`
      @click="nodePublish").row.full-width.text-green.text-bold
    slot(name="footer")
</template>

<script>
import { ObjectCreateApi } from 'src/api/object_create'
import { RxCollectionEnum } from 'src/system/rxdb'
import { assert } from 'src/system/common/utils'
import cloneDeep from 'lodash/cloneDeep'
import essenceItems from 'src/components/essence/essence_items'
import essenceActions from 'src/components/essence/essence_actions.vue'
import essenceSpheres from 'src/components/essence/essence_spheres'
import essenceHeader from 'src/components/essence/essence_header'

export default {
  name: 'composerNode',
  components: {
    essenceItems,
    essenceActions,
    essenceSpheres,
    essenceHeader,
  },
  data () {
    return {
      node: cloneDeep(this.item),
      publishing: false
    }
  },
  props: {
    item: {type: Object, required: true},
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
    actionsColor: {type: String, default: 'grey-9'},

    action: {
      type: Function,
      required: false
    },
    publish: {
      type: Boolean,
      default: false
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
        return `/cube/${this.node.items[0].oid}?oid=${this.node.oid}`
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
  methods: {
    async nodePublish () {
      if (this.action) {
        this.$log('nodePublish', this.joint)
        await this.action(this.joint)
      }
      if (this.publish) {
        try {
          this.$log('nodePublish start')
          this.publishing = true
          // create...
          let nodeCreated = await ObjectCreateApi.essenceCreate(this.node)
          this.$log('nodePublish nodeCreated', nodeCreated)
          this.$ym('NODE_CREATED')
          this.$emit('close', nodeCreated)
        } catch (e) {
          this.$log('nodePublish error', e)
          this.publishing = false
        } finally {
          this.publishing = false
        }
      }
    }
  },
  mounted () {
    this.$log('mounted', this.node)
    this.node.author = {oid: this.$store.getters.currentUser.oid, name: this.$store.getters.currentUser.name, thumbUrl: this.$store.getters.currentUser.thumbUrl}
    this.node.createdAt = Date.now()
    this.node.countStat.countViews = 0
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
