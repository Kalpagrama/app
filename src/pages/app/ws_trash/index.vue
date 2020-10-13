<template lang="pug">
.row.full-width.items-start
  .row.full-width.justify-center.q-pt-sm.q-px-sm
    div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width
      div(:style=`{height: '60px',borderRadius: '10px',}`).row.full-width.items-center.content-center.b-40.q-px-sm
        q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.back()")
        span(:style=`{fontSize: '18px'}`).text-white.text-bold Trash
  //- items
  .row.full-width.items-start.content-start.q-py-sm
    kalpa-loader(
      :immediate="true"
      :query="queryItems" :limit="10000"
      v-slot=`{items,next}`)
      div().row.full-width.items-start.content-start.q-px-sm
        div(
          v-for="(i,ii) in items" :key="ii"
          :style=`{
            borderRadius: '10px', overflow: 'hidden',
          }`
          ).row.full-width.q-py-sm.q-px-md.q-mb-sm.b-40
          span.text-white {{ i.name }}
          .row.full-width
            small.text-grey-6 {{ i.wsItemType }}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'wsTrash',
  data () {
    return {
    }
  },
  computed: {
    queryItems () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_ANY,
          deletedAt: {$exists: true}
        }
      }
      return res
    }
  },
  mounted () {
    this.$log('mounted')
    this.$store.commit('ui/stateSet', ['showMobileNavigation', false])
    this.$store.commit('ui/stateSet', ['showDesktopNavigation', false])
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.$store.commit('ui/stateSet', ['showMobileNavigation', true])
    this.$store.commit('ui/stateSet', ['showDesktopNavigation', true])
  }
}
</script>
