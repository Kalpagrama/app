<template lang="pug">
div(
  :style=`{
    position: 'relative',
    height: styles.height,
    }`
  ).row.full-width.items-start.content-start
  slot
  img(
    draggable="false"
    :src="url"
    :style=`{
      borderRadius: '10px',
      background: 'rgb(40,40,40)',
      height: styles.height,
      objectFit: styles.objectFit,
    }`
    ).full-width
  //- footer
  transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    div(
      v-if="!isMini"
      :style=`{
        position: 'absolute', zIndex: 3000,
        bottom: '0px',
        borderRadius: '0 0 10px 10px',
        userSelect: 'none',
      }`
      ).row.full-width.items-center.content-center.q-pa-sm
      div(
        @click="contextClick()"
        :style=`{
          background: 'rgba(0,0,0,0.5)',
          borderRadius: '10px',
        }`
        ).row.items-center.content-center.q-py-xs.q-px-sm.cursor-pointer
        q-icon(name="select_all" color="white" size="16px").q-ma-xs
        span.text-white {{$t('Context')}}
        //- span.text-white {{ composition.layers[0].contentName }}
  //- q-btn(
    @click="contextClick"
    :to="'/content/'+composition.layers[0].contentOid"
    round flat color="white" no-caps icon="select_all"
    :style=`{
      position: 'absolute', top: '4px', left: '4px', zIndex: 100,
    }`)
</template>

<script>
import {assert} from 'src/system/common/utils'
import { ContentApi } from 'src/api/content'

export default {
  name: 'typeImage',
  components: {
  },
  props: {
    compositionKey: {type: String},
    composition: {type: Object, required: true},
    isActive: {type: Boolean},
    isVisible: {type: Boolean},
    isMini: {type: Boolean},
    options: {type: Object},
    styles: {type: Object, default: {}},
  },
  computed: {
    url () { return ContentApi.urlSelect(this.composition) }
  },
  methods: {
    contextClick () {
      this.$log('contextClick')
      if (this.options.nodeOid) {
        this.$store.commit('ui/stateSet', ['nodeOnContent', this.options.nodeOid])
      }
      this.$router.push('/content/' + this.composition.layers[0].contentOid)
    }
  }
}
</script>
