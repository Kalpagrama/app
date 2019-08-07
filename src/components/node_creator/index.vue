<template lang="pug">
div(style=`position: relative`).row.full-width.content-start.items-start
  q-dialog(ref="contentFindDialog" no-route-dismiss :maximized="$q.screen.width < 600" transition-show="slide-up" transition-hide="slide-down")
    content-finder(@ready="contentChoosen" @close="$refs.contentFindDialog.hide()")
  q-dialog(ref="videoEditorDialog" no-route-dismiss :maximized="true" transition-show="slide-up" transition-hide="slide-down")
    video-editor(
      v-if="nodeFull.fragments[fragmentIndex]"
      :fragment="nodeFull.fragments[fragmentIndex]"
      @fragment="fragmentEdited"
      @ready="videoEdited")
  //- image-editor
  //- book-editor
  //- code-editor
  //- wrapper
  div.row.full-width.justify-center
    div(:style=`{maxWidth: '500px'}`).row.full-width
      node(:node="node" :nodeFullReady="nodeFull" :mini="true" noHeader noActions noSpheres noFragmentActions :style=`{maxHeight: '70vh', maxWidth: '500px', ...getRadius, overflow: 'hidden'}`
        ).bg-white.q-py-sm.q-mt-md
        //- name slot
        template(v-slot:name)
          .row.fit.items-center
            q-input(v-model="nodeFull.name" borderless :maxlength="45"
              :input-class="['text-center']" placeholder="В чем суть?").fit
        template(v-slot:fragment="{index}")
          div(:style=`{minHeight: '220px'}`).row.fit.items-center.justify-center
            q-btn(outline round color="primary" icon="add" size="lg" @click="contentFind(index)")
        //- empty slot--
        //- template(v-slot:empty="{ index }")
        //- actions slot
        template(v-slot:actions="{ index }")
          q-btn(flat round color="white" icon="clear" @click="fragmentDelete(index)").q-mr-sm.shadow-10
            q-tooltip {{$t('fragment_delete')}}
          q-btn(flat round color="white" icon="edit" @click="fragmentEdit(index)").q-mr-sm.shadow-10
            q-tooltip {{$t('fragment_edit')}}
      //- sphere finder
      sphere-finder(@spheres="nodeFull.spheres = $event")
      //- create
      div(v-if="true" style=`height: 70px`).row.full-width.items-center.justify-end.bg-white.q-px-sm
        q-btn(@click="nodeCreate()" :loading="nodeCreating"
          rounded style=`height: 50px; width: 200px; borderRadius: 4px` color="primary" no-caps ).full-width {{$t('Создать')}}
      //- debug
      div(v-if="false" style=`minHeight: 70px`).row.full-width.justify-center.bg-green-1
        small {{nodeFull}}
</template>

<script>
import node from 'components/node'
import sphereFinder from 'components/sphere_finder'
import contentFinder from 'components/content_finder'
import imageEditor from 'components/image_editor'
import videoEditor from 'components/video_editor'
import bookEditor from 'components/book_editor'

export default {
  name: 'nodeCreator',
  meta: {
    title: 'Kalpa node creator'
  },
  components: {node, contentFinder, imageEditor, videoEditor, bookEditor, sphereFinder},
  data () {
    return {
      spheres: '',
      fragmentIndex: 0,
      node: {
        type: 'NODE',
        name: '',
        oid: '',
        thumbUrl: []
      },
      nodeFull: {
        name: '',
        spheres: [],
        fragments: [
          null,
          null
          // {
          //   content: {type: 'VIDEO', name: '', url: ''},
          //   relativePoints: [{x: 0}, {x: 10}],
          //   relativeScale: 1000,
          //   url: ''
          // },
          // {
          //   content: {type: 'IMAGE', name: '', url: ''},
          //   relativePoints: [{x: 0, y: 0, z: 0}, {x: 10, y: 0, z: 0}],
          //   relativeScale: 1000,
          //   url: ''
          // }
        ]
      },
      nodeCreating: false,
      nodeSaving: false
    }
  },
  computed: {
    nodeCreateBtnShow () {
      if (this.nodeFull.fragments[0] !== null &&
        this.nodeFull.fragments[1] !== null &&
        this.nodeFull.name.length > 2) {
        return true
      } else {
        return false
      }
    },
    getRadius () {
      return {
        // borderBottomLeftRadius: '100%8px',
        // borderBottomRightRadius: '100%8px',
        borderTopLeftRadius: '100%8px',
        borderTopRightRadius: '100%8px'
      }
    }
  },
  methods: {
    contentFind (index) {
      this.$log('contentFind', index)
      this.fragmentIndex = index
      this.$refs.contentFindDialog.show()
    },
    contentChoosen ({type, source, oid}) {
      this.$log('contentChoosen', type, source, oid)
      this.$refs.contentFindDialog.hide()
      if (type === 'VIDEO') {
        this.$set(
          this.nodeFull.fragments,
          this.fragmentIndex,
          {
            oid: oid,
            url: '',
            relativePoints: [],
            relativeScale: 0,
            content: {
              type: type,
              oid: oid
            }
          })
        this.$refs.videoEditorDialog.show()
      } else if (type === 'IMAGE') {
        this.$refs.imageEditorDialog.show()
      } else if (type === 'BOOK') {
        this.$refs.bookEditorDialog.show()
      } else if (type === 'CODE') {
        this.$refs.codeEditorDialog.show()
      }
    },
    fragmentEdit (index) {
      this.fragmentIndex = index
      let type = this.nodeFull.fragments[this.fragmentIndex].content.type
      this.$log('fragmentEdit', index, type)
      if (type === 'VIDEO') {
        this.$refs.videoEditorDialog.show()
      } else if (type === 'IMAGE') {
        this.$refs.imageEditorDialog.show()
      } else if (type === 'BOOK') {
        this.$refs.bookeEditorDialog.show()
      }
    },
    fragmentEdited (e) {
      this.$log('fragmentEdited', e)
      this.$set(this.nodeFull.fragments, this.fragmentIndex, e)
    },
    fragmentDelete (index) {
      this.$log('fragmentDelete: ', index)
      this.$set(this.node.thumbUrl, index, '')
      this.$set(this.nodeFull.fragments, index, null)
    },
    videoEdited (fragment, preview) {
      this.$log('videoEdited', fragment)
      this.$set(this.node.thumbUrl, this.fragmentIndex, preview)
      this.$set(this.nodeFull.fragments, this.fragmentIndex, fragment)
      this.$refs.videoEditorDialog.hide()
    },
    imageEdited (fragment, preview) {
      this.$log('imageEdited', fragment, preview)
    },
    bookEdited (fragment, preview) {
      this.$log('bookEdited', fragment, preview)
    },
    sphereFind () {
      this.$log('sphereFind')
      this.showSphereFind = true
      this.$refs.typeDialog.show()
    },
    sphereChoosen (s) {
      this.$log('sphereChoosen', s)
      if (!this.nodeFull.spheres.find(sphere => sphere.name === s.name)) {
        this.nodeFull.spheres.push(s)
      } else {
        this.$log('the SAME sphere', s)
      }
    },
    sphereDelete (s, si) {
      this.$log('sphereDelete')
      this.nodeFull.spheres = this.nodeFull.spheres.filter(sphere => sphere.name !== s.name)
    },
    sphereDeleteAll () {
      this.$log('sphereDeleteAll')
      this.$set(this.nodeFull, 'spheres', [])
    },
    async nodeCreate () {
      try {
        this.$log('nodeCreate start', this.nodeFull)
        let n = JSON.parse(JSON.stringify(this.nodeFull))
        delete n.fragments[0].content
        delete n.fragments[0].url
        delete n.fragments[1].content
        delete n.fragments[1].url
        // TODO: add validation of the node
        this.nodeCreating = true
        // mutate
        let {data: {nodeCreate}} = await this.$apollo.mutate({
          mutation: gql`
            mutation nodeCreate ($node: NodeInput!) {
              nodeCreate (node: $node) {
                oid
                type
                name
              }
            }
          `,
          variables: {
            node: n
          }
        })
        this.$log('nodeCreate done', nodeCreate)
        this.$q.notify({message: this.$t('node_published'), color: 'primary', textColor: 'white'})
        this.$set(this, 'nodeFull', {name: '', spheres: [], fragments: [null, null]})
        await this.$wait(700)
        this.$router.push(`/app/node/${nodeCreate.oid}`)
        this.nodeCreating = false
      } catch (error) {
        this.$log('nodeCreate error', error)
        this.nodeCreating = false
        this.$q.notify({message: error.message || JSON.stringify(error), color: 'red', textColor: 'white'})
      }
    },
    async nodeSave () {
      try {
        this.$log('nodeSave start')
        this.nodeSaving = true
        await this.$wait(2000)
        this.$log('nodeSave done')
        this.nodeSaving = false
        this.$q.notify({message: this.$t('node_saved'), color: 'primary', textColor: 'white'})
      } catch (error) {
        this.nodeSaving = false
        this.$q.notify({message: error.message || JSON.stringify(error), color: 'red', textColor: 'white'})
        this.$log('nodeSave error', error)
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
