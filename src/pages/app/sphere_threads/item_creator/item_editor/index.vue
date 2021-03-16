<template lang="pug">
q-layout(
  container
  view="lHh lpR lFf"
  :style=`{
    height: $q.screen.height+'px',
  }`
  ).b-30
  //- content fragmenter
  q-dialog(
    v-model="contentFragmenterShow"
    position="bottom"
    :maximized="true")
    content-fragmenter(
      v-if="item"
      :oid="item.__typename === 'Composition' ? item.layers[0].contentOid : item.oid"
      :figures="item.__typename === 'Composition' ? item.layers[0].figuresAbsolute : null"
      @composition="contentFragmentDone"
      @close="contentFragmenterShow = false")
  //- header
  q-header()
    .row.full-width.items-center.content-center.q-pa-sm
      span(:style=`{fontSize: '18px'}`).text-white.text-bold.q-ml-sm {{$tt('Item editor')}}
      .col
      q-btn(
        round flat color="white" icon="clear"
        @click="$emit('close')")
  //- footer
  q-footer()
    div(
      :style=`{
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)',
      }`
      ).row.full-width.q-px-md.q-pt-md
      q-btn(
        no-caps color="green"
        :style=`{
          height: '50px',
        }`
        @click="$emit('close')").full-width
        span.text-bold {{$tt('Ready')}}
  //- page
  q-page-container
    q-page
      .row.full-width.q-px-sm
        item-preview(:item="item")
      //- node actions
      div(
        v-if="item.type === 'NODE'"
        ).row.full-width
        q-btn(outline no-caps color="white").full-width.q-mb-sm Указать другой смысл
      //- content actions
      div(
        v-if="['VIDEO', 'IMAGE', 'BOOK'].includes(item.type)"
        ).row.full-width.q-pa-sm
        q-btn(
          outline no-caps color="white"
          @click="contentFragmentStart").full-width.q-mb-sm {{$tt('Fragment it')}}
      //- composition actions
      div(
        v-if="item.__typename === 'Composition'"
        ).row.full-width.q-pa-sm
        q-btn(
          outline no-caps color="white"
          @click="compositionFragmentChange"
          ).full-width Изменить фрагмент
</template>

<script>
import itemPreview from '../item_preview/index.vue'
import contentFragmenter from './content_fragmenter.vue'

export default {
  name: 'itemEditor',
  components: {
    itemPreview,
    contentFragmenter,
  },
  props: ['joint', 'item'],
  data () {
    return {
      content: null,
      composition: null,
      contentFragmenterShow: false,
    }
  },
  methods: {
    contentFragmentStart () {
      this.$log('contentFragmentStart')
      this.contentFragmenterShow = true
    },
    contentFragmentDone (composition) {
      this.$log('contentFragmentDone', composition)
      this.content = JSON.parse(JSON.stringify(this.item))
      this.contentFragmenterShow = false
      this.$set(this.joint.items, 1, composition)
    },
    compositionFragmentChange () {
      this.$log('contentFragmentChange')
      // this.composition = JSON.parse(JSON.stringify(this.item))
      // this.$set(this.joint.items, 1, this.content)
      this.contentFragmenterShow = true
    },
    compositionToContent () {
      this.$log('compositionToContent')
      this.$set(this.joint.items, 1, this.content)
    },
  },
}
</script>
