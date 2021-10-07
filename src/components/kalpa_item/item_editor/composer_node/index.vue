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
    div(
      :style=`{
      position: 'relative',
      background: 'rgb(35,35,35)',
      borderRadius: '10px',
      ...styles,
    }`).row.full-width.items-start.content-start
      //- HEADER: author, createdAt, actions, date, views
      essence-header(
        v-if="showHeader && node.oid"
        :essence="node"
        :showAuthorAlways="showAuthorAlways"
        :style=`{
      }`)
      composition-editor(:node="node" :isActive="isActive" :isVisible="isVisible")
      //- NAME: dynamic link/ dynamic fontSize
      slot(name="name")
      q-input(
        v-if="showName && node.oid"
        v-model="node.name"
        :disable="lockName"
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
import essenceHeader from 'src/components/essence/essence_header'
import editSpheres from 'src/pages/app/content/node_editor/edit_spheres.vue'
import editCategory from 'src/pages/app/content/node_editor/edit_category.vue'
import compositionEditor from 'src/components/kalpa_item/item_editor/composition_editor.vue'
import { ObjectTypeEnum } from 'src/system/common/enums'

export default {
  name: 'composerNode',
  components: {
    essenceHeader,
    editSpheres,
    editCategory,
    compositionEditor
  },
  props: {
    item: { type: Object, required: true },
    showHeader: { type: Boolean, default: true },
    showName: { type: Boolean, default: true },
    lockName: { type: Boolean, default: false },
    showAuthorAlways: { type: Boolean, default: false },
    styles: { type: Object },
    action: { type: Function, required: false },
    publish: { type: Boolean, default: false },
    isVisible: {type: Boolean, default: false},
    isActive: {type: Boolean, default: false},
  },
  data () {
    return {
      node: null,
      publishing: false,
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
