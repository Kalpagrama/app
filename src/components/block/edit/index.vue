<style lang="sass">
.sphere-item
  &:hover
    background: rgb(50, 50, 50)
</style>

<template lang="pug">
  div(
    :style=`{
    position: 'relative',
    // height: $q.screen.height + 'px',
    ...styles,
  }`
  ).row.full-width.items-start.content-start
    div(
      :style=`{
      position: 'relative',
      background: 'rgb(40,40,40)',
      borderRadius: '10px',
      ...styles,
    }`).row.full-width.items-start.content-start
      slot(name="wrapper-inside")
      //graph
      graph-view(:maxHeight="graphHeight" :graphD3="block.graph" detailPosition="standard" :style=`{borderColor: 'rgb(40,40,40)', borderStyle: 'solid', background: 'rgb(35,35,35)'}`)
      //div().row.full-width.full-height.br
        //q-btn(
        //  label="graph"
        //  :style=`{height: graphHeight + 'px',}`
        //).row.full-width.full-heigh
      //- name
      div(ref="nameRef" :style=`{height: '60px'}`).row.full-width
        q-input(
          v-model="block.name"
          borderless dark
          ref="nameInput"
          type="textarea" autogrow
          :placeholder="$t('what is this block about')"
          :autofocus="false"
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
      // category and spheres
      div(ref="spheresRef").row.full-width.full-height.q-pt-sm
        edit-spheres(
          :sphereOwner="block")
          template(v-slot:left)
            edit-category(
              :node="block"
              :class=`{
                br: !block.category && categoryError,
              }`
              :style=`{
                borderRadius: '10px',
              }`)
          template(v-slot:right)
            .div(v-if="false").row
              //- Delete from notes
              q-btn(
                outline no-caps color="red"
                :style=`{}`
                @click="cancel"
              ).q-mr-sm
                span {{$t('Cancel')}}
              //- Save to notes
              q-btn(
                outline no-caps color="white"
                :style=`{}`
              ).q-mr-sm
                span {{$t('Save as draft')}}
      div(ref="okCancelRef").row.full-width.justify-end
        q-btn(
          @click="saveDraft"
          flat color="grey-5" no-caps) {{$t('Save draft')}}
        q-btn(
          @click="publish"
          flat  no-caps
          :color="canPublish ? 'green' : 'red'"
          :disable="!canPublish"
          :loading="nodePublishing") {{$t('Publish')}}
</template>

<script>

import editSpheres from 'src/pages/app/content/node_editor/edit_spheres.vue'
import editCategory from 'src/pages/app/content/node_editor/edit_category.vue'
import { ObjectCreateApi } from 'src/api/object_create'

export default {
  name: 'blockEdit',
  components: {
    editSpheres,
    editCategory
  },
  props: {
    block: { type: Object, required: true },
    styles: { type: Object },
    height: { type: Number, required: true }
  },
  data () {
    return {
      graphHeight: this.height
    }
  },
  watch: {
    'block.graph': {
      handler (to, from) {
        if (to.nodes.length) this.block.thumbUrl = to.nodes[0].thumbUrl
      }
    }
  },
  computed: {
    canPublish () {
      if (!this.block.name) return false
      if (!this.block.graph.nodes.length) return false
      return true
    },
    fontSize () {
      let l = this.block.name.length
      if (l < 20) return 22
      else if (l < 30) return 20
      else if (l < 40) return 16
      else return 14
    }
  },
  methods: {
    saveDraft () {
      this.block.temporary = false
    },
    async publish () {
      this.$log('try create block', this.block)
      let createdBlock = await ObjectCreateApi.blockCreate(this.block)
      this.$log('block Created!', createdBlock)
      await this.block.remove(true)
      this.$router.push('/block/' + createdBlock.oid)
      // let createdBlock = await ObjectCreateApi.blockCreate({
      //   name: 'test',
      //   description: 'test block5',
      //   category: 'FUN',
      //   coverImage: {oid: '165507718097059859', name: 'asdasd'},
      //   graph: {nodes: [], joints: []}
      // })
      // let createdBlock = await ObjectApi.blockUpdate({
      //   oid: '  213988039058397187',
      //   rev: 1,
      //   name: 'test222',
      //   description: 'test block4',
      //   spheres: [],
      //   category: 'FUN',
      //   coverImage: {oid: '165507718097059859', name: 'asdasd'},
      //   graph: {nodes: [], joints: []}
      // })
      // this.$log('createdBlock', createdBlock)
      // return
    }
  },
  mounted () {
    // this.$log('mounted', this.node.name)
    this.graphHeight = this.height - this.$refs.spheresRef.clientHeight - this.$refs.nameRef.clientHeight - this.$refs.okCancelRef.clientHeight - 70
  },
  beforeDestroy (to, from, next) {
    if (this.block.name) this.block.temporary = false
  }
}
</script>
