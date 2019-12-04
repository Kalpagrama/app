<style lang="stylus">
.kinput
  border none
  height 100%
  padding 10px
  &:focus
    outline none
</style>
<template lang="pug">
.column.fit.bg-grey-3
  //- footer actions
  transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
    div(
      v-if="fragmentEditing < 0"
      :style=`{position: 'absolute', zIndex: 5000, bottom: '0px', height: '60px'}`).row.full-width.items-center.q-px-sm
      q-btn(flat round no-caps color="grey" icon="keyboard_arrow_left" @click="$router.back()")
      .col
      //- q-btn(
      //-     v-if="true"
      //-     push no-caps color="accent" @click="publish()"
      //-     :style=`{borderRadius: '10px', overflow: 'hidden'}`).q-mr-sm
      //-     span.text-bold Сохранить в мастерскую
      transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
        //- node.fragments.length > 0 && coll === 'editor'
        q-btn(
          v-if="node.fragments.length > 0 && coll === 'editor'"
          push no-caps color="accent" @click="publish()"
          :style=`{borderRadius: '10px', overflow: 'hidden'}`)
          span.text-bold {{ $t('Publish', 'Publish') }}
  //- body
  .col.full-width
    k-colls(ref="ncColls" @coll="coll = $event" :coll="coll" :colls="colls" :tabs="collsTabs" :style=`{height: '100%'}`)
      template(v-slot:nodes)
        ws-nodes(@nodeClick="nodeClick" :nodeClickOverride="true")
      template(v-slot:editor)
        .column.fit
          div(ref="ncScroll").col.full-width.scroll
            .row.full-width.items-start.content-start.q-pa-sm
              .row.full-width
                q-resize-observer(@resize="onResize")
                nc-fragment(:index="0" :stageInitial="1" :width="editorWidth" @edit="fragmentEdit")
                //- name
                div(ref="nameEditor").row.full-width.q-py-sm
                  div(
                    @click="nameEditStart()"
                    :style=`{
                      height: '60px', borderRadius: '10px', overflow: 'hidden',
                      border: nameEditing ? '2px solid #789dff' : '3px solid white'}`
                    ).row.full-width.items-center.justify-center.bg-white
                    input(
                      v-if="nameEditing" ref="nameInput" @blur="nameEditing = false" type="textarea" :rows="2"
                      v-model="node.name" :style=`{width: '100%'}`).kinput.text-center.text-bold
                    span(
                      v-else
                      ).text-bold {{ node.name ? node.name : $t('Whats the essence?', 'Whats the essence?') }}
                nc-fragment(:index="1" :width="editorWidth" @edit="fragmentEdit")
</template>

<script>
import wsNodes from 'components/workspace/ws_nodes'
import ncFragment from './nc_fragment'

export default {
  name: 'nodeComposer',
  components: {wsNodes, ncFragment},
  props: ['width', 'height'],
  data () {
    return {
      coll: 'editor',
      colls: [
        {id: 'nodes', name: 'Мастерская'},
        {id: 'editor', name: 'Node editor'}
      ],
      collsTabs: true,
      editorWidth: 0,
      nameEditing: false,
      fragmentEditing: -1,
      node: {
        name: '',
        shperes: [],
        categories: [],
        fragments: []
      },
      nodePublishing: false
    }
  },
  watch: {
    node: {
      handler (to, from) {
        this.$log('node CHANGED', to)
      }
    }
  },
  methods: {
    async fragmentEdit (index) {
      this.$log('fragmentEdit', index)
      this.fragmentEditing = index
      this.collsTabs = index < 0 ? true : false
      this.$tween.to(this.$refs.ncScroll, 0.3, {scrollTop: index === 0 ? 0 : this.$refs.ncScroll.scrollHeight})
    },
    onResize (e) {
      // this.$log('onResize', e)
      this.editorWidth = e.width
    },
    nodeClick ([n, ni]) {
      this.$logD('nodeClick', n, ni)
    },
    nameEditStart () {
      this.$logD('nameEditStart')
      this.nameEditing = true
      this.$nextTick(() => {
        this.$refs.nameInput.focus()
      })
    },
    async publish () {
      this.$log('publish start')
      this.nodePublishing = true
      await this.$wait(1000)
      this.nodePublishing = false
      this.$log('publish done')
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
