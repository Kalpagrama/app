<template lang="pug">
.row.full-width.items-start.content-start.justify-center
  div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px', minHeight: '100vh'}`).row.full-width.justify-start
    kalpa-loader(
      :immediate="true"
      :query="query" :limit="1000"
      v-slot=`{items,next,nexting}`)
      div(:style=`{maxWidth: 700+'px'}`).row.full-width
        router-link(
          v-for="(joint, ii) in items" :key="joint.oid"
          :to="'/joint/'+joint.oid"
          :style=`{
            position: 'relative',
            background: 'rgb(35,35,35)',
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
            ).row.full-width.q-pa-md
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
      //- masonry(
        :cols="$q.screen.width < 800 ? 1 : 2"
        :gutter="{default: 6}").full-width.q-pr-sm
        div(
          v-for="(joint, li) in items" :key="joint.oid"
          :style=`{
            position: 'relative',
            borderRadius: '10px', overflow: 'hidden',
          }`
          ).row.full-width.q-mb-md.b-40.cursor-pointer.joint-item
          //- default
          div(
            @click="jointSelected === joint.oid ? jointSelected = null : jointSelected = joint.oid"
            :style=`{
              position: 'relative', zIndex: 10,
              borderRadius: '10px', overflow: 'hidden'
            }`
            ).row.full-width.joint-item.b-40
            joint-feed(
              :joint="joint" :isActive="false" :isVisible="false"
              :showHeader="false" :showFooter="false" :mini="true")
          slot(name="tint" :item="joint" :itemKey="joint.oid")
          //- selected
          div(
            v-if="joint.oid === jointSelected"
            :style=`{
              position: 'relative',
              marginTop: '-10px', paddingTop: '14px',
              borderRadius: '0 0 10px 10px', overflow: 'hidden',
            }`
            ).row.full-width.bg-green.q-px-xs.q-pb-xs
            q-btn(round flat dense color="green-8" icon="delete_outline" @click="jointDelete(joint)")
            .col
            q-btn(round flat dense color="white" icon="edit" @click="jointEdit(joint)")
            q-btn(round flat dense color="white" icon="launch" @click="jointLaunch(joint)")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { ObjectsApi } from 'src/api/objects'

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
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_JOINTS,
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
      await ObjectsApi.unPublish(joint.oid)
      // joint.deletedAt = Date.now()
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
