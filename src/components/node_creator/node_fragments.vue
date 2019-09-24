<template lang="pug">
div(:style=`{position: 'relative', minWidth: colWidth+'px', width: width+'px', maxHeight: '100%'}`).column.fit
  //- body
  div(body-scroll-lock-ignore).col.scroll.q-px-sm
    div(
      v-for="(f, fkey) in fragments" :key="fkey"
      :style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.items-start.bg-white.q-mt-sm.shadow-1
      //- fragment actions top right
      div(:style=`{position: 'absolute', zIndex: 100, top: '8px', right: '8px', height: '40px', opacity: 0.3}`).row
        q-btn(round flat dense color="white" icon="edit" @click="$emit('edit', f, fkey)").bg-grey-9
      //- fragment actions top left
      div(:style=`{position: 'absolute', zIndex: 100, top: '8px', left: '8px', height: '40px', opacity: 0.3}`).row
        q-btn(round flat dense color="white" icon="clear" @click="$emit('delete', f, fkey)").bg-grey-9
      //- fragment actions bottom right
      div(:style=`{position: 'absolute', zIndex: 100, bottom: '8px', right: '8px', height: '40px', opacity: 0.3}`).row
        q-btn(round flat dense color="white" icon="keyboard_arrow_down" @click="$emit('copy', f, fkey)").bg-grey-9
      //- fragment preview only?
      img(
        :src="f.thumbUrl || f.content.thumbUrl[0]"
        :style=`{width: '100%', objectFit: 'contain'}` draggable="false")
      //- name with tags
      div(
        v-if="f.label"
        :style=`{position: 'absolute', bottom: '10px', left: '10px', borderRadius: '10px', overflow: 'hidden', opacity: 0.95}`).row.bg-grey-9.q-px-sm.q-py-xs
        span.text-bold.text-white {{ f.label }}
        div(v-if="false").row.full-width
          small.text-white {{ f.relativePoints }}
    //- content add
    div(
      v-if="true"
      :style=`{position: 'relative', height: '100px', borderRadius: '10px', overflow: 'hidden'}`
      ).row.full-width.items-center.justify-center.bg-white.q-my-sm
      div(v-show="!mini" :style=`{width: '100px'}`).row.full-height.justify-center.items-center
        //- q-btn(round flat icon="more_vert" color="grey-5")
      div(v-show="!mini").col.full-height
        .row.fit.items-center.justify-center
          q-btn(icon="add" color="primary" round outline size="lg" @click="$emit('add')")
      div(:style=`{width: '100px'}`).row.full-height.justify-center.items-center
        //- q-btn(round flat color="grey-5" @click="toggle()"
          :icon="mini ? 'keyboard_arrow_right' : 'keyboard_arrow_left'")
    //- toggle fragments from workspace
    q-btn(
      v-if="false" :icon="fragmentsWorkspaceShow ? 'keyboard_arrow_right' : 'keyboard_arrow_left'" outline color="grey-6"
      style=`height: 50px; borderRadius: 8px` no-caps
      @click="fragmentsWorkspaceShow = !fragmentsWorkspaceShow").full-width.q-mt-md
      span {{fragmentsWorkspaceShow ? 'Скрыть фрагменты из мастерской' : 'Показать фрагменты из мастерской'}}
    //- margin bottom
    div(:style=`{height: '100px'}`).row.full-width
</template>

<script>
export default {
  name: 'nodeCreator__nodeFragments',
  props: ['colWidth', 'fragments'],
  components: {},
  data () {
    return {
      mini: false,
      width: 500
    }
  },
  watch: {
    mini: {
      // immediate: true,
      handler (to, from) {
        this.$log('mini CHANGED', to)
        if (to === true) {
          this.$tween.to(this, 0.5, {width: 120})
        } else {
          this.$tween.to(this, 0.5, {width: 500})
        }
      }
    }
  },
  methods: {
    toggle () {
      this.$log('toggle')
      this.mini = !this.mini
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
