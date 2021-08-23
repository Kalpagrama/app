<template lang="pug">
.row.full-width.justify-center.q-pa-sm
  //- small.text-white {{ query }}
  list-feed(
    :query="query"
    nextSize=24
    :itemMiddlePersist="false"
    screenSize=100
    :itemStyles=`{
      paddingBottom: '8px',
    }`
    :style=`{
      maxWidth: $store.state.ui.pageWidth+'px',
    }`)
    template(v-slot:item=`{item,itemIndex,isActive,isVisible}`)
      router-link(
        :to="itemLink(item)"
        :style=`{
          background: 'rgb(35,35,35)',
          borderRadius: '10px',
        }`
        ).row.full-width.items-start.content-start
        img(
          v-if="!['WORD', 'SENTENCE', 'SPHERE'].includes(item.type)"
          draggable="false"
          :src="item.thumbUrl"
          :style=`{
            height: '50px',
            minWidth: '89px',
            borderRadius: '10px',
            objectFit: 'contain',
          }`).b-50
        div(
          v-else
          :style=`{width: '50px', height: '50px',}`
          ).row.items-center.content-center.justify-center
          q-icon(name="blur_on" size="30px" color="white")
        .col.full-height
          .row.fit.items-between.content-between.q-pa-sm
            .row.full-width
              span.text-white {{ item.name }}
            .row.full-width
              small.text-grey-8 {{ item.type }}
      //- .row.full-width
        .row.full-width {{ item.oid }}
        small.text-white {{ item.type }}
        //- router-link(
          :to="itemLink(item)"
          :style=`{
            background: 'rgb(35,35,35)',
            borderRadius: '10px',
          }`
          ).row.full-width
          img(
            v-if="!['WORD', 'SENTENCE', 'SPHERE'].includes(item.type)"
            draggable="false"
            :src="item.thumbUrl"
            :style=`{
              height: '50px',
              minWidth: '89px',
              borderRadius: '10px',
              objectFit: 'contain',
            }`).b-50.q-mr-sm
          div(
            v-else
            :style=`{width: '50px', height: '50px',}`
            ).row.items-center.content-center.justify-center
            q-icon(name="blur_on" size="30px" color="white")
          .col
            div(:style=`{minHeight: '50px',}`).row.full-width.items-center.content-center
              span.text-white {{ item.name }}
              .row.full-width
                small.text-grey-8 {{ itemMetaMap[item.type].name }}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'trends_pageSearch',
  props: ['searchString'],
  components: {
    kalpaFinder: () => import('src/components/kalpa_finder/index.vue'),
  },
  data () {
    return {
      tabId: 'content'
    }
  },
  computed: {
    query () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SEARCH,
          objectTypeEnum: {$in: ['VIDEO', 'IMAGE', 'BOOK', 'NODE', 'BLOCK', 'USER']},
          querySearch: this.searchString,
        },
        populateObjects: false,
        limit: 100
      }
      // if (this.tab) {
      //   res.selector.objectTypeEnum = {$in: this.tab.types}
      // }
      return res
    },
    itemMetaMap () {
      return {
        VIDEO: {
          name: this.$t('Video'),
          link: '/content/'
        },
        IMAGE: {
          name: this.$t('Image'),
          link: '/content/'
        },
        BOOK: {
          name: this.$t('Book'),
          link: '/content/'
        },
        NODE: {
          name: this.$t('Node'),
          link: '/node/'
        },
        JOINT: {
          name: this.$t('Joint'),
          link: '/joint/'
        },
        BLOCK: {
          name: this.$t('Essence block'),
          link: '/block/'
        },
        WORD: {
          name: this.$t('Sphere'),
          link: '/sphere/'
        },
        SENTENCE: {
          name: this.$t('Sphere'),
          link: '/sphere/'
        },
        SPHERE: {
          name: this.$t('Sphere'),
          link: '/sphere/'
        },
        USER: {
          name: this.$t('User'),
          link: '/user/'
        }
      }
    }
  },
  methods: {
    itemLink (item) {
      // this.$log('itemLink', item)
      if (item.wsItemType) {
        // confirm('Open in workspace?')
        return '/trends'
      }
      else {
        return this.itemMetaMap[item.type].link + item.oid
      }
    },
  }
}
</script>
