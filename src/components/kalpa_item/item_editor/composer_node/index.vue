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
    //- item finder
    q-dialog(
      v-model="itemFinderShow"
      position="bottom"
      :maximized="true")
      kalpa-finder(
        :height="$q.screen.height"
        :pageFilter=`{
            whiteList: ['nodes'],
        }`
        @item="itemFound"
        @close="itemFinderShow = false"
      ).b-30
    //- item editor
    q-dialog(
      v-model="itemEditorShow"
      position="bottom"
      :maximized="true"
      :no-esc-dismiss="true")
      span.text-white.text-h1 no impl!!!! TODO!!!
      //item-editor(
      //  v-if="joint.items[1]"
      //  :joint="joint"
      //  :item="joint.items[1]"
      //  @remove="itemRemove"
      //  @close="itemEditorShow = false")
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
        v-bind="$props").br
      q-responsive(v-else-if="!node.items.length" :ratio="16/8").full-width.br
        q-btn(stack no-caps round outline icon="add" color="green" size="lg"
          :label="$t('pick element for node')"
          @click="itemFinderShow = true").fit
      //- NAME: dynamic link/ dynamic fontSize
      slot(name="name")
      q-input(
        v-if="showName && node.oid"
        v-model="node.name"
        color="green"
        borderless dark dense
        :placeholder="$t('enter your essence')"
        :input-style=`{
          // minHeight: '60px',
          fontSize: fontSize+'px',
          textAlign: 'center',
        }`).row.full-width.items-center.content-center.justify-center.q-pa-md
      edit-spheres(v-if="node.name" ref="editSpheres" :node="node")
      //q-input(
      //  v-model="node.description"
      //  borderless dark dense
      //  filled
      //  clearable
      //  autogrow
      //  :label="$t('enter description')").row.full-width
      q-expansion-item(v-if="node.name" icon="description" :label="$t('Description')" dark).full-width
        q-editor(v-model="node.description"
          dark
          :definitions=`{bold: {label: 'Bold', icon: null, tip: 'My bold tooltip'}}`
        )
      q-btn(v-if="node.name"
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
import editSpheres from 'src/pages/app/content/node_editor/edit_spheres.vue'
import editCategory from 'src/pages/app/content/node_editor/edit_category.vue'
import { ObjectTypeEnum } from 'src/system/common/enums'

export default {
  name: 'composerNode',
  components: {
    essenceItems,
    essenceActions,
    essenceSpheres,
    essenceHeader,
    editSpheres,
    editCategory
  },
  props: {
    item: { type: Object, required: true },
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
    actionsColor: { type: String, default: 'grey-9' },

    action: {
      type: Function,
      required: false
    },
    publish: {
      type: Boolean,
      default: false
    }

  },
  data () {
    return {
      node: null,
      publishing: false,
      itemFinderShow: false,
      itemEditorShow: false
    }
  },
  watch: {
    item: {
      immediate: true,
      handler(to) {
        this.node = cloneDeep(to)
      }
    }
  },
  computed: {
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
  },
  methods: {
    async itemFound (item) {
      this.$log('itemFound', item)
      if (item.type === ObjectTypeEnum.NODE) {
        this.$log('itemFound2', item)
        assert(item.oid)
        let fullItem = await this.$rxdb.get(RxCollectionEnum.OBJ, item.oid, {clientFirst: true})
        this.node.items.push(fullItem.items[0])
      } else if (item.type.in(ObjectTypeEnum.VIDEO, ObjectTypeEnum.BOOK)) {
        this.itemEditorShow = true
      } else {
        throw new Error('not impl type=' + item.type)
      }
      this.itemFinderShow = false
    },
    async nodePublish () {
      if (this.action) {
        this.$log('nodePublish', this.node)
        await this.action(this.node)
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
    this.node.author = {
      oid: this.$store.getters.currentUser.oid,
      name: this.$store.getters.currentUser.name,
      thumbUrl: this.$store.getters.currentUser.thumbUrl
    }
    this.node.createdAt = Date.now()
    this.node.countStat.countViews = 0
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
