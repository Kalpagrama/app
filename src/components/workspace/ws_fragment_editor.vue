<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit.bg-white
  .col.full-width.scroll
    //- div(
    //-   v-for="(i,ii) in 100" :key="ii"
    //-   :style=`{height: '100px'}`).row.full-width item {{ ii }}
    nc-fragment(
      v-if="true" :ctx="'inEditor'" :index="0"
      :thumbUrl="false" :fragment="item ? item.item : null" :mini="false" :visible="true" :stageFirst="1"
      @edit="fragmentEdit"
      @content="$event => fragmentCreate(0, $event)"
      @fragment="$event => fragmentSet(0, $event)"
      @delete="fragmentDelete(0)")
  div(:style=`{height: '60px'}`
    ).row.full-width.items-center.content-center.justify-end.q-px-md
    q-btn(
      flat color="grey" no-caps @click="$refs.fragmentEditorDialog.hide()"
      :style=`{}`)
      span.text-bold {{$t('Cancel')}}
    q-btn(
      push color="green" no-caps @click=""
      :style=`{borderRadius: '10px'}`)
      span.text-bold {{ $t('Save') }}
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
