<style lang="sass">
.q-field--outlined .q-field__control
  border-radius: 10px !important
</style>

<template lang="pug">
q-layout(
  view="hHh Lpr lff"
  container
  :style=`{
  }`
  ).b-30
  q-header.b-30
    .row.full-width.justify-center
      //- header
      div(:style=`{height: '60px',}`).row.full-width.items-center.content-center.q-px-sm
        .col.q-px-sm
          span(:style=`{fontSize: '18px'}`).text-white.text-bold Добавить элемент
        q-btn(round flat color="white" icon="clear" @click="$emit('close')")
      //- views
      .row.full-width.q-px-sm.q-pb-xs
        q-btn(
          @click="viewId = v"
          v-for="v in views" :key="v"
          flat no-caps
          :class="{'b-40': viewId === v}"
          :color="viewId === v ? 'green' : 'grey-7'") {{ v }}
      //- search
      div(
        v-if="viewId === 'world'"
        ).row.full-width.q-px-sm
        q-input(
          v-model="searchString"
          outlined dark color="green"
          placeholder="Search"
          ).full-width
  q-page-container
    q-page(
      v-if="viewId === 'article'"
      ).row.full-width.items-start.content-start.q-px-sm
      div(
        v-for="(item,ii) in node.items" :key="item.id"
        :style=`{
          background: 'rgb(35,35,35)',
          borderRadius: '10px',
        }`
        ).row.full-width.q-pa-sm.q-mb-sm
        div(v-if="item.type === 'TEXT'").row.full-width
          //- span(v-html="item.item.text").text-white
          span.text-white {{item.item.text}}
        div(v-else).row.full-width
          small.text-white {{item}}
    from-workspace(
      v-if="viewId === 'workspace'"
      id="all" :useViews="false")
      template(
        v-slot:tint=`{item}`)
        div(
          @click="$emit('item', item)"
          :style=`{
            position: 'absolute', zIndex: 100,
            borderRadius: '10px',
          }`
          ).row.fit.cursor-pointer
    q-page(
      v-if="viewId === 'world'").row.full-width.items-start.content-start
      kalpa-loader(
        v-if="searchString.length >= 3"
        :immediate="true" :query="queryWorld" :limit="100" v-slot=`{items,next,nexting}`)
        .row.full-width.items-start.content-start.q-pa-sm
          div(
            @click="$emit('item', item)"
            v-for="(item,ii) in items" :key="ii"
            ).row.full-width.q-mb-sm
            div(
              v-if="item.type === 'NODE'"
              :style=`{
                background: 'rgb(35,35,35)',
                borderRadius: '10px',
              }`
              ).row.full-width.items-center.content-center.q-pa-sm
              q-icon(name="filter_tilt_shift" color="white" size="30px").q-mr-sm
              span.text-white {{ item.name }}
            div(
              v-else-if="item.type === 'JOINT'"
              ).row.full-width
            div(
              v-else-if="['WORD', 'SENTENCE'].includes(item.type)"
              :style=`{
                background: 'rgb(35,35,35)',
                borderRadius: '10px',
              }`
              ).row.full-width.items-center.content-center.q-pa-sm
              q-icon(name="blur_on" color="white" size="30px").q-mr-sm
              span.text-white {{ item.name }}
            div(
              v-else
              ).row.full-width.bg-blue
              small.text-white {{item}}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'nodeFinder',
  props: [
    'node'
  ],
  components: {
    fromWorkspace: () => import('pages/app/ws_collection/view_items.vue'),
  },
  data () {
    return {
      viewId: 'workspace',
      views: ['article', 'workspace', 'world'],
      searchString: '',
    }
  },
  methods: {
    itemClick (item) {
      this.$log('itemClick', item)
    }
  },
  computed: {
    queryWorkspace () {
      return null
    },
    queryWorld () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SEARCH,
          querySearch: this.searchString,
          objectTypeEnum: {$in: ['NODE', 'VIDEO', 'IMAGE', 'USER', 'WORD', 'SENTENCE']}
        },
        // populateObjects: true,
        limit: 100
      }
      // if (this.typesSelected.length === 0) {
      //   res.selector.objectTypeEnum = {$in: ['NODE', 'VIDEO', 'IMAGE', 'USER', 'WORD', 'SENTENCE']}
      // }
      // else {
      //   res.selector.objectTypeEnum = {$in: this.typesQuery}
      // }
      return res
    },
  },
}
</script>
