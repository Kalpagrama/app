<template lang="pug">
div(
  ).row.full-width.justify-center.q-pt-xs
  div(
    :style=`{
      maxWidth: 700+'px',
    }`).row.full-width.q-px-sm
    //- editor wrapper
    div(
      :style=`{
        borderRadius: '10px',
        }`
      ).row.full-width.items-start.content-start.q-pb-md.b-40
      //- composition.editor
      .row.full-width
        composition-editor(
          :player="player" :composition="item"
          :contentKalpa="contentKalpa")
      //- node.name/node.sphers editors wrapper
      .row.full-width.justify-center
        div(
          :style=`{
            maxWidth: '620px',
            //- paddingLeft: $q.screen.width > 800 ? '40px' : '8px',
            //- paddingRight: $q.screen.width > 800 ? '40px' : '8px',
          }`).row.full-width.q-pt-sm
          //- node.name editor
          div(:style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden', zIndex: 100,}`).row.full-width
            q-input(
              v-model="node.name"
              filled dark dense color="grey-6"
              autogrow type="textarea"
              placeholder="В чем суть?"
              :input-style=`{
                minHeight: '60px',
              }`).full-width
          ws-sphere-editor(:item="node").q-py-sm
    //- footer: actions close, createNode
    .row.full-width.justify-center
      div(:style=`{maxWidth: '620px',}`).row.full-width.q-py-sm
        q-btn(flat color="white" no-caps @click="$emit('close')").b-40 {{$t('close', 'Закрыть')}}
        .col
        //- slot(name="nodeAction" :node="node")
        q-btn(v-if="!pick" color="green" no-caps @click="publish()") Опубликовать
        q-btn(
          v-if="pick"
          @click="pick(node)"
          color="red" dense no-caps
          :style=`{
          }`).q-px-sm
          span.text-bold Выбрать ядро
</template>

<script>
import compositionEditor from 'components/composition/composition_editor/index.vue'

export default {
  name: 'contentExplorerVideo_viewNode',
  components: {compositionEditor},
  inject: ['pick'],
  props: ['node', 'player', 'contentKalpa', 'contentBookmark'],
  data () {
    return {
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
        // TODO: optimize for items[0].layers[0].figuresAbsolute[0].t compare to from value
        if (to) this.$store.commit('ui/stateSet', ['contentNodes', [JSON.parse(JSON.stringify(to))]])
      }
    }
  },
  methods: {
    publish () {
      this.$log('publish')
      // make a copy...
      this.$router.push('/workspace/node/' + this.node.id)
    }
  },
  async mounted () {
    this.$log('mounted')
    await this.$wait(300)
    this.$store.commit('ui/stateSet', ['contentNodes', [JSON.parse(JSON.stringify(this.node))]])
  }
}
</script>
