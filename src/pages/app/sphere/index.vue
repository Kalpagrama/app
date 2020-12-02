<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-header(reveal :style=`{paddingTop: 'env(safe-area-inset-top)',}`).b-30
    .row.full-width.justify-center.b-30.q-px-sm.q-pt-sm
      div(:style=`{position: 'relative', maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
        div(
          :style=`{
            minHeight: '60px',
            borderRadius: '10px', overflow: 'hidden',
          }`).row.full-width.items-center.content-center.q-pa-sm.b-40
          q-icon(name="blur_on" color="white" size="30px").q-ml-sm
          .col.q-px-sm
            span(
              v-if="sphere" :style=`{fontSize: '18px'}`
              ).text-white.text-bold {{ sphere.name }}
          kalpa-bookmark(
            v-if="sphere"
            :oid="sphere.oid"
            type="SPHERE"
            :name="sphere.name"
            :thumbUrl="''"
            :isActive="true")
  q-page-container
    component(
      v-if="sphere"
      :is="`page-${pageId}`"
      :sphere="sphere")
      //- .row.full-width.bg-red.q-py-md
        span.text-white tabs
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageApp_sphere',
  components: {
    pageNodes: () => import('./page_nodes/index.vue'),
    pageContent: () => import('./page_content/index.vue'),
  },
  data () {
    return {
      pageId: 'nodes',
      sphere: null,
    }
  },
  watch: {
    '$route.params.oid': {
      deep: true,
      immediate: true,
      async handler (to, from) {
        if (to) {
          this.$log('$route.params.oid TO', to)
          this.sphere = await this.$rxdb.get(RxCollectionEnum.OBJ, to)
        }
      }
    }
  }
}
</script>
