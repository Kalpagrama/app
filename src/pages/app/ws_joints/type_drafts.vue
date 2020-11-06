<style lang="stylus" scoped>
.joint-item
  &:hover
    background: rgb(50,50,50)
</style>

<template lang="pug">
.row.full-width.items-start.content-start.justify-center
  div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px', minHeight: '100vh'}`).row.full-width
//- kalpa-loader(
  :immediate="true"
  :query="query" :limit="1000"
  v-slot=`{items,next}`)
  masonry(
    :cols="$q.screen.width < 800 ? 1 : 3"
    :gutter="{default: 6}").full-width.q-pr-sm
    div(
      v-for="(joint, li) in items" :key="joint.id"
      :style=`{
        position: 'relative',
        borderRadius: '10px', overflow: 'hidden',
      }`
      ).row.full-width.q-mb-md.b-40.cursor-pointer.joint-item
      //- default
      div(
        @click="jointSelectedId === joint.id ? jointSelectedId = null : jointSelectedId = joint.id"
        :style=`{
          position: 'relative', zIndex: 10,
          borderRadius: '10px', overflow: 'hidden'
        }`
        ).row.full-width.joint-item.b-40
        //- items wrapper
        .row.full-width.items-end.content-end
          div(v-for="(i,ii) in joint.items" :key="ii").col-6
            .row.full-width.justify-center.q-pa-xs
              img(
                v-if="i.item.thumbUrl"
                draggable="false"
                :src="i.item.thumbUrl"
                :style=`{
                  transform: ii === 0 ? 'perspective(600px) rotateY(10deg)' : 'perspective(600px) rotateY(-10deg)',
                  borderRadius: '10px', overflow: 'hidde n'
                }`).full-width
              .row.full-width.justify-center.q-pa-xs
                //- small.text-white {{ i.item.name.slice(0, 40) }}
        .row.full-width.justify-center.q-pa-sm
          span.text-bold.text-white {{ joint.name }}
      slot(name="tint" :item="joint" :itemKey="joint.id")
      //- selected
      div(
        v-if="joint.id === jointSelectedId"
        :style=`{
          position: 'relative',
          marginTop: '-10px', paddingTop: '14px',
          borderRadius: '0 0 10px 10px', overflow: 'hidden',
        }`
        ).row.full-width.bg-green.q-px-xs.q-pb-xs
        q-btn(round flat dense color="green-8" icon="delete_outline" @click="jointDelete(joint)")
        .col
        q-btn(round flat dense color="white" icon="edit" @click="jointEdit(joint)")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'wsJoints_typeDrafts',
  props: ['searchString'],
  data () {
    return {
      jointSelectedId: null,
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
    async jointDelete (joint) {
      this.$log('jointDelete', joint)
      // this.$q.dialog({
      //   dark: true,
      //   title: 'Удалить ?!',
      //   // message: 'Это нельзя отменить',
      //   persistent: true,
      //   'content-style': { borderRadius: '10px', overflow: 'hidden' },
      //   ok: { flat: false, color: 'green', label: 'Удалить', 'no-caps': true },
      //   cancel: { flat: true, color: 'green', label: 'Отмена', 'no-caps': true },
      // }).onOk(async () => {
      //   await this.$rxdb.remove(joint.id)
      // }).onCancel(() => {
      // }).onDismiss(() => {
      // })
      await joint.remove()
    },
    jointEdit (joint) {
      this.$log('jointEdit', joint)
      this.$router.push(`/workspace/joint/${joint.id}`).catch(e => e)
    }
  }
}
</script>
