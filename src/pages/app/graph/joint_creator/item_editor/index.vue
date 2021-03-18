<template lang="pug">
kalpa-layout().b-30
  template(v-slot:body)
    .row.full-width.items-start.content-start
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
      //- body
      .row.full-width.justify-center.q-px-sm.br
        div(:style=`{maxWidth: 500+'px'}`).row.full-width
          //- header
          .row.full-width.items-center.content-center.q-pa-sm
            q-btn(
              round flat color="white" icon="west"
              @click="$emit('close')").q-mr-sm
            span(:style=`{fontSize: '18px'}`).text-white.text-bold Редактор элемента связи
          //- item
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
              @click="contentFragmentStart").full-width.q-mb-sm Выделить фрагмент
          //- composition actions
          div(
            v-if="item.__typename === 'Composition'"
            ).row.full-width.q-pa-sm
            q-btn(
              outline no-caps color="white"
              @click="compositionFragmentChange"
              ).full-width Изменить фрагмент
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
