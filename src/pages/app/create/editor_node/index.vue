<template lang="pug">
div(style=`position: relative`).column.fit
  //- //- publish node
  //- transition(appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
  div(style=`position: absolute; zIndex: 1000; bottom: 10px`).row.full-width.justify-center
    q-btn(rounded style=`height: 50px; width: 250px` color="primary" no-caps @click="nodeCreate()" :loading="nodeCreating") Опубликовать
  //- dialogs
  q-dialog(ref="showDialog" :maximized="true" transition-show="slide-up" transition-hide="slide-down")
    spheres-find(v-if="showShperesFind" @sphereAdd="sphereAdd" @close="$refs.showDialog.hide(), showShperesFind = false")
    find-type(v-if="showTypeFind" @type="$event => (typeChoosen($event), $refs.showDialog.hide(), showTypeFind = false)")
    find-video(v-if="showVideoFind" @video="videoChoosen" @close="$refs.showDialog.hide(), showVideoFind = false")
    find-image(v-if="showImageFind" @close="$refs.showDialog.hide(), showImageFind = false")
    video-edit(v-if="showVideoEdit" @close="$refs.showDialog.hide(), showVideoEdit = false" :url="url" :points="[]")
  //- node
  .row.bg-grey-3.q-pa-md
    node(:node="node" :nodeFull="nodeFull" :types="types")
      template(v-slot:name)
        q-input(v-model="nodeFull.name" borderless :input-class="['text-center']" placeholder="В чем суть?").fit
      template(v-slot:fragment_none="{id}")
        .row.fit.items-center.justify-center
          q-btn(flat round color="primary" icon="add" size="lg" @click="typeFind(id)")
      template(v-slot:fragment_actions)
        q-btn(flat round icon="clear" color="white" @click="typeOne = 'none'")
  //- spheres
  div(style=`borderTop: 1px solid #eee; height: 50px`).row.full-width.items-center
    .col.full-height
      div(v-if="nodeFull.spheres.length === 0" @click="spheresFind").row.fit.items-center.hr.cursor-pointer
        span.text-grey-8.q-ml-md Добавь тэги
      div(v-else).row.fit.q-px-sm
        div(style=`maxWidth: 100%`).row.fit.items-center.bg-white.no-wrap.scroll
          div(v-for="(t, ti) in nodeFull.spheres" :key="ti" style=`height: 30px; borderRadius: 5px`).q-pa-xs.q-mr-sm.bg-grey-2
            span #
            span {{ t.name }}
            //- div(style=`height: 30px; width: 30px`)
            q-btn(icon="clear" @click="sphereDelete(t, ti)" dense flat round size="xs" color="black")
    q-btn(v-if="nodeFull.spheres.length < 4" flat round dense icon="add" color="primary" size="md" @click="spheresFind").q-mx-sm
</template>

<script>
import node from 'components/node'
import editorVideo from '../editor_video'
import fragment from './fragment'
import spheresFind from 'components/spheres_find'
import findType from 'components/find_type'
import findImage from 'components/find_image'
import findVideo from 'components/find_video'
import videoEdit from 'components/video_edit'

export default {
  name: 'editorNode',
  components: {node, fragment, videoEdit, findType, findVideo, findImage, spheresFind, editorVideo},
  data () {
    return {
      typeId: 'one',
      types: {
        one: 'none',
        two: 'none'
      },
      node: {
        type: 'NODE',
        name: '',
        oid: '',
        thumbUrl: []
      },
      nodeFull: {
        name: '',
        spheres: [],
        fragments: []
      },
      url: '',
      nodeCreating: false,
      showDialog: false,
      showTypeFind: false,
      showShperesFind: false,
      showVideoFind: false,
      showImageFind: false,
      showVideoEdit: false,
      showImageEdit: false,
      showQuoteEdit: false
    }
  },
  methods: {
    typeFind (id) {
      this.$log('typeFind', id)
      this.typeId = id
      this.showTypeFind = true
      this.$refs.showDialog.show()
    },
    async typeChoosen (t) {
      await this.$wait(400)
      this.$log('typeChoosen', t)
      // this.types[this.typeId] = t.id
      if (t.id === 'video') {
        this.showVideoFind = true
        this.$refs.showDialog.show()
      } else if (t.id === 'image') {
        this.showImageFind = true
        this.$refs.showDialog.show()
      }
    },
    async videoChoosen (v) {
      await this.$wait(400)
      this.$log('videoChoosen', v)
      this.url = v.url
      this.showVideoEdit = true
      this.$refs.showDialog.show()
    },
    spheresFind () {
      this.$log('spheresFind')
      this.showShperesFind = true
      this.$refs.showDialog.show()
    },
    sphereAdd (s) {
      this.$log('sphereAdd', s)
      // TODO: add sphere? if this tag is unique? or valid?
      if (!this.nodeFull.spheres.find(sphere => sphere.name === s.anme)) {
        this.nodeFull.spheres.push(s)
      } else {
        this.$log('the SAME sphere', s)
      }
    },
    sphereDelete (s, si) {
      this.$log('sphereDelete')
      this.nodeFull.spheres = this.nodeFull.spheres.filter(sphere => sphere.name !== s.name)
    },
    async nodeCreate () {
      try {
        this.$log('nodeCreate start', this.nodeFull)
        this.nodeCreating = true
        await this.$wait(3000)
        this.nodeCreating = false
        // // get contents
        // let contentOne = await this.$refs.fone.uploadContent()
        // let contentTwo = await this.$refs.ftwo.uploadContent()
        // // this.$log('contents', )
        // // mutate
        // let res = await this.$apollo.mutate({
        //   mutation: gql`
        //     mutation nodeCreate ($node: NodeInput!) {
        //       nodeCreate (node: $node) {
        //         oid
        //         type
        //         name
        //       }
        //     }
        //   `,
        //   variables: {
        //     node: {
        //       name: this.node.name,
        //       fragments: [contentOne, contentTwo],
        //       spheres: this.node.spheres
        //     }
        //   }
        // })
        // // done!
        // this.$log('nodeCreate', res)
        this.$log('nodeCreate done')
      } catch (e) {
        this.$log('nodeCreate error', e)
      }
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
