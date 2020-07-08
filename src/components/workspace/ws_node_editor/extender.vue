<template lang="pug">
div(
  :style=`{
    position: 'relative', zIndex: 99999,
    borderRadius: $q.screen.gt.xs ? '10px' : 'none',
    overflow: 'hidden',
  }`
  ).column.full-width.b-50
  q-resize-observer(@resize="width = $event.width")
  //- header
  .row.full-width.items-center.content-center.justify-between.q-pa-sm
    q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$emit('close')").q-mr-sm
    span(:style=`{fontSize: '16px',}`).text-white.text-bold {{ extendTitle }}
    q-btn(round flat color="white" icon="more_vert")
  //- body
  .col.full-width.scroll
    div(v-if="extendType === 'node'").row.full-width.items-start.content-start
      div(:style=`{position: 'relative'}`).row.full-width.justify-center
        div(
          v-if="extendItem"
          :style=`{
            position: 'relative',
            width: '25%', height: '25%', borderRadius: '10px',}`).row.bg-black
          img(
            :src="extendItem.items[0].thumbUrl"
            :style=`{
              objectFit: 'contain', zIndex: 200,
              borderRadius: '10px', overflow: 'hidden',
            }`).fit
        div(
          v-if="extendItem"
          :style=``).row.full-width.justify-center.br
          span.text-white {{ extendItem.name }}
        //- div(
        //-   :style=`{
        //-     position: 'absolute', zIndex: 100, top: '4px',
        //-     width: '100%',
        //-     borderBottom: '200px solid rgb(70,70,70)',
        //-     borderLeft: width*0.375+'px solid transparent',
        //-     borderRight: width*0.375+'px solid transparent',
        //-     height: 0,
        //-   }`).row
        div(:style=`{marginTop: '53px'}`).row.full-width
          .row.full-width.justify-center
            div(:style=`{maxWidth: '500px',}`).row.full-width
              img(
                v-if="extendItem"
                :src="extendItem.items[0].thumbUrl"
                :style=`{
                  borderRadius: '10px', overflow: 'hidden',
                }`
                ).full-width
      //- node(
      //-   v-if="extendItem" :node="extendItem" :nodeFullReady="extendItem"
      //-   :active="false && extendActive" :mini="false" :visible="true" :onlyItems="true"
      //-   :style=`{
      //-     maxWidth: '200px',
      //-   }`)
      //- .row.full-width
      //-   small.text-white {{ node }}
    div(v-if="extendType === 'sphere'").row.full-width.items-start.content-start
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'wsNodeExtender',
  props: {
    sid: {type: String, default () { return 'wsNodeEditor' }},
    value: {type: Object},
    extendType: {type: String, required: true},
    extendOid: {type: String, required: true},
  },
  data () {
    return {
      width: 0,
      extendItem: null,
      extendActive: true,
    }
  },
  computed: {
    extendTitle () {
      if (this.extendType === 'node') return this.$t('wsNodeExtender_Extend node', 'Расширить ядро')
      else if (this.extendType === 'sphere') return this.$t('wsNodeExtender_Extend sphere', 'Расширить сферу сути')
      else return ''
    },
    node () {
      return this.value
    }
  },
  watch: {
    extendType: {
      immediate: true,
      async handler (to, from) {
        this.$log('extendType TO', to)
        if (to && this.extendOid) {
          this.extendItem = await this.$rxdb.get(RxCollectionEnum.OBJ, this.extendOid)
        }
      }
    }
  },
  mounted () {
    this.$log('mounted')
  }
}
</script>
