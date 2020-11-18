<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-header(reveal)
    .row.full-width.justify-center.b-30.q-px-sm.q-pt-sm
      div(:style=`{position: 'relative', maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
        div(
          :style=`{
            height: '60px',
            borderRadius: '10px', overflow: 'hidden',
          }`).row.full-width.items-center.content-center.q-pa-sm.b-40
          q-btn(
            @click="$router.back()"
            round flat color="white" icon="keyboard_arrow_left")
          q-icon(name="blur_on" color="white" size="30px")
          .col.q-px-md
            span(v-if="sphere" :style=`{fontSize: '18px'}`).text-white.text-bold {{ sphere.name }}
          kalpa-bookmark(
            v-if="sphere"
            :oid="sphere.oid"
            type="SPHERE"
            :name="sphere.name"
            :thumbUrl="''"
            :isActive="true")
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
            maxWidth: $store.state.ui.pageWidth+'px',
          }`
          ).row.full-width.items-start.content-start
          kalpa-loader(
            v-if="sphere" :query="query" :limit="15" v-slot=`{items, next}`)
            list-middle(:items="items" :itemStyles=`{marginBottom: '50px',}`)
              q-infinite-scroll(@load="next" :offset="$q.screen.height")
              template(v-slot:item=`{item,itemIndex,isActive,isVisible,width}`)
                node-feed(:node="item" :isActive="isActive" :isVisible="isVisible" :width="width")
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
