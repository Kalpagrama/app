<template lang="pug">
kalpa-loader(
  :immediate="true"
  :query="query" :limit="1000"
  v-slot=`{items,next}`)
  masonry(
    :cols="$q.screen.width < 800 ? 1 : 3"
    :gutter="{default: 6}").full-width.q-pr-sm
    div(
      v-for="(link, li) in items" :key="link.oid"
      :style=`{
        position: 'relative',
        borderRadius: '10px', overflow: 'hidden',
      }`
      ).row.full-width.q-mb-md.b-40.cursor-pointer.link-item
      //- default
      div(
        @click="linkSelected === link.oid ? linkSelected = null : linkSelected = link.oid"
        :style=`{
          position: 'relative', zIndex: 10,
          borderRadius: '10px', overflow: 'hidden'
        }`
        ).row.full-width.link-item.b-40
        //- items wrapper
        .row.full-width.items-end.content-end
          div(v-for="(i,ii) in [link.leftItem, link.rightItem]" :key="ii").col-6
            .row.full-width.items-end.content-end.justify-center.q-pa-xs
              img(
                draggable="false"
                :src="i.thumbUrl"
                :style=`{
                  transform: ii === 0 ? 'perspective(600px) rotateY(10deg)' : 'perspective(600px) rotateY(-10deg)',
                  borderRadius: '10px', overflow: 'hidden'
                }`).full-width
        //- name
        .row.full-width.justify-center.q-pa-sm
          span.text-bold.text-white {{ link.name }}
      slot(name="tint" :item="link" :itemKey="link.oid")
      //- selected
      div(
        v-if="link.oid === linkSelected"
        :style=`{
          position: 'relative',
          marginTop: '-10px', paddingTop: '14px',
          borderRadius: '0 0 10px 10px', overflow: 'hidden',
        }`
        ).row.full-width.bg-green.q-px-xs.q-pb-xs
        q-btn(round flat dense color="green-8" icon="delete_outline" @click="linkDelete(link,li)")
        .col
        q-btn(round flat dense color="white" icon="edit" @click="linkEdit(link,li)")
        q-btn(round flat dense color="white" icon="launch" @click="linkLaunch(link)")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { ObjectsApi } from 'src/api/objects'

export default {
  name: 'wsLinks_typePublished',
  data () {
    return {
      linkSelected: null,
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
          // oidAuthor: {$ne: this.sphereOid},
          oidSphere: this.sphereOid,
          sortStrategy: 'AGE',
        },
        populateObjects: true,
      }
    },
  },
  methods: {
    async linkDelete (link) {
      if (!confirm(this.$t('confirm_Really delete?', 'Удалить?'))) return
      this.$log('linkDelete')
      await ObjectsApi.unPublish(link.oid)
    },
    linkEdit (link) {
      this.$log('linkEdit')
    },
    linkLaunch (link) {
      this.$log('linkLaunch')
      this.$router.push('/link/' + link.oid).catch(e => e)
    }
  }
}
</script>
