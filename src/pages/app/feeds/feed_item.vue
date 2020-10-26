<style lang="sass" scoped>
.feed-item
  cursor: pointer
  &:hover
    background: rgb(50,50,50)
</style>

<template lang="pug">
.row.full-width.items-start.content-start
  //- header
  .row.full-width.items-center.content-center.q-py-xs.q-px-xs
    router-link(
      v-if="item.subject.type === 'USER'"
      :to="'/user/'+item.subject.oid"
      :style=`{
        height: '30px',
        borderRadius: '10px',
      }`
      ).row.items-center.content-center.q-px-xs.q-mr-sm
      img(
        draggable="false"
        :src="item.subject.thumbUrl"
        :style=`{
          width: '20px', height: '20px',
          borderRadius: '50%'}`)
      .col.full-height
        .row.fit.items-center.content-center.q-pl-sm
          small.text-grey-6 {{ item.subject.name }}
    small(v-if="item.type === 'OBJECT_CREATED'").text-grey-6.q-mr-sm создал
    small(v-else-if="item.type === 'USER_SUBSCRIBED'").text-grey-6.q-mr-sm подписался на
    small(v-else-if="item.type === 'VOTED'").text-grey-6.q-mr-sm проголосовал за
    small(v-else).text-grey-6.bg-blue {{ item.type }}
    small(v-if="item.object.type === 'NODE'").text-grey-6.q-mr-sm ядро
    small(v-else-if="item.object.type === 'JOINT'").text-grey-6.q-mr-sm связь
    small(v-else).text-grey-6.q-mr-sm {{ item.type }}
  //- object
  .row.full-width
    node-feed(v-if="object && object.type === 'NODE'" :node="object" :isActive="isActive" :isVisible="isVisible" :width="width")
    joint-feed(v-if="object && object.type === 'JOINT'" :joint="object" :isActive="isActive" :isVisible="isVisible" :width="width")
    //- VIDEO
    router-link(
      v-if="['VIDEO', 'IMAGE'].includes(item.object.type)"
      :to="'/content/'+item.object.oid"
      ).row.full-width.b-40.feed-item
      img(
        draggable="false"
        :src="item.object.thumbUrl"
        :style=`{
          height: '200px', borderRadius: '10px', overflow: 'hidden'
        }`)
      .col
        .row.fit.items-center.content-center.q-pa-md
          span.text-white {{ item.object.name }}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'feedItem',
  props: ['item', 'isActive', 'isVisible', 'width'],
  components: {
    insertEmoji: () => import('components/kalpa_icons/insert_emoji.vue')
  },
  data () {
    return {
      object: null
    }
  },
  async mounted () {
    this.$log('mounted')
    this.object = await this.$rxdb.get(RxCollectionEnum.OBJ, this.item.object.oid)
  }
}
</script>
