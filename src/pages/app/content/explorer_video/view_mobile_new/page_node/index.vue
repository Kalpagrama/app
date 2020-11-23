<template lang="pug">
q-page(
  :style=`{
    paddingTop: '0px',
    paddingBottom: '0px',
  }`
  ).row.full-width.items-start.content-start.justify-center
  //- editor wrapper
  div(
    :style=`{
      marginTop: '-20px',
      borderRadius: '0 0 10px 10px',
      background: 'rgb(35,35,35)',
    }`
    ).row.full-width
    //- composition.editor
    div(
      v-show="compositionEditorShow"
      :style=`{
        paddingTop: '20px',
        //- paddingBottom: '10px',
        //- background: 'rgb(30,30,30)',
        borderRadius: '10px',
      }`
      ).row.full-width.bg-black
      composition-editor(
        :player="player" :composition="item"
        :contentKalpa="contentKalpa")
    div(
      :style=`{
        paddingTop: compositionEditorShow ? '0px' : '20px',
      }`
      ).row.full-width.items-start.content-start.justify-center
      div(
        :style=`{
          maxWidth: '620px',
        }`).row.full-width.items-start.content-start
        .row.full-width.items-start.content-start
          q-btn(
            @click="joining = !joining"
            round flat
            :color="joining ? 'grey-4' : 'green'"
            :icon="joining ? 'link_off' : 'link'"
            :style=`{marginTop: '8px'}`)
          .col
            div(
              v-if="joining"
              :style=`{
                borderRadius: '10px',
                //- marginBottom: '42px',
              }`
              ).row.full-width.items-start.content-start.q-mt-sm.b-50
              q-btn(
                flat color="green" icon="add" size="lg"
                :style=`{height: '120px'}`).full-width.b-50
              //- .row.full-width
            .row.full-width.q-pb-md
              edit-name(:node="node")
              ws-sphere-editor(:item="node")
              .row.full-width
                edit-category(:node="node")
          //- div(v-show="joining").col
                //- q-resize-observer(@resize="width = $event.width")
                //- q-btn(
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
            round flat color="white"
            :icon="compositionEditorShow ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
            :style=`{marginTop: '8px'}`)
  //- footer: close, publish
  .row.full-width.justify-center
    div(:style=`{maxWidth: '620px',paddingLeft: '42px', paddingRight: '42px',}`).row.full-width.q-py-sm
      q-btn(
        @click="$emit('close')"
        flat color="grey-4" no-caps
        :style=`{background: 'rgb(35,35,35)',}`).q-mr-sm Закрыть
      q-btn(
        v-if="!pick"
        @click="publish()"
        color="green" no-caps
        :loading="publishing").col Опубликовать
</template>

<script>
import compositionEditor from 'components/composition/composition_editor/index.vue'

export default {
  name: 'pageNode',
  props: ['contentKalpa', 'node', 'player'],
  components: {
    compositionEditor,
    editName: () => import('components/node_editor/view_publish/edit_name.vue'),
    editCategory: () => import('components/node_editor/view_publish/edit_category.vue')
  },
  data () {
    return {
      compositionEditorShow: true,
      joining: false,
    }
  },
  computed: {
    item () {
      return this.node.items[0]
    },
  },
  methods: {
    publish () {
      console.log('publish')
    }
  }
}
</script>
