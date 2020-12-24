<template lang="pug">
q-layout(
  view="hHh Lpr lff").b-30
  q-header(reveal).b-30
    .row.full-width.justify-center.q-pt-sm.q-px-sm
      div(
        :style=`{
          maxWidth: $store.state.ui.pageWidth+'px',
          minHeight: '60px',
          borderRadius: '10px',
        }`
        ).row.full-width.items-center.content-center.q-px-sm.b-40
        q-btn(round flat color="white" icon="west" @click="$router.back()").q-mr-sm
        .col
          span(:style=`{fontSize: '18px'}`).text-white.text-bold {{ title }}
  q-page-container
    q-page.row.full-width.justify-center.q-pt-sm
      div(
        :style=`{maxWidth: $store.state.ui.pageWidth+'px'}`
        ).row.full-width.items-start.content-start
        node-feed(
          v-if="node"
          :node="node"
          :isActive="true"
          :isVisible="true")
        //- .row.full-width.q-pa-md
          div(
            :style=`{
              height: '100px',
              background: 'rgb(35,35,35)',
              borderRadius: '10px',
            }`
            ).row.full-width
          .row.full-width.justify-end.q-py-xs
            q-btn(flat color="grey-5" no-caps) Add comment
          .row.full-width.q-pa-sm
            div(
              v-for="(c,ci) in 20" :key="ci"
              :style=`{
                minHeight: '40px',
              }`
              ).row.full-width.justify-start.q-mb-xs
              span(v-for="n in ci*2").text-white comment {{ ci }}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageApp_node',
  data () {
    return {
      node: null,
    }
  },
  computed: {
    title () {
      if (this.node) {
        if (this.node.items.length === 1) return 'Ядро'
        else return 'Связь'
      }
      else {
        return ''
      }
    }
  },
  watch: {
    '$route.params.oid': {
      deep: true,
      immediate: true,
      async handler (to, from) {
        this.$log('$route.params.oid TO', to)
        if (to) {
          this.node = await this.$rxdb.get(RxCollectionEnum.OBJ, to)
        }
      }
    },
  },
}
</script>
