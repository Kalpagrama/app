<template lang="pug">
  .row.full-width.items-start.content-start.justify-center
    div(v-if="user" :style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
      tab-list-feed(
        :scrollAreaHeight="(scrollAreaHeight || $q.screen.height)"
        :navHeaderText="useNavHeader ? $t('Followers') : ''"
        :searchInputState="'enabled'"
        :searchString="searchString"
        :query="query"
        :itemHeightApprox="100"
        :itemActivePersist="false"
        @searchString="searchString = $event"
      ).row.full-width
        template(v-slot:externalHeader)
          .full-width
            span.text-grey {{$t('Followers')}}
        template(v-slot:item=`{item,itemState,itemIndex,isActive,isVisible,isPreload, scrolling}`)
          div(
            v-if="item.type === 'USER'"
            @click="$router.push('/user/'+item.oid)"
            :style=`{
              background: 'rgb(35,35,35)',
              borderRadius: '10px',
            }`
          ).row.fit.items-center.content-center.q-pa-sm
            img(
              draggable="false"
              :src="item.thumbUrl"
              :style=`{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
              }`).q-mr-sm
            span.text-white {{ item.name }}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
export default {
  name: 'listFollowers',
  props: {
    user: { type: Object, required: true },
    scrollAreaHeight: { type: Number },
    useNavHeader: {type: Boolean, default: true},
    searchInputState: {type: String},
    mode: {type: String},
  },
  data () {
    return {
      pageId: null,
      bookmarkSelected: null,
      bookmarkEditorShow: false,
      searchString: '',
    }
  },
  computed: {
    pages () {
      return []
    },
    query () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SUBSCRIBERS,
          oidSphere: this.user.oid,
          objectTypeEnum: {$in: ['USER']}
        },
        populateObjects: false,
      }
    }
  },
  methods: {
    bookmarkSelectHandle (bookmark) {
      this.$log('bookmarkSelectHandle', bookmark)
      if (this.mode === 'select') {
        this.$emit('item', bookmark)
      }
      else {
        this.bookmarkSelected = bookmark
        this.bookmarkEditorShow = true
      }
    }
  }
}
</script>
