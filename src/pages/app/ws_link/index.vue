<template lang="pug">
.row.full-width
  //- header
  .row.full-width.justify-center.q-pt-sm.q-mb-sm
    div(
      :style=`{
        height: '60px',
        maxWidth: $store.state.ui.pageMaxWidth+'px',
        borderRadius: '10px',overflow: 'hidden'
      }`
      ).row.full-width.items-center.content-center.q-px-sm.b-40
      q-btn(round flat dense color="grey-6" icon="keyboard_arrow_left" @click="$router.back()").q-mr-sm
      span(:style=`{fontSize: '1rem'}`).text-white.text-bold Link creator
  //- link-item(v-if="link && link.items[0]" :item="link.items[0]" :link="link")
  //- items wrapper
  .row.full-width
    .col-6
      link-item(v-if="link && link.items[0]" :item="link.items[0]" :link="link")
    .col-6
      link-item(v-if="link && link.items[1]" :item="link.items[1]" :link="link")
  //- connection
  .row.full-width.justify-center
    q-icon(name="link" color="green" size="md")
  .row.full-width.justify-center
    div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width
      q-btn(flat no-caps dark @click="itemDelete(0)") Delete one
      q-btn(flat no-caps dark @click="itemDelete(1)") Delete two
  //- right item
  //- link-item(v-if="link && link.items[1]" :item="link.items[1]" :link="link")
  view-add(v-if="link && !link.items[1]" :link="link" @item="itemFound($event, 1)")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageApp_wsLink',
  components: {
    linkItem: () => import('./link_item.vue'),
    viewAdd: () => import('./view_add/index.vue')
  },
  data () {
    return {
      link: null,
      linkNew: {
        name: '',
        items: [],
        wsItemType: 'WS_JOINT',
      }
    }
  },
  watch: {
    '$route.params.id': {
      immediate: true,
      async handler (to, from) {
        this.$log('id TO', to)
        if (to) {
          if (to === 'new') {
            this.$q.notify({type: 'positive', position: 'top', message: 'Creating new link'})
            this.link = JSON.parse(JSON.stringify(this.linkNew))
            // get first item
            if (this.$route.query.oid) {
              let itemInput = await this.$rxdb.get(RxCollectionEnum.OBJ, this.$route.query.oid)
              this.$set(this.link.items, 0, itemInput)
            }
            var unwatch = this.$watch(
              'link',
              async (_from, _to) => {
                this.$log('link TO', to)
                // create node...
                if (unwatch) unwatch()
                let linkInput = JSON.parse(JSON.stringify(this.link))
                let link = await this.$rxdb.set(RxCollectionEnum.WS_JOINT, linkInput)
                this.$router.replace(`/workspace/link/${link.id}`)
              },
              {
                deep: true,
              }
            )
          }
          else {
            let {items: [item]} = await this.$rxdb.find({
              selector: {
                rxCollectionEnum: RxCollectionEnum.WS_JOINT,
                id: to
              }
            })
            this.$log('FOUND link', item)
            this.link = item
          }
        }
      }
    },
  },
  methods: {
    itemFound (item, index) {
      this.$log('itemFound', item, index)
      // this.$set(this.link.items, index, item)
      // this.items
    },
    itemDelete (index) {
      this.$log('itemDelete', index)
      this.$delete(this.link.items, index)
    }
  },
  mounted () {
    this.$log('mounted')
    this.$store.commit('ui/stateSet', ['showMobileNavigation', false])
    this.$store.commit('ui/stateSet', ['showDesktopNavigation', false])
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.$store.commit('ui/stateSet', ['showMobileNavigation', true])
    this.$store.commit('ui/stateSet', ['showDesktopNavigation', true])
  }
}
</script>
