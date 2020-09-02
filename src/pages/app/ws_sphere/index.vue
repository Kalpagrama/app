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
              div(:style=`{overflowX: 'auto'}`).col.full-height
                div(
                  v-if="sphere && !sphereNameEditing"
                  @click="sphereNameEditing = true").row.fit.cursor-pointer
                  span(
                    :style=`{fontSize: '18px', whiteSpace: 'nowrap', marginLeft: '12px',}`
                    ).fit.text-white.text-bold {{ sphere.name }}
                div(
                  v-if="sphere && sphereNameEditing"
                  :style=`{
                    position: 'relative', zIndex: 100, borderRadius: '10px', overflow: 'hidden',
                  }`
                  ).row.full-width
                  q-input(
                    v-model="sphere.name"
                    filled dark dense color="grey-6" autofocus
                    :input-style=`{
                      fontSize: '18px',
                      fontWeight: 'bold',
                    }`
                    @blur="sphereNameEditing = false"
                    @keydown.enter="sphereNameEditing = false"
                    ).full-width
              q-btn(round flat color="red" icon="delete_outline" @click="sphereDelete()")
            div(:style=`{paddingLeft: '14px',}`).row.full-width.justify-start
              q-tabs(
                :value="$route.name" @input="$router.replace({name: $event})"
                no-caps dense active-color="white" switch-indicator).text-grey-8
                q-tab(v-for="v in views" :key="v.id" :name="v.id" :label="v.name")
  q-page-container
    router-view(v-if="sphere" :sphere="sphere")
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
      sphereNameEditing: false,
      viewId: 'items',
      views: [
        {id: 'workspace.sphere.items', name: 'Items'},
        {id: 'workspace.sphere.explore', name: 'Explore'}
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
      if (!confirm('Delete sphere?')) return
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
    // this.$store.commit('ui/stateSet', ['showMobileNavigation', false])
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    // this.$store.commit('ui/stateSet', ['showMobileNavigation', true])
  }
}
</script>
