<template lang="pug">
q-layout(
  view="hHh Lpr lff"
  container)
  q-header.b-30
    .row.full-width.justify-center.q-px-sm
      slot(name="header")
      //- views
      div(
        v-if="viewsShow"
        :style=`{marginBottom: '-2px'}`).row.full-width.q-px-sm
        q-tabs(
          v-model="viewId" no-caps
          dense active-color="green"
          ).text-grey-6
          q-tab(
            v-for="v in views" :key="v.id"
            :name="v.id" :label="v.name"
            )
      //- search
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
  q-page-container
    q-page
      kalpa-loader(
        v-if="viewId === 'kalpa' ? searchString.length > 3 : true"
        :immediate="true"
        :query="viewId === 'workspace' ? queryWorkspace : queryKalpa" :limit="1000" v-slot=`{items,next,nexting}`)
        .row.full-width.items-start.content-start.q-pa-sm
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
import { UserApi } from 'src/api/user'

export default {
  name: 'kalpaFinder',
  props: {
    viewId_: {type: String, default: 'workspace'},
    viewsShow: {type: Boolean, default: true},
    workspaceFilter: {type: Array},
    typesFilter: {type: Array},
  },
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
        {id: 'JOINT', name: 'Связи', types: ['JOINT']},
        {id: 'USER', name: 'Люди', types: ['USER']},
        {id: 'SPHERE', name: 'Сферы', types: ['WORD', 'SENTENCE']}
      ].filter(i => {
        if (this.typesFilter) return this.typesFilter.includes(i.id)
        else return true
      })
    },
    typesSelectedFlat () {
      if (this.typesSelected.length === 0) {
        return this.types.reduce((acc, val) => {
          val.types.map(t => {
            acc.push(t)
          })
          return acc
        }, [])
      }
      else {
        return this.types
          .filter(t => {
            return this.typesSelected.includes(t.id)
          })
          .reduce((acc, val) => {
            val.types.map(t => {
              acc.push(t)
            })
            return acc
          }, [])
      }
    },
    queryWorkspace () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_ANY,
          wsItemType: {$in: this.workspaceFilter || ['WS_BOOKMARK', 'WS_NODE', 'WS_JOINT', 'WS_COLLECTION']},
        },
        sort: [{updatedAt: 'desc'}]
      }
      // add types filter
      if (this.typesSelected.length > 0) {
        res.selector.type = {$in: this.typesSelected}
      }
      else {
        res.selector.type = {
          $in: this.types.reduce((acc, val) => {
            acc.push(val.id)
            return acc
          }, [])
        }
      }
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
        },
        // populateObjects: true,
        limit: 100
      }
      res.selector.objectTypeEnum = {$in: this.typesSelectedFlat}
      return res
    },
  },
  methods: {
    async contentKalpaFound (contentKalpa) {
      this.$log('contentKalpaFound', contentKalpa)
      this.$router.replace('/content/' + contentKalpa.oid)
      let [bookmark] = await this.$rxdb.find({selector: {rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK, oid: contentKalpa.oid}})
      if (bookmark) {
        await bookmark.restoreFromTrash() // на тот случай если он сейчас в корзине
      } else {
        let bookmarkInput = {
          type: contentKalpa.type,
          oid: contentKalpa.oid,
          name: contentKalpa.name,
          thumbUrl: contentKalpa.thumbUrl
        }
        bookmark = await this.$rxdb.set(RxCollectionEnum.WS_BOOKMARK, bookmarkInput)
      }
      // bookmark subscribe
      if (!await UserApi.isSubscribed(contentKalpa.oid)) await UserApi.subscribe(contentKalpa.oid)
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
