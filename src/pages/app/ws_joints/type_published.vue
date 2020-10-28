<template lang="pug">
kalpa-loader(
  :immediate="true"
  :query="query" :limit="1000"
  v-slot=`{items,next}`)
  masonry(
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
