<style lang="sass" scoped>
.node-item
  cursor: pointer
  &:hover
    background: rgb(50,50,50) !important
</style>

<template lang="pug">
.row.full-width.items-start.content-start.justify-center
  div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px', minHeight: '100vh'}`).row.full-width.items-start.content-start
    //- items
    .row.full-width.q-pt-sm.q-pr-sm
      kalpa-loader(
        :immediate="true"
        :query="query" :limit="1000")
        template(v-slot=`{items,next}`)
          masonry(
            :cols="$q.screen.width < 800 ? 2 : 4"
            :gutter="{default: 10}").full-width
            div(
              v-for="(jointBookmark, ii) in items" :key="jointBookmark.id"
              :style=`{position: 'relative'}`
              ).row.full-width.q-mb-sm
              //- default
              div(
                @click="nodeBookmarkSelectedId = jointBookmark.id"
                :style=`{
                  position: 'relative', zIndex: 100,
                  borderRadius: '10px', overflow: 'hidden',
                }`
                ).row.full-width.q-px-md.q-pt-md.b-40
                small.text-white {{ jointBookmark }}
                //- div(
                  :style=`{
                    position: 'relative', zIndex: 100,
                    height: 0, paddingBottom: '100%',
                    borderRadius: '10px', overflow: 'hidden',
                  }`
                  ).full-width
                  div(:style=`{position: 'absolute', top: 0, left: 0, bottom: 0, right: 0,}`).row
                    img(
                      :src="jointBookmark.thumbUrl" draggable="false"
                      :style=`{
                        objectFit: 'cover',
                        borderRadius: '10px', overflow: 'hidden',
                      }`).fit
                .row.full-width.q-py-sm.q-px-md
                  small.text-white {{ jointBookmark.name }}
              //- tint
              slot(name="tint" :item="jointBookmark" :itemKey="jointBookmark.id")
              //- selected
              div(
                v-if="nodeBookmarkSelectedId === jointBookmark.id"
                :style=`{
                  position: 'relative',
                  marginTop: '-10px', paddingTop: '14px',
                  borderRadius: '0 0 10px 10px', overflow: 'hidden',
                }`
                ).row.full-width.items-center.content-center.bg-green.q-px-xs.q-pb-xs
                q-btn(round flat dense color="green-8" icon="delete_outline" @click="jointDelete(jointBookmark)")
                .col
                q-btn(round flat dense color="white" icon="launch" @click="jointLaunch(jointBookmark)")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'wsJoints_typeBookmarked',
  props: {
    searchString: {type: String},
  },
  data () {
    return {
      nodeBookmarkSelectedId: null,
    }
  },
  computed: {
    query () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK,
          deletedAt: {$exists: false},
          type: 'JOINT',
        },
        sort: [{updatedAt: 'desc'}]
      }
      // add name filter
      if (this.searchString.length > 0) {
        let nameRegExp = new RegExp(this.searchString, 'i')
        res.selector.name = {$regex: nameRegExp}
      }
      return res
    }
  },
  methods: {
    async jointDelete (jointBookmark) {
      this.$log('jointDelete', jointBookmark)
      // if (!confirm('Delete joint?')) return
      // TODO what to do if we got items on this sphere ???
      // await this.$rxdb.remove(jointBookmark.id)
      jointBookmark.deletedAt = Date.now()
    },
    async jointLaunch (jointBookmark) {
      this.$log('itemLaunch', jointBookmark)
      this.$router.push(`/joint/${jointBookmark.oid}`).catch(e => e)
    }
  }
}
</script>
