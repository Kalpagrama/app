<template lang="pug">
div(
  :style=`{
    marginTop: '-20px',
  }`
  ).row.full-width.justify-center
  //- editor wrapper
  div(
    :style=`{
      borderRadius: '10px',
      }`
    ).row.full-width.items-start.content-start.b-40
    //- composition.editor
    div(
      v-show="compositionEditorShow"
      :style=`{
        paddingTop: '20px',
        paddingBottom: '10px',
        background: 'rgb(37,37,37)',
        borderRadius: '10px',
      }`
      ).row.full-width
      composition-editor(
        :player="player" :composition="item"
        :contentKalpa="contentKalpa")
    //- edit name
    div(
      :style=`{
        paddingTop: compositionEditorShow ? '0px' : '20px',
      }`
      ).row.full-width.items-start.content-start.justify-center
      div(
        :style=`{
          maxWidth: '620px',
        }`).row.full-width.items-start.content-start
        edit-name(:node="node")
        //- join, spheres, compositionEditor show
        div(:style=`{position: 'relative'}`).row.full-width.items-start.content-start.justify-between.q-py-sm
          q-btn(
            @click="nodeJoin()"
            round flat dense
            :color="linked ? 'grey-4' : 'green'"
            :icon="linked ? 'link_off' : 'link'")
          .col
            //- q-btn(
              v-if="node.spheres.length === 0"
              @click="sphereAddStart()"
              no-caps flat icon="add" color="white"
              :style=`{}`).full-width.b-50 Добавить сферу
            ws-sphere-editor(
              :item="node")
          q-btn(
            @click="compositionEditorShow = !compositionEditorShow"
            round flat dense color="white"
            :icon="compositionEditorShow ? 'keyboard_arrow_up' : 'keyboard_arrow_down'")
        //- category
        div(:style=`{paddingLeft: '40px', paddingRight: '40px', paddingBottom: '40px',}`).row.full-width
          edit-category(:node="node")
  //- footer: actions close, createNode
  .row.full-width.justify-center
    div(:style=`{maxWidth: '620px',paddingLeft: '40px', paddingRight: '40px',}`).row.full-width.q-py-sm
      q-btn(flat color="grey-4" no-caps @click="$emit('close')").b-40.q-mr-sm Закрыть
      //- .col
      q-btn(
        v-if="!pick"
        @click="publish()"
        color="green" no-caps
        :loading="publishing").col Опубликовать
      //- q-btn(
        v-if="pick"
        @click="pick(node)"
        color="red" dense no-caps
        :style=`{
        }`).q-px-sm
        span.text-bold Выбрать ядро
</template>

<script>
import { ObjectCreateApi } from 'src/api/object_create'
import { RxCollectionEnum } from 'src/system/rxdb'
import compositionEditor from 'components/composition/composition_editor/index.vue'

export default {
  name: 'contentExplorerVideo_viewNode',
  components: {
    compositionEditor,
    editName: () => import('components/node_editor/view_publish/edit_name.vue'),
    editCategory: () => import('components/node_editor/view_publish/edit_category.vue')
  },
  inject: ['pick'],
  props: ['node', 'player', 'contentKalpa', 'contentBookmark'],
  data () {
    return {
      compositionEditorShow: true,
      sphereDialogShow: false,
      publishing: false,
    }
  },
  computed: {
    item () {
      return this.node.items[0]
    }
  },
  watch: {
    node: {
      deep: true,
      immediate: true,
      handler (to, from) {
        // this.$log('node TO', to)
        if (to) {
          // TODO: optimize for items[0].layers[0].figuresAbsolute[0].t compare to from value
          this.figuresUpdate(to)
        }
      }
    }
  },
  methods: {
    sphereAddStart () {
      this.$log('sphereAddStart')
      this.player.pause()
      // TODO: check spheres
      this.sphereDialogShow = true
    },
    nodeJoin () {
      this.$log('nodeJoin')
      this.$store.commit('ui/stateSet', ['jointEditorItem', JSON.parse(JSON.stringify(this.node))])
      this.$router.push('/workspace/joint/new')
    },
    nodeDelete () {
      this.$log('nodeDelete')
    },
    async publish () {
      try {
        this.$log('publish start')
        this.publishing = true
        // await this.$wait(1000)
        let nodeInput = JSON.parse(JSON.stringify(this.node))
        // get spheres from workspace
        let spheres = []
        await Promise.all(
          nodeInput.spheres.map(async (sphereId) => {
            let sphere = await this.$rxdb.get(RxCollectionEnum.WS_SPHERE, sphereId)
            if (sphere) spheres.push({name: sphere.name})
          })
        )
        nodeInput.spheres = spheres
        // create node
        let createdNode = await ObjectCreateApi.nodeCreate(nodeInput)
        this.$log('publish createdNode', createdNode)
        this.publishing = false
        this.$router.push(`/node/${createdNode.oid}?creating=true`).catch(e => e)
        this.$log('publish done')
        this.publishing = false
      }
      catch (e) {
        this.$log('publish error', e)
        this.publishing = false
      }
    },
    figuresUpdate (node) {
      // this.$log('figuresUpdate')
      let figures = []
      node.items.map(i => {
        if (i.layers[0].contentOid === this.contentKalpa.oid) {
          figures.push(i.layers[0].figuresAbsolute)
        }
      })
      this.$emit('figures', figures)
    }
  },
  async mounted () {
    this.$log('mounted')
    window.scrollTo(0, 0)
  }
}
</script>
