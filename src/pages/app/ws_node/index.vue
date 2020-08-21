<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-header(reveal)
    .row.full-width.justify-center.b-30
      div(:style=`{position: 'relative', maxWidth: '800px'}`).row.full-width.b-30
        div(
          v-if="true"
          :style=`{height: '50px'}`).row.full-width.items-center.content-center.justify-between.q-px-md
          span(:style=`{fontSize: '19px'}`).text-white.text-bold Редактор ядра
  q-page-container
    q-page
      .row.full-width.justify-center
        div(:style=`{maxWidth: '800px',}`).row.full-wdith
          small.text-white {{ node }}
      q-page-sticky(expand position="bottom")
        .row.full-width.justify-center.b-30
          div(:style=`{maxWidth: '800px'}`).row.full-width.q-px-md
            q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.back()")
            //- q-tabs(v-model="type" no-caps dense active-color="white" align="left" switch-indicator).text-grey-4
            //-   q-tab(v-for="t in types" :key="t.id" :name="t.id" :label="t.name")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageApp_wsNode',
  data () {
    return {
      node: null,
    }
  },
  watch: {
    '$route.params.id': {
      immediate: true,
      async handler (to, from) {
        this.$log('id TO', to)
        if (to) {
          let {items: [item]} = await this.$rxdb.find({
            selector: {
              rxCollectionEnum: RxCollectionEnum.WS_NODE,
              id: to
            }
          })
          this.node = item
        }
      }
    }
  },
  mounted () {
    this.$log('mounted')
  }
}
</script>
