<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-header(reveal)
    .row.full-width.justify-center.b-30
      div(:style=`{position: 'relative', maxWidth: '800px'}`).row.full-width.q-pt-sm
        div(:style=`{height: '50px', borderRadius: '10px',}`
          ).row.full-width.items-center.content-center.justify-between.q-pl-md.q-pr-xs.b-40
          q-icon(name="blur_on" color="white" size="30px").q-mr-sm
          span(v-if="sphere" :style=`{fontSize: '18px'}`).text-white.text-bold {{ sphere.name }}
          .col
  q-page-container
    q-page(
      :style=`{
        paddingTop: '8px', paddingBottom: '200px',
      }`)
      .row.full-width.items-start.content-start.justify-center
        div(
          :class=`{
          }`
          :style=`{
            maxWidth: '800px',
            //- borderLeft: '1px solid rgb(40,40,40)',
            //- borderRight: '1px solid rgb(40,40,40)',
          }`
          ).row.full-width.items-start.content-start
          kalpa-loader(v-if="sphere" :mangoQuery="mangoQuery")
            template(v-slot=`{items,itemsMore}`)
              list-middle(:items="items" :more="itemsMore" :itemStyles=`{marginBottom: '0px',}`)
                template(v-slot:item=`{item,itemIndex,isActive,isVisible}`)
                  node-lite(:node="item" :isActive="isActive" :isVisible="isVisible")
                  //- node-feed(:node="item" :isActive="isActive" :isVisible="isVisible")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import nodeFeed from 'pages/app/twitter/node_item.vue'

export default {
  name: 'pageApp_sphere',
  components: {nodeFeed},
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
