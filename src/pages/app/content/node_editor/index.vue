<template lang="pug">
.row.full-width.items-between.justify-center
  div(
    v-if="$q.screen.gt.sm"
    :style=`{maxWidth: 600+'px'}`).row.full-width
    //- name
    div(:style=`{height: '60px'}`).row.full-width
      //- span.text-white What do you see
      q-input(
        v-model="node.name"
        borderless dark
        ref="nameInput"
        type="textarea" autogrow
        :placeholder="$t('What do you see?')"
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
    //- category, spheres,
    .row.full-width.items-center.content-center.q-px-sm
      edit-category(:node="node")
      .col
        transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
          node-spheres(
            v-if="node.spheres.length > 0"
            :node="node"
            :disabled="true"
            @sphere="sphereDelete")
    div(:style=`{}`).row.full-width.items-center.content-center.q-px-md
      .col
        q-input(
          v-model="sphere"
          borderless dark dense
          :placeholder="$t('Add spheres')"
          :input-style=`{
            paddingLeft: '8px',
          }`
          @blur="sphereAdd()"
          @keydown.enter="sphereAdd()"
          ).full-width
      //- Delete from notes
      q-btn(
        v-if="node.wsItemType === 'WS_NODE'"
        outline no-caps color="red"
        :disable="node.name.length === 0"
        :loading="nodeSaving"
        :style=`{}`
        @click="nodeDeleteAction()"
        ).q-mr-sm
        span {{$t('Delete draft')}}
      //- Save to notes
      q-btn(
        v-if="node.wsItemType !== 'WS_NODE'"
        outline no-caps color="grey-8"
        :disable="node.name.length === 0"
        :loading="nodeSaving"
        :style=`{}`
        @click="nodeSaveAction()"
        ).q-mr-sm
        span {{$t('Save as draft')}}
      //- Publish
      q-btn(
        color="green" no-caps
        :disable="!canPublish"
        :loading="nodePublishing"
        :style=`{
          //- height: '50px',
        }`
        @click="nodePublish()"
        )
        span {{$t('Publish')}}
    //- .row.full-width
      small.text-white id: {{ node.id }}
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
        transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
          node-spheres(
            v-if="node.spheres.length > 0"
            :node="node"
            :disabled="true"
            @sphere="sphereDelete")
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
      //- sphere input
      transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
        q-input(
          v-if="node.name.length > 0"
          v-model="sphere"
          borderless dark desne
          :placeholder="$t('Add sphere of essence')"
          :input-style=`{
            textAlign: 'center',
          }`
          @blur="sphereAdd()"
          @keydown.enter="sphereAdd()"
          ).full-width
        transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
          div(v-if="sphere.length > 0").row.full-width.q-px-md
            q-btn(
              flat no-caps
              :style=`{}`
              @click="sphereAdd()"
              ).full-width
    transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
      div(
        v-if="node.name.length > 0"
        ).row.full-width.q-pa-md
        edit-category(:node="node")
        q-btn(
          color="green" no-caps
          :disable="!canPublish"
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

import nodeSpheres from 'components/node/node_spheres/index.vue'
import editCategory from './edit_category.vue'

export default {
  name: 'nodeEditor',
  components: {
    nodeSpheres,
    editCategory,
  },
  props: ['player', 'contentKalpa'],
  data () {
    return {
      // node: {
      //   name: '',
      //   items: [],
      //   spheres: [],
      //   category: null,
      //   layout: 'HORIZONTAL',
      //   vertices: [],
      // },
      nodePublishing: false,
      nodeDeleting: false,
      nodeSaving: false,
      sphere: '',
    }
  },
  computed: {
    canPublish () {
      return this.node.name.length > 0 && this.node.category
    },
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
    // 'player.nodeEditing': {
    //   deep: true,
    //   immediate: true,
    //   async handler (to, from) {
    //     this.$log('player.nodeEditing TO', to ? to.name : null)
    //     if (to === null) {
    //       // this.$q.notify('Node create!')
    //       this.player.setState('nodeEditing', this.node)
    //     }
    //     else {
    //       // this.$q.notify('Node use from player!')
    //       // We got from workspace
    //       if (this.node.id && this.node.wsItemType === 'WS_NODE') {
    //         // Do nothing...
    //       }
    //       else {
    //         if (this.node.name.length > 0) {
    //           // Save this to drafts...
    //           // this.player.setState(await this.nodeSave())
    //         }
    //         else {
    //           // Do nothing...
    //         }
    //       }
    //       // Save node here
    //       if (!this.nodeSaved) {
    //         this.nodeSaved = true
    //         this.node = to
    //       }
    //       if (this.node.name.length > 0 && this.node.wsItemType !== 'WS_NODE') {
    //         // alert('Save node to drafts!')
    //       }
    //     }
    //   }
    // }
  },
  methods: {
    sphereAdd () {
      this.$log('sphereAdd')
      // checks
      if (this.sphere.length === 0) return
      if (this.node.name === this.sphere) {
        this.$q.notify({type: 'negative', position: 'top', message: this.$t('Add another')})
        this.sphere = ''
        return
      }
      if (this.node.spheres.find(s => s.name === this.sphere)) {
        this.$q.notify({type: 'negative', position: 'top', message: this.$t('Already added!')})
        this.sphere = ''
        return
      }
      if (this.node.spheres.length >= 5) {
        this.$q.notify({type: 'negative', position: 'top', message: this.$t('Maximum 5 spheres!')})
        return
      }
      // do stuff
      this.node.spheres.push({name: this.sphere})
      this.sphere = ''
    },
    sphereDelete (s) {
      this.$log('sphereDelete', s)
      this.node.spheres = this.node.spheres.filter(i => i.name !== s.name)
    },
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
          __typename: 'Composition',
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
          __typename: 'Composition',
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
          __typename: 'Composition',
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
        this.nodeSaving = true
        await this.$wait(500)
        this.player.setState('node', await this.nodeSave())
        // TODO: set nodeMode: edit
        this.$log('nodeSaveAction done')
        this.nodeSaving = false
      }
      catch (e) {
        this.$log('nodeSaveAction error', e)
        this.nodeSaving = false
      }
    },
    async nodeDeleteAction () {
      try {
        this.$log('nodeDeleteAction start')
        this.nodeDeleting = true
        await this.$wait(500)
        // TODO: set nodeMode: null
        // await this.$rxdb.remove(this.node.id)
        await this.node.remove(true)
        this.player.setState('node', null)
        this.$log('nodeDeleteAction done')
        this.nodeDeleting = false
      }
      catch (e) {
        this.$log('nodeDeleteAction error', e)
        this.nodeDeleting = false
      }
    },
    async nodeSave () {
      this.$log('nodeSave')
      let nodeInput = JSON.parse(JSON.stringify(this.node))
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
        await this.$wait(1000)
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
        // save content bookmark to "all" collection
        // await this.contentBookmarkSave()
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
      }
      catch (e) {
        this.$log('nodePublish error', e)
        this.$q.notify({type: 'negative', message: e.toString()})
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
    // TODO: autofocus only on desktop? android?
    // this.$wait(500).then(() => {
    //   this.$refs.nameInput.focus()
    // })
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
