<template lang="pug">
.row.full-width.items-between.justify-center
  //- ===
  //- Desktop editor
  div(
    v-if="$q.screen.gt.sm"
    :style=`{maxWidth: 600+'px'}`).row.full-width
    //- name
    div(:style=`{height: '60px'}`).row.full-width
      q-input(
        v-model="node.name"
        borderless dark
        ref="nameInput"
        type="textarea" autogrow
        :placeholder="$t('What do you see?')"
        :autofocus="true"
        :input-style=`{
          paddingTop: '16px',
          paddingBottom: '10px',
          paddingLeft: '20px',
          paddingRight: '10px',
          //- textAlign: 'center',
          fontWeight: 'bold',
          fontSize: fontSize+'px',
          lineHeight: 1.3,
          minHeight: '60px',
        }`
        ).full-width
    //- category and spheres
    edit-spheres(:node="node")
      template(v-slot:left)
        edit-category(
          :node="node"
          :class=`{
            br: !node.category && categoryError,
          }`
          :style=`{
            borderRadius: '10px',
          }`)
      template(v-slot:right)
        .row
          //- Delete from notes
          q-btn(
            v-if="node.wsItemType === 'WS_NODE'"
            outline no-caps color="red"
            :loading="nodeSaving"
            :style=`{}`
            @click="nodeDeleteAction()"
            ).q-mr-sm
            span {{$t('Delete draft')}}
          //- Save to notes
          q-btn(
            v-if="node.wsItemType !== 'WS_NODE'"
            outline no-caps color="white"
            :loading="nodeSaving"
            :style=`{}`
            @click="nodeSaveAction()"
            ).q-mr-sm
            span {{$t('Save as draft')}}
          //- Publish
          q-btn(
            color="green" no-caps
            :loading="nodePublishing"
            :style=`{
              //- height: '50px',
            }`
            @click="nodePublish()"
            )
            span {{$t('Publish')}}
  //- ===
  //- Mobile editor
  div(
    v-if="$q.screen.lt.md"
    :style=`{maxWidth: 600+'px',}`).row.fit.items-between.content-between
    .row.full-width.items-start.content-start
      div(
        :style=`{
          borderRadius: '0 0 10px 10px',
          background: 'rgb(40,40,40)',
        }`
        ).row.full-width.items-start.content-start
        ////- transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
        //  node-spheres(
        //    v-if="node.spheres.length > 0"
        //    color="text-white"
        //    :node="node"
        //    :disabled="true"
        //    @sphere="sphereDelete")
        q-input(
          v-model="node.name"
          borderless dark
          ref="nameInput"
          type="textarea" autogrow
          :placeholder="$t('What do you see?')"
          :input-style=`{
            paddingTop: '20px',
            paddingBottom: '10px',
            paddingLeft: '40px',
            paddingRight: '40px',
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize: fontSize+'px',
            lineHeight: 1.3,
            minHeight: '60px',
          }`
          ).full-width
      //- category and spheres
      .row.full-width.q-pt-sm
        edit-spheres(
          v-if="node.name.length > 0"
          :node="node")
          template(v-slot:left)
            edit-category(
              v-if="node.name.length > 0"
              :node="node"
              :class=`{
                br: !node.category && categoryError,
              }`
              :style=`{
                borderRadius: '10px',
              }`)
          template(v-slot:right)
            div(v-if="node.name.length > 0").row
              //- Delete from notes
              q-btn(
                v-if="node.wsItemType === 'WS_NODE'"
                outline no-caps color="red"
                :loading="nodeSaving"
                :style=`{}`
                @click="nodeDeleteAction()"
                ).q-mr-sm
                span {{$t('Delete draft')}}
              //- Save to notes
              q-btn(
                v-if="node.wsItemType !== 'WS_NODE'"
                outline no-caps color="white"
                :loading="nodeSaving"
                :style=`{}`
                @click="nodeSaveAction()"
                ).q-mr-sm
                span {{$t('Save as draft')}}
    //- publish
    transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
      div(
        v-if="node.name.length > 0"
        ).row.full-width.q-pa-md
        q-btn(
          color="green" no-caps
          :loading="nodePublishing"
          :style=`{
            height: '50px',
          }`
          @click="nodePublish()"
          ).full-width
          span {{$t('Publish')}}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { ObjectCreateApi } from 'src/api/object_create'
import { UserApi } from 'src/api/user'

import editSpheres from './edit_spheres.vue'
import editCategory from './edit_category.vue'
import { ObjectTypeEnum } from 'src/system/common/enums'

export default {
  name: 'nodeEditor',
  components: {
    editSpheres,
    editCategory,
  },
  props: ['player', 'contentKalpa'],
  data () {
    return {
      nodePublishing: false,
      nodeDeleting: false,
      nodeSaving: false,
      sphere: '',
      categoryError: false,
    }
  },
  computed: {
    fontSize () {
      let l = this.node.name.length
      if (l < 20) return 20
      else if (l < 30) return 16
      else if (l < 40) return 14
      else return 12
    },
    node () {
      return this.player.node
    }
  },
  watch: {
  },
  methods: {
    compositionCreate () {
      let composition
      // VIDEO select 30 sec from currentTime
      if (this.contentKalpa.type === 'VIDEO') {
        composition = {
          id: Date.now().toString(),
          thumbUrl: this.contentKalpa.thumbUrl,
          thumbHeight: this.contentKalpa.thumbHeight,
          thumbWidth: this.contentKalpa.thumbWidth,
          outputType: 'VIDEO',
          layers: [
            {
              id: Date.now().toString(),
              contentOid: this.contentKalpa.oid,
              figuresAbsolute: this.player.figures
            },
          ],
          operation: { items: null, operations: null, type: 'CONCAT'},
          type: ObjectTypeEnum.COMPOSITION,
        }
      }
      // IMAGE select all image, or whole ?
      else if (this.contentKalpa.type === 'IMAGE') {
        composition = {
          id: Date.now().toString(),
          thumbUrl: this.contentKalpa.thumbUrl,
          thumbHeight: this.contentKalpa.thumbHeight,
          thumbWidth: this.contentKalpa.thumbWidth,
          outputType: 'IMAGE',
          layers: [
            {
              id: Date.now().toString(),
              contentOid: this.contentKalpa.oid,
              figuresAbsolute: this.player.figures
            }
          ],
          operation: { items: null, operations: null, type: 'CONCAT'},
          type: ObjectTypeEnum.COMPOSITION,
        }
      }
      // BOOK
      else if (this.contentKalpa.type === 'BOOK') {
        composition = {
          id: Date.now().toString(),
          thumbUrl: this.contentKalpa.thumbUrl,
          thumbHeight: this.contentKalpa.thumbHeight,
          thumbWidth: this.contentKalpa.thumbWidth,
          outputType: 'BOOK',
          layers: [
            {
              id: Date.now().toString(),
              contentOid: this.contentKalpa.oid,
              figuresAbsolute: this.player.figures
            },
          ],
          operation: { items: null, operations: null, type: 'CONCAT'},
          type: ObjectTypeEnum.COMPOSITION,
        }
      }
      // AUDIO: like video 30 sec from currentTime
      // WEB
      return composition
    },
    async contentBookmarkSave () {
      this.$log('contentBookmarkSave')
      // ---
      // add content to bookmarks if all is good...
      let {items: [bookmark]} = await this.$rxdb.find({selector: {rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK, oid: this.contentKalpa.oid}})
      if (bookmark) {
        // revive ?
      }
      else {
        let bookmarkInput = {
          type: this.contentKalpa.type,
          oid: this.contentKalpa.oid,
          name: this.contentKalpa.name,
          thumbUrl: this.contentKalpa.thumbUrl,
          isSubscribed: true
        }
        bookmark = await this.$rxdb.set(RxCollectionEnum.WS_BOOKMARK, bookmarkInput)
        if (!await UserApi.isSubscribed(this.contentKalpa.oid)) await UserApi.subscribe(this.contentKalpa.oid)
      }
    },
    async nodeSaveAction () {
      try {
        this.$log('nodeSaveAction start')
        if (this.node.name.length === 0) throw new Error(this.$t('Empty node name!'))
        this.nodeSaving = true
        // await this.$wait(500)
        this.player.setState('node', await this.nodeSave())
        // TODO: set nodeMode: edit
        this.$log('nodeSaveAction done')
        this.nodeSaving = false
      }
      catch (e) {
        this.$log('nodeSaveAction error', e)
        this.$q.notify({type: 'negative', position: 'top', message: e.toString()})
        this.nodeSaving = false
      }
    },
    async nodeDeleteAction () {
      try {
        this.$log('nodeDeleteAction start')
        this.nodeDeleting = true
        // await this.$wait(500)
        // TODO: set nodeMode: null
        // await this.$rxdb.remove(this.node.id)
        await this.node.remove(true)
        this.player.setState('node', null)
        this.player.setState('nodeMode', null)
        this.$emit('pageId', null)
        this.$log('nodeDeleteAction done')
        this.nodeDeleting = false
      }
      catch (e) {
        this.$log('nodeDeleteAction error', e)
        this.$q.notify({type: 'negative', position: 'top', message: e.toString()})
        this.nodeDeleting = false
      }
    },
    async nodeSave () {
      this.$log('nodeSave')
      let nodeInput = JSON.parse(JSON.stringify(this.node))
      nodeInput.thumbUrl = this.contentKalpa.thumbUrl
      let nodeSaved = await this.$rxdb.set(RxCollectionEnum.WS_NODE, nodeInput)
      this.$log('nodeSaved', nodeSaved)
      return nodeSaved
    },
    async nodePublish () {
      try {
        this.$log('nodePublish start')
        // ---
        // loading
        this.nodePublishing = true
        if (this.node.name.length === 0) throw new Error(this.$t('Empty node name!'))
        if (!this.node.category) {
          this.categoryError = true
          throw new Error(this.$t('Select node category!'))
        }
        // await this.$wait(1000)
        // ---
        // make node input
        let nodeInput = JSON.parse(JSON.stringify(this.node))
        // nodeInput.items[0] = this.compositionCreate()
        if (nodeInput.name.length === 0) {
          throw new Error(this.$t('Empty essence !'))
        }
        this.$log('nodeInput', nodeInput)
        // ---
        // create node, publish this shit
        let nodeCreating = await ObjectCreateApi.essenceCreate(nodeInput)
        this.$ym('NODE_CREATED')
        // this.$emit('published', nodeCreating)
        // this.$store.commit('ui/stateSet', ['nodeCreating', true])
        // this.$q.notify({type: 'positive', message: 'Node published ' + nodeCreating.oid})
        // ---
        // Delete draft if it is a draft, man
        if (nodeInput.wsItemType === 'WS_NODE') {
          // await this.node.remove(true)
          await this.$rxdb.remove(this.node.id)
        }
        this.player.setState('nodeMode', 'focus')
        this.player.setState('node', nodeCreating)
        // this.$emit('pageId', null)
        // save content bookmark to "all" collection
        await this.contentBookmarkSave()
        // ---
        // done
        this.nodePublishing = false
        // ---
        // kill player figures, it will destroy node editor
        // this.player.setState('figures', null)
        // ---
        // where to wait for the progress of node creating ?
        // here ?
        // this.$emit('node', nodeCreating)
        this.$emit('pageId', null)
      }
      catch (e) {
        this.$log('nodePublish error', e)
        this.$q.notify({type: 'negative', position: 'top', message: e.toString()})
        this.nodePublishing = false
      }
    },
    async nodeDelete () {
      this.$log('nodeDelete')
      // delete draft ?
      if (this.node.wsItemType === 'WS_NODE') {
        if (!confirm('Удалить?')) return
        // await this.node.remove(true)
        await this.$rxdb.remove(this.node.id)
      }
      // save draft ?
      else {
        this.player.setState('node', null)
        this.player.setState('nodeMode', null)
        // this.player.events.emit('figure-delete')
        // this.player.setState('figureы', null)
      }
    },
  },
  created () {
    this.$log('created')
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
