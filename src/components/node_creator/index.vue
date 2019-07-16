<template lang="pug">
div(style=`position: relative`).row.fit.content-start.items-start
  //- content, spheres find
  q-dialog(ref="typeDialog" no-route-dismiss :maximized="$q.screen.width < 600" transition-show="slide-up" transition-hide="slide-down" @hide="showSphereFind = false, showContentFind = false, $router.push({query: {step: 'start'}})")
    content-find(v-if="showContentFind" @close="$refs.typeDialog.hide(), showContentFind = false" @ready="contentChoosen")
    sphere-find(v-if="showSphereFind" @close="$refs.typeDialog.hide(), showSphereFind = false" @ready="sphereChoosen")
  //- editors
  q-dialog(ref="defaultDialog" no-route-dismiss :maximized="true" transition-show="slide-up" transition-hide="slide-down")
    //- image-editor
    video-editor(
      v-if="showVideoEditor"
      @close="$refs.defaultDialog.hide(), showVideoEditor = false"
      :fragment="nodeFull.fragments[typeIndex]"
      @fragment="fragmentEdited"
      @ready="videoEdited")
    //- book-editor
  //- header
  div(:style=`{height: '60px'}`
    ).row.full-width.items-center.q-px-md
    div(:style=`{borderRadius: $store.state.ui.radiusDefault+'px'}`
      ).row.fit.items-center.bg-white.q-px-md
      span {{$t('node_creator')}}
  //- wrapper
  div.row.full-width.justify-center.q-py-md
    div(:style=`{maxWidth: $store.state.ui.nodeMaxWidth+'px'}`).row.full-width
      node(:node="node" :nodeFull="nodeFull" :visible="true")
        //- name slot
        template(v-slot:name)
          .row.fit.items-center
            q-input(v-model="nodeFull.name" borderless :maxlength="45"
              :input-class="['text-center']" placeholder="В чем суть?").fit
        //- empty slot
        template(v-slot:empty="{ index }")
          .row.fit.items-center.justify-center
            q-btn(outline round color="primary" icon="add" size="lg" @click="contentFind(index)")
        //- actions slot
        template(v-slot:actions="{ index }")
          q-btn(flat round dense color="white" icon="clear" @click="fragmentDelete(index)").q-mr-sm.shadow-10
            q-tooltip {{$t('fragment_delete')}}
          q-btn(flat round dense color="white" icon="edit" @click="fragmentEdit(index)").q-mr-sm.shadow-10
            q-tooltip {{$t('fragment_edit')}}
      //- spheres
      div(style=`height: 50px`).row.full-width.justify-center
        div(style=`height: 40px; maxWidth: 100%; overflowY: hidden; overflowX: auto`).row.full-width.items-center.no-wrap.scroll
          div(v-for="(s, si) in nodeFull.spheres" :key="si"
            style=`display: inline-block; height: 30px; borderRadius: 5px; white-space: nowrap`
            ).row.items-center.q-pa-xs.q-mr-sm.bg-grey-3
            span(style=`white-space: nowrap`) {{ `#${s.name}` }}
            q-btn(flat round icon="clear" @click="sphereDelete(s, si)" dense size="xs").q-ml-xs
      //- spheres tools
      div(style=`height: 60px`).row.full-width.justify-end.items-center.bg-white.q-px-sm
        q-btn(v-if="nodeFull.spheres.length > 0" @click="sphereDeleteAll()"
          style=`borderRadius: 4px; height: 40px` no-caps outline rounded color="primary"
          ).q-mr-sm {{$t('spheres_delete_all')}}
        .col
          q-btn(@click="sphereFind()"
            style=`borderRadius: 4px; height: 40px` no-caps outline rounded color="primary").full-width {{$t('add_spheres')}}
      //- publish or saves
      div(v-if="nodeCreateShow" style=`height: 70px`).row.full-width.items-center.justify-end.bg-white.q-px-sm
        //- save
        q-btn(v-if="false" @click="nodeSave()" :loading="nodeSaving"
          rounded outline style=`height: 40px; borderRadius: 4px` color="primary" no-caps ).q-mr-sm {{$t('node_save')}}
        //- publish
        .col
          q-btn(@click="nodeCreate()" :loading="nodeCreating"
            rounded style=`height: 50px; width: 200px; borderRadius: 4px` color="primary" no-caps ).full-width {{$t('node_publish')}}
      //- debug
      div(v-if="false").row.full-width.justify-center
        small {{nodeFull}}
</template>

<script>
import node from 'components/node'
import sphereFind from 'components/sphere_find'
import contentFind from 'components/content_find'
import imageEditor from 'components/image_editor'
import videoEditor from 'components/video_editor'
import bookEditor from 'components/book_editor'

export default {
  name: 'nodeCreator',
  components: {node, contentFind, imageEditor, videoEditor, bookEditor, sphereFind},
  data () {
    return {
      typeIndex: 0,
      node: {
        type: 'NODE',
        name: '',
        oid: '',
        thumbUrl: [],
        visible: true
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
      showContentFind: false,
      showSphereFind: false,
      showVideoEditor: false,
      showImageEditor: false,
      showBookEditor: false,
      nodeCreating: false,
      nodeSaving: false
    }
  },
  watch: {
    '$route': {
      deep: true,
      immediate: false,
      handler (to, from) {
        this.$log('$route CHANGED', to)
        if (to.query.step) {
          switch (to.query.step) {
            case 'content-find': {
              this.$log('content-find GO', this.$refs.typeDialog)
              this.showContentFind = true
              this.$refs.typeDialog.show()
              break
            }
          }
          this.$log('to.query', to.query)
        }
      }
    }
  },
  computed: {
    nodeCreateShow () {
      if (this.nodeFull.fragments[0] !== null &&
        this.nodeFull.fragments[1] !== null &&
        this.nodeFull.name.length > 2) {
        return true
      } else {
        return false
      }
    }
  },
  methods: {
    contentFind (index) {
      this.$log('contentFind', index)
      this.$router.push({query: {step: 'content-find'}})
      this.typeIndex = index
      // this.showContentFind = true
      // this.$refs.typeDialog.show()
    },
    contentChoosen ({type, source, oid}) {
      this.$log('contentChoosen', type, source, oid)
      if (type === 'VIDEO') {
        this.$set(
          this.nodeFull.fragments,
          this.typeIndex,
          {
            url: '',
            relativePoints: [],
            relativeScale: 0,
            content: {
              type: type,
              oid: oid
            }
          })
        // set oid for creation
        this.$set(
          this.nodeFull.fragments[this.typeIndex],
          'oid',
          oid
        )
        // open video editor
        this.showVideoEditor = true
        this.$refs.defaultDialog.show()
      } else if (type === 'IMAGE') {
        // open image editor
        this.showImageEditor = true
        this.$refs.defaultDialog.show()
      } else if (type === 'BOOK') {
        // open book editor
        this.showBookEditor = true
        this.$refs.defaultDialog.show()
      }
    },
    fragmentEdit (index) {
      this.typeIndex = index
      let type = this.nodeFull.fragments[this.typeIndex].content.type
      this.$log('fragmentEdit', index, type)
      if (type === 'VIDEO') {
        this.showVideoEditor = true
        this.$refs.defaultDialog.show()
      } else if (type === 'IMAGE') {
        // TODO:
        this.showImageEditor = true
        this.$refs.defaultDialog.show()
      } else if (type === 'BOOK') {
        // TODO:
        this.showBookEditor = true
        this.$refs.defaultDialog.show()
      }
    },
    fragmentEdited (e) {
      this.$log('fragmentEdited', e)
      this.$set(this.nodeFull.fragments, this.typeIndex, e)
    },
    fragmentDelete (index) {
      this.$log('fragmentDelete: ', index)
      // this.$set(this.types, index, 'none')
      this.$set(this.node.thumbUrl, index, '')
      this.$set(this.nodeFull.fragments, index, null)
    },
    videoEdited (fragment, preview) {
      this.$log('videoEdited', fragment)
      this.$set(this.node.thumbUrl, this.typeIndex, preview)
      this.$set(this.nodeFull.fragments, this.typeIndex, fragment)
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
        this.$router.push({name: 'home'})
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
    this.$log('mounted nodeFull', this.nodeFull)
    // TODO: load saved nodeFull from localStorage
    // who is responsible for nodeFull structure?
    let from = this.$route.query.from
    let data = this.$route.query.data
    if (from && data) {
      if (from === 'node') {
        this.$log('from NODE')
        this.$q.notify('from NODE')
        this.$set(this, 'nodeFull', JSON.parse(data))
      } else if (from === 'fragment') {
        this.$log('from FRAGMENT')
        this.$q.notify('from FRAGMENT')
        this.$set(this, 'nodeFull', JSON.parse(data))
      } else if (from === 'empty') {
        this.$log('from EMPTY')
        // this.$q.notify('from EMPTY')
      }
    } else {
      this.$log('from EMPTY')
      // this.$q.notify('from EMPTY')
    }
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
