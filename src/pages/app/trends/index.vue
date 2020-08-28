<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-header(reveal)
    .row.full-width.justify-center.b-30
      div(:style=`{position: 'relative', maxWidth: '800px'}`).row.full-width.q-pt-sm
        div(:style=`{height: '50px', borderRadius: '10px',}`
          ).row.full-width.items-center.content-center.justify-between.q-pl-md.q-pr-xs.b-40
          q-icon(name="whats_hot" color="white" size="30px").q-mr-sm
          span(:style=`{fontSize: '18px', userSelect: 'none'}`).text-bold.text-white {{$t('pageApp_trends', 'Категории')}}
          .col
          //- q-btn(round flat color="green" icon="add" to="/settings/feeds")
          //- q-btn(round flat color="white" icon="settings" to="/settings/feeds")
  q-page-container
    q-page(
      :style=`{
        paddingTop: '50px', paddingBottom: '200px',
      }`)
      .row.full-width.items-start.content-start.justify-center
        div(
          :class=`{
            'q-px-sm': $q.screen.width > 800,
          }`
          :style=`{
            maxWidth: '800px',
            borderLeft: '1px solid rgb(40,40,40)',
            borderRight: '1px solid rgb(40,40,40)',
          }`
          ).row.full-width.items-start.content-start
          kalpa-loader(v-if="sphereOid" :mangoQuery="mangoQuery")
            template(v-slot=`{items,itemsMore}`)
              list-middle(:items="items" :more="itemsMore" :itemStyles=`{marginBottom: '50px',}`)
                template(v-slot:item=`{item,itemIndex,isActive,isVisible}`)
                  node-lite(:node="item" :isActive="isActive" :isVisible="isVisible")
                  //- node-feed(:node="item" :isActive="isActive" :isVisible="isVisible")
      q-page-sticky(
        expand position="top" :style=`{zIndex: 1000}`)
        .row.full-width.justify-center.b-30
          div(:style=`{maxWidth: '800px'}`).row.full-width.q-px-md
            q-tabs(
              :value="$route.params.oid" @input="$router.push({params: {oid: $event}})"
              dense no-caps active-color="white" switch-indicator
              ).full-width.text-grey-8
              q-tab(v-for="c in nodeCategories" :key="c.sphere.oid" :name="c.sphere.oid" :label="c.alias" dense)
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import nodeFeed from 'pages/app/twitter/node_item.vue'

export default {
  name: 'pageApp__trends',
  components: {nodeFeed},
  data () {
    return {
      nodeCategories: [],
      category: null,
    }
  },
  computed: {
    sphereOid () {
      return this.category?.sphere.oid
    },
    mangoQuery () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_NODES,
          oidSphere: this.sphereOid
        }
      }
    }
  },
  watch: {
    '$route.params.oid': {
      deep: true,
      immediate: true,
      async handler (to, from) {
        this.$log('$route CHANGED', to)
        if (this.nodeCategories.length === 0) this.nodeCategories = await this.$rxdb.get(RxCollectionEnum.GQL_QUERY, 'nodeCategories')
        if (to) {
          this.category = this.nodeCategories.find(c => c.sphere.oid === to)
        }
        // go to the first category: ALL
        else {
          this.$router.replace({params: {oid: this.nodeCategories[0].sphere.oid}})
        }
      }
    }
  },
}
</script>
