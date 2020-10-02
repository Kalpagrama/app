<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-header(reveal)
    .row.full-width.justify-center.b-30
      div(:style=`{position: 'relative', maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width.q-pt-sm
        div(
          :style=`{
            height: '60px',
            borderRadius: '10px', overflow: 'hidden',
          }`).row.full-width.items-center.content-center.q-pa-sm.b-40
          q-btn(
            @click="$router.back()"
            round flat color="white" icon="keyboard_arrow_left")
          q-icon(name="blur_on" color="white" size="30px").q-mx-sm
          .col
            span(v-if="sphere" :style=`{fontSize: '18px'}`).text-white.text-bold {{ sphere.name }}
            //- .col
          kalpa-follow(:oid="$route.params.oid")
  q-page-container
    q-page(
      :style=`{
        paddingTop: '16px', paddingBottom: '200px',
      }`)
      .row.full-width.items-start.content-start.justify-center
        div(
          :class=`{
          }`
          :style=`{
            maxWidth: $store.state.ui.pageMaxWidth+'px',
          }`
          ).row.full-width.items-start.content-start
          kalpa-loader(
            v-if="sphere" :query="query" :limit="3" v-slot=`{items, next}`
            @reset="$refs.qis.reset(), $refs.qis.resume(), $refs.qis.poll()")
            list-middle(:items="items" :itemStyles=`{marginBottom: '50px',}`)
              q-infinite-scroll(ref="qis" @load="next" :offset="500")
              template(v-slot:item=`{item,itemIndex,isActive,isVisible}`)
                node-feed(:node="item" :isActive="isActive" :isVisible="isVisible")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageApp_sphere',
  components: {},
  data () {
    return {
      sphere: null,
    }
  },
  computed: {
    query () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_NODES,
          oidSphere: this.$route.params.oid
        },
        populateObjects: true,
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
          this.sphere = await this.$rxdb.get(RxCollectionEnum.OBJ, to)
        }
      }
    }
  },
}
</script>
