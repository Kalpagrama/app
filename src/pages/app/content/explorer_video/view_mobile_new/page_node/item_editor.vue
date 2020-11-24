<template lang="pug">
.row.full-width
  div(
    :style=`{borderRadius: '10px', overflow: 'hidden'}`).row.full-width.items-start.content-start.b-30
    //- NODE
    div(
      v-if="item.type === 'NODE'"
      ).row.full-width
      img(
        :src="item.thumbUrl"
        :style=`{
          borderRadius: '10px',
        }`
        ).full-width
      div(
        :style=`{
          position: 'relative',
        }`
        ).row.full-width.justify-center.q-pa-sm.b-30
        span.text-grey-6 {{ item.name }}
        q-btn(
          @click="editing = !editing"
          round flat color="white" dense
          :icon="editing ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
          :style=`{position: 'absolute', zIndex: 110, right: '4px', bottom: '0px',}`)
  //- CONTENT
  //- USER
  //- SPHERE,WORD,SENTENCE
</template>

<script>
import compositionEditor from 'components/composition/composition_editor/index.vue'

export default {
  name: 'pageNode_itemEditor',
  props: ['item'],
  components: {
    compositionEditor
  },
  data () {
    return {
      editing: false,
    }
  },
  mounted () {
    this.$log('mounted')
  }
}
</script>
