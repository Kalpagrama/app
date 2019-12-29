<template lang="pug">
q-layout(view="hHh lpR fFf").bg-white
  //- header
  q-header(reveal).row.full-width.justify-center.bg-white
    div(:style=`{height: '60px', maxWidth: $store.state.ui.pageMaxWidth+'px', borderBottom: '1px solid #eee'}`
      ).row.full-width.items-center.justify-between.q-px-sm.bg-white
      q-btn(round flat icon="list" color="green")
      .col
        .row.fit.items-center.content-center
          span.text-black.text-bold.q-pl-sm Редактор
      q-btn(flat no-caps color="red" :loading="fragmentPurging" @click="fragmentPurge()").q-mr-xl
        span.text-bold Очистить
      q-btn(push no-caps color="green" :loading="fragmentSaving" @click="fragmentSave()")
        span.text-bold Сохранить
  //- footer
  q-footer(reveal).row.full-width.justify-center.bg-white
    div(:style=`{
      position: 'relative',
      minHeight: '50px', height: spheresHeight+'px', borderTop: '1px solid #eee', maxWidth: $store.state.ui.pageMaxWidth+'px'}`
      ).row.full-width.items-center.content-center.q-px-md.bg-white
      span.text-black Spheres + Category
      .col
      q-btn(round flat dense color="grey" icon="keyboard_arrow_up" @click="spheresToggle()")
    k-menu-mobile(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px', background: 'white'}`)
  //- body
  q-page-container
    div(:style=`{}`).row.full-width.justify-center.items-start.content-start
      div(:style=`{
        position: 'relative',
        minHeight: $q.screen.height-170+'px',
        maxWidth: $store.state.ui.pageMaxWidth+'px'}`
        ).row.full-width.items-start.content-start.bg-white
        //- div(
        //-   v-if="menuShow"
        //-   @click.self="menuShow = false"
        //-   :style=`{
        //-     position: 'absolute', left: 0, zIndex: 1000,
        //-     background: 'rgba(0,0,0,0.5)'
        //-     }`
        //-   ).row.full-width
        //-   ws-fragments(
        //-     @itemClick="fragmentClick"
        //-     :style=`{
        //-       maxWidth: '300px', height: $q.screen.height-60+'px',
        //-       borderRight: '1px solid #eee'
        //-       }`
        //-     ).coliumn.bg-white
        //- .col.bg
        .row.full-width.bg-white.q-pa-sm
          .col.q-pr-xs
            fragment-editor(ref="fragmentEditorFirst")
          .col.q-pl-xs
            fragment-editor(ref="fragmentEditorFirst")
        .row.full-width.justify-center
          textarea(
            v-model="node.name" placeholder="В чем суть?" rows="1" @input="nameChanged"
            :style=`{fontSize: '30px', paddingLeft: '20px', paddingRight: '10px', paddingTop: '5px', paddingBottom: '5px', maxHeight: '150px'}`
            ).full-width.kinput.text-bold.text-black
        .row.full-width.bg-white.q-pa-sm
          fragment-editor(ref="fragmentEditorSecond")
        //- div(v-for="n in 100" :key="n" :style=`{height: '300px'}`).row.full-width items {{ n }}
</template>

<script>
import wsFragments from 'components/workspace/ws_fragments'
import fragmentEditor from 'components/node/fragment_editor'

export default {
  name: 'pageAppFragment',
  components: {wsFragments, fragmentEditor},
  data () {
    return {
      bg: 'white',
      menuShow: false,
      spheresHeight: 50,
      node: {
        name: ''
      }
    }
  },
  methods: {
    spheresToggle () {
      this.$log('spheresToggle')
      this.$tween.to(this, 0.5, {spheresHeight: this.spheresHeight === 50 ? 400 : 50})
    },
    nameChanged (e) {
      // this.$log('nameChanged', e)
      e.target.style.height = e.target.scrollHeight + 'px'
    },
    async fragmentClick (i) {
      this.$log('fragmentClick', i)
      this.$refs.fragmentEditor.fragmentUse(i.item)
      await this.$wait(200)
      this.menuShow = false
    },
    menuToggle () {
      this.$log('menuToggle')
      this.menuShow = !this.menuShow
    },
    onResize (e) {
      // this.$log('onResize', e)
      // this.$q.notify('onResize')
    },
    onScroll (e) {
      // this.$log('onScroll')
    }
  },
  mounted () {
    this.$log('mounted')
    this.$q.addressbarColor.set('red')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
