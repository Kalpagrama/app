<template lang="pug">
.row.full-width
  div(:style=`{marginBottom: '-2px'}`).row.full-width.q-px-sm
    q-tabs(
      v-model="viewId" no-caps
      dense active-color="green"
      ).text-grey-6
      q-tab(
        v-for="v in views" :key="v.id"
        :name="v.id" :label="v.name"
        )
  .row.full-width
    ws-search(
      @searchString="searchString = $event"
      @contentKalpa="contentKalpaFound")
    //- types
    .row.full-width.justify-center
      div(
        :style=`{
        }`
        ).row.full-width.items-start.content-start.scroll.q-pt-xs
        .row.items-center.content-center.no-wrap
          q-btn(
            @click="typeClick(type)"
            v-for="(type,ii) in types" :key="type.id"
            flat no-caps dense
            :color="typesSelected.includes(type.id) ? 'green' : 'grey-7'"
            :class=`{
              'b-40': typesSelected.includes(type.id)
            }`
            :style=`{}`).q-mr-xs.q-px-xs {{ type.name }}
  kalpa-loader(
    v-if="viewId === 'kalpa' ? searchString.length > 3 : true"
    :immediate="true"
    :query="viewId === 'workspace' ? queryWorkspace : queryKalpa" :limit="1000" v-slot=`{items,next,nexting}`)
    .row.full-width.items-start.content-start.q-py-sm
      item(
        v-for="(item,ii) in items" :key="ii"
        @click.native="$emit('item', item)"
        :item="item"
        :style=`{
        }`
        ).q-mb-sm
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'kalpaFinder',
  components: {
    item: () => import('./item.vue')
  },
  data () {
    return {
      viewId: 'workspace',
      views: [
        {id: 'workspace', name: 'Мастерская'},
        {id: 'kalpa', name: 'Кальпаграма'},
      ],
      searchString: '',
      typesSelected: [],
    }
  },
  computed: {
    types () {
      return [
        {id: 'VIDEO', name: 'Видео', types: ['VIDEO']},
        {id: 'IMAGE', name: 'Картинки', types: ['IMAGE']},
        {id: 'NODE', name: 'Ядра', types: ['NODE']},
        // {id: 'JOINT', name: 'Связи', types: ['JOINT']},
        {id: 'USER', name: 'Люди', types: ['USER']},
        {id: 'SPHERE', name: 'Сферы', types: ['WORD', 'SENTENCE']}
      ]
    },
    queryWorkspace () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_ANY,
          wsItemType: {$in: ['WS_NODE', 'WS_BOOKMARK']}
        },
        sort: [{updatedAt: 'desc'}]
      }
      // // add feeds filter
      // if (this.id !== 'all') {
      //   // res.selector.feeds = {$elemMatch: {$eq: this.feed.id}}
      //   res.selector.id = {$in: this.collection.bookmarks}
      // }
      // add types filter
      // if (this.typesSelected.length > 0) {
      //   res.selector.type = {$in: this.typesSelected}
      // }
      // add name filter
      if (this.searchString.length > 0) {
        let nameRegExp = new RegExp(this.searchString, 'i')
        res.selector.name = {$regex: nameRegExp}
      }
      return res
    },
    queryKalpa () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SEARCH,
          querySearch: this.searchString,
          objectTypeEnum: {$in: ['NODE', 'VIDEO', 'USER', 'WORD', 'SENTENCE']}
        },
        // populateObjects: true,
        limit: 100
      }
      // if (this.typesSelected.length === 0) {
      //   res.selector.objectTypeEnum = {$in: ['NODE', 'VIDEO', 'USER', 'WORD', 'SENTENCE']}
      // }
      // else {
      //   res.selector.objectTypeEnum = {$in: this.typesQuery}
      // }
      return res
    },
  },
  methods: {
    contentKalpaFound (contentKalpa) {
      this.$log('contentKalpaFound', contentKalpa)
    },
    typeClick (type) {
      this.$log('typeClick', type)
      if (this.typesSelected.findIndex(i => i === type.id) >= 0) {
        this.typesSelected = this.typesSelected.filter(i => i !== type.id)
      }
      else {
        this.typesSelected.push(type.id)
      }
    },
  },
}
</script>
