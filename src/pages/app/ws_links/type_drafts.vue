<style lang="stylus" scoped>
.link-item
  &:hover
    background: rgb(50,50,50)
</style>

<template lang="pug">
kalpa-loader(
  :immediate="true"
  :query="query" :limit="1000"
  v-slot=`{items,next}`)
  masonry(
    :cols="$q.screen.width < 800 ? 1 : 3"
    :gutter="{default: 6}").full-width.q-pr-sm
    div(
      v-for="(link, li) in items" :key="link.id"
      :style=`{
        position: 'relative',
        borderRadius: '10px', overflow: 'hidden',
      }`
      ).row.full-width.q-mb-md.b-40.cursor-pointer.link-item
      //- default
      div(
        @click="linkSelectedId === link.id ? linkSelectedId = null : linkSelectedId = link.id"
        :style=`{
          position: 'relative', zIndex: 10,
          borderRadius: '10px', overflow: 'hidden'
        }`
        ).row.full-width.link-item.b-40
        //- items wrapper
        .row.full-width
          div(v-for="(i,ii) in link.items" :key="ii").col-6
            .row.full-width.justify-center.q-pa-xs
              img(
                v-if="i.item.thumbUrl"
                draggable="false"
                :src="i.item.thumbUrl"
                :style=`{
                  transform: ii === 0 ? 'perspective(600px) rotateY(10deg)' : 'perspective(600px) rotateY(-10deg)',
                  borderRadius: '10px', overflow: 'hidden'
                }`).full-width
              .row.full-width.justify-center.q-pa-xs
                //- small.text-white {{ i.item.name.slice(0, 40) }}
        .row.full-width.justify-center.q-pa-sm
          span.text-bold.text-white {{ link.name }}
      slot(name="tint" :item="link" :itemKey="link.id")
      //- selected
      div(
        v-if="link.id === linkSelectedId"
        :style=`{
          position: 'relative',
          marginTop: '-10px', paddingTop: '14px',
          borderRadius: '0 0 10px 10px', overflow: 'hidden',
        }`
        ).row.full-width.bg-green.q-px-xs.q-pb-xs
        q-btn(round flat dense color="green-8" icon="delete_outline" @click="linkDelete(link,li)")
        .col
        q-btn(round flat dense color="white" icon="edit" @click="linkEdit(link,li)")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'wsLinks_typeDrafts',
  props: ['searchString'],
  data () {
    return {
      linkSelectedId: null,
    }
  },
  computed: {
    query () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_JOINT,
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
    async linkDelete (link, ii) {
      this.$log('linkDelete', link, ii)
      this.$q.dialog({
        dark: true,
        title: 'Удалить ?!',
        // message: 'Это нельзя отменить',
        persistent: true,
        'content-style': { borderRadius: '10px', overflow: 'hidden' },
        ok: { flat: false, color: 'green', label: 'Удалить', 'no-caps': true },
        cancel: { flat: true, color: 'green', label: 'Отмена', 'no-caps': true },
      }).onOk(async () => {
        await this.$rxdb.remove(link.id)
      }).onCancel(() => {
      }).onDismiss(() => {
      })
    },
    linkEdit (link, ii) {
      this.$log('linkEdit', link, ii)
      this.$router.push(`/workspace/link/${link.id}`).catch(e => e)
    }
  }
}
</script>
