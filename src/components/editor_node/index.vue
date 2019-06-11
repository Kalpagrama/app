<template lang="pug">
div(style=`position: relative`).column.fit
  //- =======
  //- dialogs
  q-dialog(ref="showDialogTypeFind" position="bottom" transition-show="slide-up" transition-hide="slide-down")
    type-find(v-if="showTypeFind" @type="typeChoosen" @close="$refs.showDialogTypeFind.hide(), showTypeFind = false")
  //- dialogs
  q-dialog(ref="showDialog" :maximized="true" transition-show="slide-up" transition-hide="slide-down")
    //- image
    image-find(v-if="showImageFind" @close="$refs.showDialog.hide(), showImageFind = false")
    image-edit(v-if="showImageEdit" @close="$refs.showDialog.hide(), showImageEdit = false")
    //- video
    video-find(v-if="showVideoFind" @video="videoChoosen" @close="$refs.showDialog.hide(), showVideoFind = false")
    video-edit(v-if="showVideoEdit"
      @close="$refs.showDialog.hide(), showVideoEdit = false"
      :url="nodeFull.fragments[typeIndex]['content']['url']"
      :start="nodeFull.fragments[typeIndex].relativePoints[0]['x']"
      @start="nodeFull.fragments[typeIndex].relativePoints[0]['x'] = $event"
      :end="nodeFull.fragments[typeIndex].relativePoints[1]['x']"
      @end="nodeFull.fragments[typeIndex].relativePoints[1]['x'] = $event"
      @done="videoEdited")
    //- sphere
    sphere-find(v-if="showShpereFind" @sphereAdd="sphereAdd" @close="$refs.showDialog.hide(), showShpereFind = false")
  //- ====
  //- node
  .row.bg-grey-3.q-pa-md
    node(:node="node" :nodeFull="nodeFull" :types="types")
      //- name
      template(v-slot:name)
        .row.fit.items-center
          q-input(v-model="nodeFull.name" borderless :maxlength="45"
            :input-class="['text-center']" placeholder="В чем суть?").fit
      //- editor slot
      template(v-slot:editor="{ index }")
        div(v-if="types[index] === 'none'").row.fit.items-center.justify-center
          q-btn(outline round color="primary" icon="add" size="lg" @click="typeFind(index)")
        div(v-if="types[index] === 'VIDEO'" style=`position: absolute; zIndex: 100; height: 50px`
          ).row.full-width.items-center.justify-start.q-px-sm
          q-btn(flat round dense color="white" icon="clear" @click="fragmentDelete(index)").q-mr-sm.shadow-10
          q-btn(flat round dense color="white" icon="edit" @click="fragmentEdit(index)").shadow-10
  //- =======
  //- spheres
  div(style=`borderTop: 1px solid #eee; borderBottom: 1px solid #eee; height: 50px`).row.full-width.items-center
    .col.full-height
      div(v-if="nodeFull.spheres.length === 0" @click="sphereFind").row.fit.items-center.hr.cursor-pointer
        span.text-grey-8.q-ml-md Добавь тэги
      div(v-else).row.fit.q-px-sm
        div(style=`maxWidth: 100%`).row.fit.items-center.bg-white.no-wrap.scroll
          div(v-for="(t, ti) in nodeFull.spheres" :key="ti" style=`height: 30px; borderRadius: 5px`).q-pa-xs.q-mr-sm.bg-grey-2
            span #
            span {{ t.name }}
            //- div(style=`height: 30px; width: 30px`)
            q-btn(icon="clear" @click="sphereDelete(t, ti)" dense flat round size="xs" color="black")
    q-btn(v-if="nodeFull.spheres.length < 4" outline round dense icon="add" color="primary" size="md" @click="sphereFind()").q-mx-md
  .col.scroll
  //- ============
  //- form publish
  div(style=`minHeight: 100px; borderTop: 1px solid #eee`).row.full-width.items-center.justify-between.q-px-md
    .col
      .row.fit.items-center.q-pr-md
        q-btn(rounded outline style=`height: 50px;` color="primary" no-caps @click="nodeSave()" :loading="nodeSaving").full-width Сохранить
    q-btn(rounded style=`height: 50px; width: 250px` color="primary" no-caps @click="nodeCreate()" :loading="nodeCreating") Опубликовать
</template>

<script>
import node from 'components/node'
import sphereFind from 'components/sphere_find'
import typeFind from 'components/type_find'
import imageFind from 'components/image_find'
import imageEdit from 'components/image_edit'
import videoFind from 'components/video_find'
import videoEdit from 'components/video_edit'

export default {
  name: 'editorNode',
  components: {node, typeFind, videoEdit, videoFind, imageFind, imageEdit, sphereFind},
  data () {
    return {
      typeIndex: 0,
      types: ['none', 'none'],
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
          {
            content: {url: ''},
            relativePoints: [{x: 0}, {x: 10}]
          },
          {
            content: {url: ''},
            relativePoints: [{x: 0}, {x: 10}]
          }
        ]
      },
      showDialog: false,
      // type
      showTypeFind: false,
      // sphere
      showShpereFind: false,
      // video
      showVideoFind: false,
      showVideoEdit: false,
      // image
      showImageEdit: false,
      showImageFind: false,
      // quote
      showQuoteEdit: false,
      // book
      showBookFind: false,
      showBookEdit: false,
      // node
      nodeCreating: false,
      nodeSaving: false
    }
  },
  methods: {
    typeFind (index) {
      this.$log('typeFind', index)
      this.typeIndex = index
      this.showTypeFind = true
      this.$refs.showDialogTypeFind.show()
    },
    async typeChoosen (t) {
      await this.$wait(400)
      this.$log('typeChoosen', t)
      this.$set(this.types, this.typeIndex, t.id)
      switch (t.id) {
        case 'VIDEO': {
          this.showVideoFind = true
          this.$refs.showDialog.show()
          break
        }
        case 'IMAGE': {
          this.showImageFind = true
          this.$refs.showDialog.show()
          break
        }
      }
    },
    fragmentEdit (index) {
      this.$log('fragmentEdit', index)
      this.showVideoEdit = true
      this.$refs.showDialog.show()
    },
    fragmentDelete (index) {
      this.$log('fragmentDelete', index)
      this.$set(this.types, index, 'none')
      this.$set(this.node.thumbUrl, index, '')
      this.$set(this.nodeFull.fragments[index]['content'], 'url', '')
      this.$set(this.nodeFull.fragments[index], 'relativePoints', [{x: 0}, {x: 3}])
    },
    async videoChoosen (v) {
      await this.$wait(400)
      this.$log('videoChoosen', v)
      this.$set(this.node.thumbUrl, this.typeIndex, v.thumbnailUrl)
      this.$set(this.nodeFull.fragments[this.typeIndex]['content'], 'url', v.url)
      // this.node.thumbUrl[this.typeIndex] = v.thumbnailUrl
      // this.nodeFull.fragments[this.typeIndex]['content']['url'] = v.url
      this.$log('videoChoosen', this.nodeFull)
      this.showVideoEdit = true
      this.$refs.showDialog.show()
    },
    videoEdited (points) {
      this.$log('videoEdited', points)
      this.$set(this.nodeFull.fragments[this.typeIndex], 'relativePoints', points)
      // this.nodeFull.fragments[this.typeIndex].relativePoints = points
    },
    async imageChoosen (i) {
      await this.$wait(400)
      this.$log('imageChoosen', i)
      // set url to appropriate fragment content url
    },
    // sphere
    sphereFind () {
      this.$log('sphereFind')
      this.showShpereFind = true
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
    // node
    async nodeCreate () {
      try {
        this.$log('nodeCreate start')
        // TODO: add validation of the node???
        this.nodeCreating = true
        // await this.$wait(2000)
        // get contents ids
        let { data: { uploadContentUrl: { oid: oid1 } } } = await this.$apollo.mutate({
          mutation: gql`
            mutation uploadContentUrl ($url: String!) {
              uploadContentUrl(url: $url) {
                oid
              }
            }
          `,
          variables: {
            url: this.nodeFull.fragments[0].content.url
          }
        })
        let { data: { uploadContentUrl: { oid: oid2 } } } = await this.$apollo.mutate({
          mutation: gql`
            mutation uploadContentUrl ($url: String!) {
              uploadContentUrl(url: $url) {
                oid
              }
            }
          `,
          variables: {
            url: this.nodeFull.fragments[1].content.url
          }
        })
        this.$log('oid1', oid1)
        this.$log('oid2', oid2)
        // mutate
        let res = await this.$apollo.mutate({
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
            node: {
              name: this.nodeFull.name,
              fragments: [
                {oid: oid1, relativePoints: this.nodeFull.fragments[0].relativePoints, relativeScale: 1000},
                {oid: oid2, relativePoints: this.nodeFull.fragments[1].relativePoints, relativeScale: 1000}
              ],
              spheres: this.nodeFull.spheres
            }
          }
        })
        // done!
        this.$log('nodeCreate', res)
        this.$log('nodeCreate done')
        this.$q.notify({message: `Ядро создано!`, color: 'primary', textColor: 'white'})
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
        this.$q.notify({message: `Ядро сохранено!`, color: 'primary', textColor: 'white'})
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
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
