<template lang="pug">
.row.full-width.items-start.content-start.justify-center
  div(:style=`{maxWidth: $store.state.ui.pageWidth+'px', minHeight: '100vh'}`).row.full-width.justify-start
    kalpa-loader(
      :immediate="true"
      :query="query" :limit="12"
      v-slot=`{items,next,nexting}`)
      div(:style=`{maxWidth: 700+'px'}`).row.full-width
        router-link(
          v-for="(joint, ii) in items" :key="joint.oid"
          :to="'/joint/'+joint.oid"
          :style=`{
            position: 'relative',
            //- background: 'rgb(35,35,35)',
            borderRadius: '10px',
          }`
          ).row.full-width.q-mb-md.cursor-pointer
          q-btn(
            round flat color="grey-6" icon="more_vert"
            :style=`{
              position: 'absolute', zIndex: 100, top: 0, right: 0,
            }`)
          //- small.text-whtie {{joint}}
          div(
            v-for="(item, itemii) in [joint.leftItem, joint.rightItem]" :key="itemii"
            :style=`{
              order: 0+(itemii*2),
              borderRadius: '10px',
              background: 'rgb(37,37,37)',
            }`
            ).row.full-width
            img(
              :src="item.thumbUrl"
              :style=`{
                height: '60px',
                borderRadius: '10px',
              }`
              )
            .col.q-px-sm
              .row.fit.items-center.content-center
                span.text-white {{ item.name }}
          div(
            :style=`{order: 1}`
            ).row.full-width.q-px-md
            div(v-if="joint.jointType === 'ESSENCE'").row.full-width
              q-icon(name="link" flat dense color="grey-6" size="20px").q-ml-lg
              span.text-white.text-bold.q-ml-sm {{ joint.name }}
            div(v-else-if="joint.jointType === 'ASSOCIATIVE'").row.full-width
              q-icon(name="link" flat dense color="grey-6" size="20px").q-ml-lg
            div(v-else).row.full-width
              span.text-white.text-bold {{ joint.jointType }}
        //- loading spinner...
        div(:style=`{height: '50px'}`).row.full-width.justify-center
          q-spinner-dots(v-show="nexting" color="green" size="50px")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { ObjectApi } from 'src/api/object'

export default {
  name: 'wsJoints_typePublished',
  data () {
    return {
      jointSelected: null,
    }
  },
  computed: {
    sphereOid () {
      return this.$store.getters.currentUser().oid
    },
    query () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_ITEMS,
          objectTypeEnum: { $in: ['JOINT'] },
          oidAuthor: this.sphereOid,
          oidSphere: this.sphereOid,
          sortStrategy: 'AGE',
        },
        populateObjects: true,
      }
    },
  },
  methods: {
    async jointDelete (joint) {
      if (!confirm(this.$t('confirm_Really delete?', 'Удалить?'))) return
      this.$log('jointDelete', joint)
      await ObjectApi.unPublish(joint.oid)
      // await joint.remove()
    },
    jointEdit (joint) {
      this.$log('jointEdit')
    },
    jointLaunch (joint) {
      this.$log('jointLaunch')
      this.$router.push('/joint/' + joint.oid).catch(e => e)
    }
  }
}
</script>
