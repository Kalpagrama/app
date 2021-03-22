<template lang="pug">
kalpa-layout().b-30
  template(v-slot:body)
    .row.full-width.items-start.content-start
      //- header
      .row.full-width.justify-center
        div(:style=`{maxWidth: 500+'px'}`).row.full-width.items-center.content-center.q-pa-sm
          span(:style=`{fontSize: '18px'}`).text-white.text-bold {{$tt('Item editor')}}
          .col
          q-btn(
            round flat color="white" icon="clear"
            @click="$emit('close')")
      //- item
      //- item-preview(:item="item")
      //- node actions
      div(
        v-if="item.type === 'NODE'"
        ).row.full-width
        item-preview(:item="item")
        q-btn(outline no-caps color="white").full-width.q-mb-sm Указать другой смысл
      //- content VIDEO
      div(
        v-if="['VIDEO'].includes(item.type)"
        ).row.full-width
        video-fragmenter(
          :oid="item.oid"
          :figures="null"
          :height="$q.screen.height-60"
          @composition="contentFragmentDone"
          @close="contentFragmenterShow = false")
      //- content BOOK
      div(
        v-if="['BOOK'].includes(item.type)"
        ).row.full-width.q-pa-sm
        item-preview(:item="item")
      //- content IMAGE
      div(
        v-if="['IMAGE'].includes(item.type)"
        ).row.full-width.q-pa-sm
        item-preview(:item="item")
      //- composition actions
      div(
        v-if="item.__typename === 'Composition'"
        ).row.full-width
        video-fragmenter(
          :oid="item.layers[0].contentOid"
          :figures="item.layers[0].figuresAbsolute"
          :height="$q.screen.height-60"
          @composition="contentFragmentDone"
          @close="contentFragmenterShow = false")
      //- for all
      .row.full-width.q-pa-sm
        q-btn(
          outline no-caps color="green"
          :style=`{
            height: '50px',
          }`
          @click="$emit('close')").full-width.q-mb-sm Готово
        q-btn(
          outline no-caps color="red"
          :style=`{
            //- height: '50px',
          }`
          @click="$emit('remove')").full-width.q-mb-sm Удалить
</template>

<script>
import itemPreview from '../item_preview/index.vue'
import videoFragmenter from './video_fragmenter.vue'

export default {
  name: 'itemEditor',
  components: {
    itemPreview,
    videoFragmenter,
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
      this.$emit('close')
    },
    compositionToContent () {
      this.$log('compositionToContent')
      this.$set(this.joint.items, 1, this.content)
    },
  },
}
</script>
