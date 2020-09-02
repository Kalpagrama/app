<template lang="pug">
//- @click="bookmarked ? bookmarkDelete() : bookmarkCreate()"
q-btn(
  round flat
  color="white"
  :icon="bookmarked ? 'bookmark' : 'bookmark_outline'"
  :loading="loading"
  :style=`{
    position: 'absolute', zIndex: 1000, transform: 'translate3d(0,0,0)',
    top: '8px', right: '8px',
    background: 'rgba(0,0,0,0.15)',
  }`)
  q-menu(
    ref="sphereSelectorMenu"
    dark cover anchor="top right")
    div(
      :style=`{
        width: '300px', height: '300px',
        borderRadius: '10px', overflow: 'hidden',
      }`).column.items-start.content-start.b-50
      .row.full-width
        div(
          :style=`{
            position: 'relative', zIndex: 100,
            borderRadius: '10px', overflow: 'hidden'
          }`).row.full-width
          q-input(
            v-model="searchString"
            placeholder="Find sphere"
            filled dark dense color="grey-7"
            :input-style=`{paddingLeft: '15px',}`).full-width.b-50
      .col.full-width.scroll
        kalpa-loader(:mangoQuery="spheresQuery" :sliseSize="1000")
          template(v-slot=`{items}`)
            .row.full-width.items-start.content-start.q-pt-sm
              div(
                v-for="(s,si) in items" :key="s.id"
                @click="sphereClick(s,si)"
                ).row.full-width.items-center.content-center
                q-btn(
                  flat icon="blur_on" align="start" no-caps
                  ).full-width.q-pl-sm
                  span.q-ml-sm {{s.name}}
      .row.full-width.q-pa-sm
        q-btn(
          @click="sphereCreate()"
          flat color="green" icon="add" no-caps align="left").full-width Create sphere
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'nodeLite__nodeBookmark',
  props: ['node', 'isActive'],
  data () {
    return {
      loading: false,
      bookmarked: false,
      searchString: '',
    }
  },
  computed: {
    spheresQuery () {
      let res = {selector: {rxCollectionEnum: RxCollectionEnum.WS_SPHERE}}
      if (this.searchString.length > 0) {
        let nameRegExp = new RegExp(this.searchString, 'i')
        res.selector.name = {$regex: nameRegExp}
      }
      // selector: props, import selector from props...
      return res
    }
  },
  watch: {
    isActive: {
      immediate: true,
      async handler (to, from) {
        // this.$log('isActive TO', to)
        if (to) {
          let bookmark = await this.bookmarkFind()
          if (bookmark) {
            this.bookmarked = true
          }
        }
      }
    }
  },
  methods: {
    sphereClick (s, si) {
      this.$log('sphereClick', s, si)
      s.items.push({
        oid: this.node.oid,
        thumbOid: this.node.meta.items[0].thumbUrl,
        type: 'NODE',
        name: this.node.name
      })
      this.$refs.sphereSelectorMenu.hide()
    },
    async sphereCreate () {
      this.$log('sphereCreate')
      let name = prompt('Sphere name?')
      if (name.length > 0) {
        let sphereInput = {
          wsItemType: 'WS_SPHERE',
          name: name,
          items: [
            {
              oid: this.node.oid,
              thumbOid: this.node.meta.items[0].thumbUrl,
              type: 'NODE',
              name: this.node.name
            }
          ]
        }
        let sphere = await this.$rxdb.set(RxCollectionEnum.WS_SPHERE, sphereInput)
        this.searchString = ''
        this.$refs.sphereSelectorMenu.hide()
      }
    },
    async bookmarkFind () {
      // this.$log('bookmarkFind')
      let {items: [item]} = await this.$rxdb.find({
      selector: {
        rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK, oid: this.node.oid, type: 'NODE'
      }
      })
      // this.$log('bookmarkFind item', item)
      return item
    },
    async bookmarkDelete () {
      try {
        // this.$log('bookmarkDelete')
        this.loading = true
        await this.$wait(300)
        let bookmark = await this.bookmarkFind()
        if (bookmark) {
          await this.$rxdb.remove(bookmark.id)
          this.$q.notify({type: 'positive', position: 'top', message: 'Bookmark deleted!'})
          this.bookmarked = false
          this.loading = false
        }
        else {
          throw new Error('No such bookmark!')
        }
      }
      catch (e) {
        this.$log('bookmarkDelete error', e)
        this.loading = false
      }
    },
    async bookmarkCreate () {
      try {
        // this.$log('bookmarkCreate start')
        this.loading = true
        await this.$wait(300)
        let bookmarkInput = {
          oid: this.node.oid,
          type: 'NODE',
          name: this.node.name,
          thumbOid: this.node.meta.items[0].thumbUrl,
          wsItemType: 'WS_BOOKMARK'
        }
        let bookmark = await this.$rxdb.set(RxCollectionEnum.WS_BOOKMARK, bookmarkInput)
        // this.$log('bookmarkCreate bookmark', bookmark)
        this.$q.notify({type: 'positive', position: 'top', message: 'Bookmark added!'})
        this.loading = false
        this.bookmarked = true
      }
      catch (e) {
        this.$log('bookmarkCreate error', e)
        this.loading = false
        this.$q.notify({type: 'negative', position: 'top', message: e.message || e.toString()})
      }
    },
  },
}
</script>
