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
      //- paddingTop: '20px',
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
    //- node.name/node.sphers editors wrapper
    //- div(
      :style=`{
        paddingTop: compositionEditorShow ? '0px' : '20px',
      }`
      ).row.full-width.items-start.content-start.q-px-sm
      //- q-btn(round flat color="grey-8" icon="delete_outline" @click="nodeDelete()")
      //- q-btn(
        @click="extended = !extended"
        round flat dense
        :color="extended ? 'white' : 'green'"
        :icon="extended ? 'clear' : 'link'")
      .col
        //- q-btn(
          v-if="!extended"
          @click="extended = true"
          flat color="green" icon="add" no-caps
          :style=`{height: '40px'}`).full-width.b-50
          small(:style=`{fontSize: '18px',}`) Добавить элемент
        div(
          :style=`{
            borderRadius: '10px',
          }`
          ).row.full-width.b-50
          img(
            v-if="extended"
            @click="extended = false"
            :src="contentKalpa.thumbUrl"
            :style=`{borderRadius: '10px',}`).full-width
          div(
            v-if="extended"
            ).row.full-width.items-center.content-center.justify-center.q-pa-sm
            small.text-white Суть соедененного ядра
      q-btn(
          @click="compositionEditorShow = !compositionEditorShow"
          round flat dense color="white"
          :icon="compositionEditorShow ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
          )
    div(
      :style=`{
        paddingTop: compositionEditorShow ? '0px' : '20px',
      }`
      ).row.full-width.items-start.content-start.justify-center
      div(
        :style=`{
          maxWidth: '620px',
        }`).row.full-width.items-start.content-start
        //- node.name editor
        //- div(:style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden', zIndex: 100,}`).row.full-width
          q-input(
            v-model="node.name"
            filled dark dense color="grey-6"
            autogrow type="textarea"
            placeholder="В чем суть?"
            :input-style=`{
              minHeight: '60px',
            }`).full-width
        //- name editor 2
        //- q-btn(round flat dense color="white" icon="bookmark_outline").q-mt-sm
        //- .col
        edit-name(:node="node")
        //- q-btn(
            @click="compositionEditorShow = !compositionEditorShow"
            round flat dense color="white"
            :icon="compositionEditorShow ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
            ).q-mt-sm
        //- ws-sphere-editor(:item="node").q-py-sm
        div(:style=`{position: 'relative'}`).row.full-width.items-start.content-start.justify-between.q-py-sm.q-mb-md
          q-btn(
            @click="nodeJoin()"
            round flat dense
            :color="linked ? 'grey-4' : 'green'"
            :icon="linked ? 'link_off' : 'link'")
          .col
            q-btn(
              no-caps flat icon="add" color="white"
              :style=`{}`).full-width.b-50 Добавить сферу
          q-btn(
            @click="compositionEditorShow = !compositionEditorShow"
            round flat dense color="white"
            :icon="compositionEditorShow ? 'keyboard_arrow_up' : 'keyboard_arrow_down'")
  //- .row.full-width.q-pa-sm
    q-btn(flat color="green" icon="add"
      :style=`{height: '200px'}`).full-width.b-40
  //- link
  //- div(
    v-if="linked && $q.screen.lt.lg").row.full-width.items-start.content-start.q-px-sm
    .row.full-width.items-center.content-center.justify-center
      //- q-btn(round flat dense color="grey-4" icon="link_off" @click="linked = false")
      q-btn(flat dense color="white" no-caps icon-right="keyboard_arrow_down")
        span.text-grey-4 Следствие
      //- q-btn(round flat dense color="green" icon="link")
    div(
      :style=`{
        borderRadius: '10px',
      }`
      ).row.full-width.b-40
      img(
        v-if="true"
        @click="extended = false"
        :src="contentKalpa.thumbUrl"
        :style=`{borderRadius: '10px',}`).full-width
      div(
        v-if="true"
        ).row.full-width.items-center.content-center.justify-center.q-pa-sm
        small.text-white Суть соедененного ядра
  //- footer: actions close, createNode
  .row.full-width.justify-center.q-px-sm
    div(:style=`{maxWidth: '620px',}`).row.full-width.q-py-sm
      //- q-btn(round flat color="grey-8" icon="delete_outline" @click="nodeDelete()")
      //- .col
      q-btn(flat color="grey-4" no-caps @click="$emit('close')").b-40.q-mr-sm Закрыть
      .col
      //- q-btn(v-if="!linked" round flat color="green" icon="link" @click="linked = true").q-mr-xs
      q-btn(
        v-if="!pick"
        @click="publish()"
        color="green" no-caps
        :loading="publishing") Опубликовать
      q-btn(
        v-if="pick"
        @click="pick(node)"
        color="red" dense no-caps
        :style=`{
        }`).q-px-sm
        span.text-bold Выбрать ядро
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import compositionEditor from 'components/composition/composition_editor/index.vue'

export default {
  name: 'contentExplorerVideo_viewNode',
  components: {
    compositionEditor,
    editName: () => import('components/node_editor/view_publish/edit_name.vue')
  },
  inject: ['pick'],
  props: ['node', 'player', 'contentKalpa', 'contentBookmark'],
  data () {
    return {
      compositionEditorShow: true,
      extended: false,
      linked: false,
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
        await this.$wait(1000)
        this.$log('publish done')
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
