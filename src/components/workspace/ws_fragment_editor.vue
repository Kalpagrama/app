<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit
  div(:style=`{height: 60+8+8+8+'px'}`).row.full-width.items-center.content-center.q-px-sm
    q-btn(round flat color="white" icon="clear" @click="fragmentCancel()")
    .col
    q-btn(
      push color="green" no-caps @click="fragmentSave()"
      :style=`{borderRadius: '10px'}`)
      span.text-bold {{$t('Save fragment')}}
  .col.full-width.scroll
    nc-fragment(
      v-if="true" :ctx="'inEditor'" :index="0"
      :thumbUrl="false" :fragment="item ? item.item : null" :mini="false" :visible="true" :stageFirst="1"
      :editorFirst="true"
      @edit="fragmentEdit"
      @content="$event => fragmentCreate(0, $event)"
      @fragment="$event => fragmentSet(0, $event)"
      @delete="fragmentDelete(0)")
</template>

<script>
import ncFragment from 'components/node_composer/nc_fragment'

export default {
  name: 'ws_wsItems_FragmentEditor',
  props: ['item'],
  components: {ncFragment},
  data () {
    return {
    }
  },
  methods: {
    fragmentCreate (index, content) {
      this.$log('fragmentCreate', index, content)
      let fragment = {
        name: '',
        thumbUrl: '',
        scale: content.type === 'VIDEO' ? content.duration : 100,
        content: content,
        cuts: []
      }
      this.$emit('item', fragment)
    },
    fragmentDelete (index) {
      this.$log('fragmentDelete', index)
      // this.$set(this.node.fragments, index, null)
      // this.fragmentSecondShow = false
      // window.location.reload(true)
    },
    fragmentSet (index, fragment) {
      this.$log('fragmentSet', index, fragment)
      // this.$set(this.node.fragments, index, fragment)
    },
    async fragmentEdit (index) {
      this.$log('fragmentEdit')
      // this.fragmentEditing = index
      // if (index < 0) return
      // this.$tween.to(document.html, 0.3, {scrollTop: index === 0 ? 0 : document.html.scrollHeight})
    },
    fragmentSave () {
      this.$log('fragmentSave')
      // create node or upate existing node...
    },
    fragmentCancel () {
      this.$log('fragmentCancel')
      if (confirm('Really exit?')) this.$emit('hide')
    }
  },
  mounted () {
    this.$log('mounted')
    // TODO: get item from somewhere is it first time? or not?
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
