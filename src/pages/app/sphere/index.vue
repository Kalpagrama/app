<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-header(reveal)
    .row.full-width.justify-center.b-30
      div(:style=`{position: 'relative', maxWidth: '800px'}`).row.full-width.q-pt-sm.q-px-sm
        div(:style=`{height: '60px'}`).row.full-width.items-between.content-between
          q-btn(
            @click="$router.back()"
            round flat color="white" icon="keyboard_arrow_left")
          .col.full-height.q-px-xs
            div(:style=`{borderRadius: '10px',overflow: 'hidden'}`).row.fit.items-center.content-center.q-pa-xs.b-40
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
            maxWidth: '800px',
          }`
          ).row.full-width.items-start.content-start
          kalpa-loader(v-if="sphere" :mangoQuery="mangoQuery")
            template(v-slot=`{items,next}`)
              list-middle(:items="items" :itemStyles=`{marginBottom: '0px',}`)
                q-infinite-scroll(@load="next" :offset="250")
                template(v-slot:item=`{item,itemIndex,isActive,isVisible}`)
                  node-lite(:node="item" :isActive="isActive" :isVisible="isVisible")
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
    mangoQuery () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_NODES,
          oidSphere: this.$route.params.oid
        }
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
