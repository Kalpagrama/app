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
    //- edit appendix
    div(
      :style=`{
        paddingTop: compositionEditorShow ? '0px' : '20px',
      }`
      ).row.full-width.items-start.content-start.justify-center
      div(
        :style=`{
          maxWidth: '620px',
        }`).row.full-width.items-start.content-start
        .row.full-width.items-start.content-start.q-px-xs
          q-btn(
            @click="joining = !joining"
            round flat dense
            :color="joining ? 'grey-4' : 'green'"
            :icon="joining ? 'link_off' : 'link'"
            :style=`{marginTop: '14px'}`)
          div(v-show="!joining" :style=`{marginBottom: '40px'}`).col
            edit-name(:node="node")
            ws-sphere-editor(:item="node")
            .row.full-width
              edit-category(:node="node")
          div(v-show="joining").col
            div(
              :style=`{
                borderRadius: '10px',
                marginBottom: '42px',
              }`
              ).row.full-width.items-start.content-start.q-mt-sm.b-50
              q-btn(
                flat color="green" icon="add" size="lg"
                :style=`{height: '100px'}`).full-width.b-60
              .row.full-width
                q-resize-observer(@resize="width = $event.width")
                q-btn(
                  flat color="white" icon-right="keyboard_arrow_down" no-caps
                  ).full-width {{ jointType }}
                  q-popup-proxy(
                    fit dark
                    position="bottom")
                    div(
                      :style=`{
                        maxWidth: $q.screen.width < 800 ? $q.screen.width+'px' : width+'px',
                        borderRadius: '10px',overflow: 'hidden',}`
                      ).row.full-width.items-start.content-start.b-40
                      //- header
                      div(
                        v-if="$q.screen.width < 800"
                        :style=`{
                          height: '60px',
                        }`
                        ).row.full-width.items-center
                        span(:style=`{fontSize: '18px'}`).text-white.text-bold.q-ml-md Выберите тип связи
                        .col
                        q-btn(round flat color="white" icon="clear" v-close-popup).q-mr-sm
                      q-btn(
                        v-for="t in jointTypes" :key="t.id" v-close-popup
                        @click="joint.type = t.id"
                        flat color="grey-5" no-caps
                        ).full-width {{ t.name }}
          q-btn(
            @click="compositionEditorShow = !compositionEditorShow"
            round flat dense color="white"
            :icon="compositionEditorShow ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
            :style=`{marginTop: '14px'}`)
  //- footer: close, publish
  .row.full-width.justify-center
    div(:style=`{maxWidth: '620px',paddingLeft: '40px', paddingRight: '40px',}`).row.full-width.q-py-sm
      q-btn(flat color="grey-4" no-caps @click="$emit('close')").b-40.q-mr-sm Закрыть
      q-btn(
        v-if="!pick"
        @click="publish()"
        color="green" no-caps
        :loading="publishing").col Опубликовать
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
      joining: false,
      width: 0,
      joint: {
        type: 'ASSOCIATIVE',
        name: ''
      }
    }
  },
  computed: {
    item () {
      return this.node.items[0]
    },
    jointType () {
      if (this.joint) {
        return this.jointTypes.find(t => t.id === this.joint.type).name
      }
      else {
        return 'Nothing'
      }
    },
    jointTypes () {
      return [
        // {id: 'ESSENCE', name: 'По сути', pair: 'ESSENCE', origin: 'ESSENCE'},
        {id: 'ASSOCIATIVE', name: 'Ассоциация', pair: 'ASSOCIATIVE', origin: 'ASSOCIATIVE'},
        {id: 'CAUSE', name: 'Причина', pair: 'EFFECT', origin: 'CAUSE_EFFECT'},
        {id: 'EFFECT', name: 'Следствие', pair: 'CAUSE', origin: 'CAUSE_EFFECT'},
        {id: 'PROBLEM', name: 'Проблема', pair: 'SOLUTION', origin: 'PROBLEM_SOLUTION'},
        {id: 'SOLUTION', name: 'Решение', pair: 'PROBLEM', origin: 'PROBLEM_SOLUTION'},
        {id: 'TRUE', name: 'Опровержение', pair: 'FALSE', origin: 'FALSE_TRUE'},
        {id: 'FALSE', name: 'Фэйк', pair: 'TRUE', origin: 'FALSE_TRUE'},
        {id: 'FROM', name: 'До', pair: 'TO', origin: 'FROM_TO'},
        {id: 'TO', name: 'После', pair: 'FROM', origin: 'FROM_TO'},
      ]
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
        this.$router.push(`/node/${createdNode.oid}`).catch(e => e)
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
