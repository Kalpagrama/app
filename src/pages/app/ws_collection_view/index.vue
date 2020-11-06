<template lang="pug">
q-layout(
  view="hHh Lpr lff"
  ).b-30
  q-header(reveal).row.full-width.justify-center.q-pt-sm.q-px-sm.b-30
    .row.full-width.justify-center
      div(
        v-if="collection && view"
        :style=`{
          minHeight: '60px',
          maxWidth: $store.state.ui.pageWidth+'px',
          borderRadius: '10px',
        }`).row.full-width.items-center.content-center.q-px-sm.b-30
        q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.back()")
        .col
          .row.fit.items-center.content-center
            q-input(
              v-model="view.name"
              placeholder="Enter feed name"
              borderless dark color="green"
              :autofocus="collection.name.length === 0"
              :input-style=`{
                fontSize: '18px',
                fontWeight: 'bold',
              }`
              :label="`${collection.name} collection view`"
              :style=`{}`).full-width
        q-btn(round flat color="white" icon="view_week" @click="$router.push('/feeds/'+collection.id)")
    //- views
    //- .row.full-width.justify-center
      div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width.q-px-sm
        q-tabs(
          v-model="viewId"
          no-caps align="left" active-color="green" dense
          ).full-width.text-grey-7
          q-tab(
            v-for="(view, ii) in views" :key="view.id"
            :name="view.id" :label="view.name")
  q-page-container
    //- component(
      v-if="collection"
      :is="`view-${viewId}`" :collection="collection")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'wsCollectionView',
  data () {
    return {
      collection: null,
      view: null,
    }
  },
  watch: {
    '$route.params.id': {
      immediate: true,
      async handler (to, from) {
        this.$log('id TO', to)
        if (to) {
          let collection = await this.$rxdb.get(RxCollectionEnum.WS_COLLECTION, to)
          if (collection) {
            this.collection = collection
            let view = this.collection.items.find(i => i.id === this.$route.params.viewid)
            if (view) {
              this.view = view
            }
            else this.$router.replace('/workspace/collections')
          }
          else this.$router.replace('/workspace/collections')
        }
      }
    },
  },
}
</script>
