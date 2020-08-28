<style lang="sass" scoped>
.item
  &:hover
    background: rgb(60,60,60)
</style>

<template lang="pug">
kalpa-loader(:mangoQuery="query" :sliceSize="1000")
  template(v-slot=`{items, itemsMore}`)
    .row.full-width.items-start.content-start.justify-center.q-px-sm
      div(
        v-for="(n,ni) in items" :key="n.oid"
        :style=`{
          borderRadius: '10px', overflow: 'hidden',
        }`
        ).row.full-width.q-mb-sm
        //- default header
        div(
          @click="openedOid = n.oid"
          :style=`{
            position: 'relative', zIndex: 100, transform: 'translate3d(0,0,0)',
            height: '60px',
            borderRadius: '10px', overflow: 'hidden'
          }`
          ).row.full-width.items-center.content-center.b-50.cursor-pointer.item
          img(
            :src="n.meta.items[0].thumbUrl" draggable="false"
            :style=`{height: '60px', borderRadius: '10px', overflow: 'hidden'}`
            )
          .col.full-height
            .row.fit.items-center.content-center.q-pa-md
              span(:style=`{userSelect: 'none'}`).text-white {{ n.name }}
        //- opened
        transition(appear enter-active-class="animated slideInDown")
          div(
            v-if="openedOid === n.oid"
            :style=`{
              marginTop: '-10px', paddingTop: '18px',
              borderRadius: '0 0 10px 10px',
            }`
            ).row.full-width.bg-green.q-px-sm.q-pb-sm
            q-btn(flat color="red-2" no-caps @click="nodeUnpublish(n.oid)") Снять с публикации
            .col
            q-btn(flat color="white" no-caps @click="$router.push('/node/'+n.oid)") Перейти
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'wsNodes_nodesPublished',
  props: ['searchString'],
  data () {
    return {
      openedOid: null,
    }
  },
  computed: {
    sphereOid () {
      return this.$store.getters.currentUser().oid
    },
    query () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_NODES,
          oidSphere: this.sphereOid,
          oidAuthor: {$eq: this.sphereOid},
          sortStrategy: 'AGE',
        }
      }
      // name
      if (this.searchString.length > 0) {
        let nameRegExp = new RegExp(this.searchString, 'i')
        res.selector.name = {$regex: nameRegExp}
      }
      return res
    }
  },
  methods: {
    async nodeUnPublish (oid) {
      this.$log('nodeUnPublish start', oid)
      // if (!confirm(this.$t('Unpublish node?', 'Снять с публикации?'))) return
      // await node.updateExtended('stage', 'draft', false)// без debounce
      // await node.updateExtended('oid', node.oid, false)// без debounce
      // await NodeApi.nodeDelete(node.oid)
      // this.$log('nodeUnPublish complete')
    },
  }
}
</script>
