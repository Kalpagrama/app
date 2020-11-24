<template lang="pug">
q-page(
  :style=`{
    paddingTop: '0px',
    paddingBottom: '0px',
  }`
  ).row.full-width.items-start.content-start.justify-center
  //- contentfinder
  q-dialog(
    v-model="contentFinderShow"
    position="bottom" maximized)
    kalpa-finder(
      @contentKalpa="contentKalpaFound"
      :pagesFilter="['workspace', 'kalpa']"
      :workspaceTypes="['IMAGE', 'VIDEO']"
      :kalpaTypes="['IMAGE', 'VIDEO']"
      :style=`{
        maxWidth: $store.state.ui.pageWidth+'px',
        height: $q.screen.height+'px',
      }`).b-30
      template(v-slot:header)
        div(:style=`{height: '60px'}`).row.full-width.items-center.content-center
          q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.back()")
          .col
            span(:style=`{fontSize: '18px'}`).text-white.text-bold Выбрать контент
      template(v-slot:tint=`{item}`)
        div(
          @click="itemFound(item)"
          :style=`{position: 'absolute', zIndex: 1000,}`).row.fit
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
      v-show="leftItemEditorShow"
      :style=`{
        paddingTop: '20px',
        borderRadius: '10px',
        zIndex: 10,
      }`
      ).row.full-width.bg-black
      composition-editor(
        :player="player" :composition="item"
        :contentKalpa="contentKalpa")
    div(
      :style=`{
        paddingTop: leftItemEditorShow ? '0px' : '20px',
      }`
      ).row.full-width.items-start.content-start.justify-center
      //- name top
      div(
        v-if="joining"
        :style=`{
          position: 'relative',
          marginTop: '-20px',
          paddingTop: '28px',
          paddingBottom: '8px',
          paddingLeft: '42px',
          paddingRight: '42px',
          borderRadius: '0 0 10px 10px'
        }`
        ).row.full-width.justify-center.q-px-sm.b-30
        span.text-grey-6 В чем суть?
        q-btn(
          @click="leftItemEditorShow = !leftItemEditorShow"
          round flat color="white" dense
          :icon="leftItemEditorShow ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
          :style=`{position: 'absolute', zIndex: 110, right: '4px', bottom: '0px',}`)
      //- name
      .row.full-width
        edit-name(
          :node="node"
          :placeholder="joining ? 'В чем связь?' : 'В чем суть?'")
      //- add
      .row.full-width.q-mb-sm
        //- join
        div(
          v-if="joining"
          :style=`{borderRadius: '10px', overflow: 'hidden'}`).row.full-width.items-start.content-start.b-30
          img(
            v-if="rightItem"
            @click="joining = false"
            :src="rightItem.thumbUrl"
            :style=`{
              borderRadius: '10px',
            }`
            ).full-width
          div(
            :style=`{
              position: 'relative',
            }`
            ).row.full-width.justify-center.q-pa-sm.b-30
            span.text-grey-6 В чем суть?
            q-btn(
              round flat color="white" dense
              :icon="leftItemEditorShow ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
              :style=`{position: 'absolute', zIndex: 110, right: '4px', bottom: '0px',}`)
        //- join toggle
        div(:style=`{paddingLeft: '42px', paddingRight: '42px',}`).row.full-width.items-start.content-start
          q-btn(
            @click="joiningToggle()"
            flat no-caps
            :color="joining ? 'red' : 'green'"
            :style=`{
            }`).fit {{ joining ? 'Убрать связь' : 'Добавить связь' }}
      //- spheres & category
      div(:style=`{paddingLeft: '42px', paddingRight: '42px', paddingBottom: '16px',}`).row.full-width
        ws-sphere-editor(:item="node")
        .row.full-width
          edit-category(:node="node")
      //- div(
        :style=`{
          maxWidth: '620px',
        }`).row.full-width.items-start.content-start
        .row.full-width.items-start.content-start
          q-btn(
            @click="joining = !joining"
            round flat
            :color="joining ? 'grey-4' : 'green'"
            :icon="joining ? 'link_off' : 'link'"
            :style=`{marginTop: '8px', opacity: 0,}`)
          .col
            //- div(
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
              //- small.text-white {{node}}
              edit-name(:node="node")
              q-btn(
                v-if="joining === false"
                @click="joining = true"
                color="green" flat no-caps icon="add"
                :style=`{
                }`).full-width.b-40
              img(
                v-if="joining"
                @click="joining = false"
                :src="contentKalpa.thumbUrl"
                :style=`{
                  borderRadius: '10px',
                }`
                ).full-width
              //- .row.full-width.justify-center.q-py-md
                q-btn(color="green" round dense outline icon="add" :style=`{borderRadius: '50%',}`)
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
      contentFinderShow: false,
      leftItemEditorShow: true,
      rightItemEditorShow: false,
      rightItem: null,
      joining: false,
    }
  },
  computed: {
    item () {
      return this.node.items[0]
    },
  },
  methods: {
    joiningToggle () {
      this.$log('joiningToggle')
      if (this.joining) {
        // close joining shit
        this.joining = false
      }
      else {
        // open content finder...
        this.player.pause()
        this.contentFinderShow = true
      }
    },
    contentKalpaFound (contentKalpa) {
      this.$log('contentKalpaFound', contentKalpa)
    },
    itemFound (item) {
      this.$log('itemFound', item)
      this.rightItem = item // content => node?
      this.contentFinderShow = false
      this.joining = true
    },
    publish () {
      console.log('publish')
    }
  }
}
</script>
