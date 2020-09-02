<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-header(reveal)
    .row.full-width.justify-center.b-30
      div(:style=`{position: 'relative', maxWidth: '800px'}`).row.full-width.q-pt-sm
        .row.full-width.items-start.content-start
          q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.back()")
          .col
            div(:style=`{borderRadius: '10px',}`
              ).row.full-width.items-center.content-center.justify-between.b-40.q-pa-xs
              q-icon(name="blur_on" color="white" size="30px").q-mx-sm
              div(:style=`{overflowX: 'auto'}`).col
                span(
                  v-if="sphere"
                  :style=`{fontSize: '18px', whiteSpace: 'nowrap'}`).text-white.text-bold {{ sphere.name }}
              //- q-btn(round flat color="grey-8" icon="more_vert")
              q-btn(round flat color="red" icon="delete_outline" @click="sphereDelete()")
            div(:style=`{paddingLeft: '14px',}`).row.full-width.justify-start
              q-tabs(
                v-model="viewId"
                no-caps dense active-color="white" switch-indicator).text-grey-8
                q-tab(v-for="v in views" :key="v.id" :name="v.id" :label="v.name")
  q-page-container
    q-page(:style=`{paddingTop: '20px', paddingBottom: '400px'}`)
      .row.full-width.items-start.content-start.justify-center
        div(
          v-if="sphere"
          :style=`{maxWidth: '800px'}`).row.full-width.items-start.content-start
          div(
            v-if="viewId === 'items'"
            ).row.full-width
            div(
              v-for="(i,ii) in sphere.items"
              :style=`{
                height: '100px',
              }`
              ).row.q-mr-sm.q-mb-sm
              img(
                :src="i.thumbOid" draggable="false"
                :style=`{height: '100%', borderRadius: '10px', overflow: 'hidden'}`
                )
          //- span.text-white {{ sphere }}
          //- div(
            v-if="board && viewId === 'items'").row.full-width
            img(
              v-for="(i,ii) in 20" :key="ii"
              :src="board.thumbOid"
              :style=`{
                width: '200px',
                height: '200px',
                objectFit: 'cover',
                borderRadius: '10px', overflow: 'hidden',
              }`).q-mr-sm.q-mb-sm
          //- div(
            v-if="board && viewId === 'more'").row.full-width
            img(
              v-for="(i,ii) in 100" :key="ii"
              :src="board.thumbOid"
              :style=`{
                width: '100px',
                height: '100px',
                objectFit: 'cover',
                borderRadius: '10px', overflow: 'hidden',
              }`).q-mr-sm.q-mb-sm
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageApp_wsSphere',
  meta () {
    return {
      title: this.sphere ? this.sphere.name : ''
    }
  },
  data () {
    return {
      sphere: null,
      viewId: 'items',
      views: [
        {id: 'items', name: 'Items'},
        {id: 'more', name: 'More ideas'}
      ]
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
              rxCollectionEnum: RxCollectionEnum.WS_SPHERE,
              id: to
            }
          })
          this.sphere = item
        }
      }
    }
  },
  methods: {
    async sphereDelete () {
      this.$log('sphereDelete')
      // TODO what to do if we got items on this sphere ???
      await this.$rxdb.remove(this.sphere.id)
      this.$router.replace('/workspace/spheres')
    },
    outHandle ([type, val]) {
      this.$log('outHandle', type, val)
      if (type === 'back') {
        this.$router.back()
      }
    },
  },
  mounted () {
    this.$log('mounted')
    this.$store.commit('ui/stateSet', ['showMobileNavigation', false])
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.$store.commit('ui/stateSet', ['showMobileNavigation', true])
  }
}
</script>
