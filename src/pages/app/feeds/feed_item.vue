<style lang="sass" scoped>
.feed-item
  cursor: pointer
  &:hover
    background: rgb(50,50,50)
</style>

<template lang="pug">
.row.full-width.items-start.content-start
  //- header
  div(
    :style=`{
      borderRadius: '10px 10px 0 0',
      background: 'rgb(32,32,32)',
      marginBottom: '-20px',
      paddingBottom: '20px',
    }`
    ).row.full-width.items-center.content-center.q-pt-xs.q-px-xs
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
          marginLeft: '2px',
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
    small(v-else-if="item.object.type === 'USER'")
    small(v-else).text-grey-6.q-mr-sm {{ item.object.type }}
  //- object
  .row.full-width
    node-feed(v-if="object && object.type === 'NODE'" :node="object" :isActive="isActive" :isVisible="isVisible" :width="width")
    joint-feed(v-else-if="object && object.type === 'JOINT'" :joint="object" :isActive="isActive" :isVisible="isVisible" :width="width")
    //- VIDEO
    router-link(
      v-else-if="['VIDEO', 'IMAGE'].includes(item.object.type)"
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
    router-link(
      v-else-if="item.object.type === 'USER'"
      :to="'/user/'+item.object.oid"
      :style=`{
        borderRadius: '10px'
      }`
      ).row.full-width.items-center.content-center.b-40.q-pa-sm
      img(
        draggable="false"
        :src="item.object.thumbUrl"
        :style=`{width: '40px', height: '40px', borderRadius: '50%',}`)
      .col.q-px-sm
        span.text-white {{ item.object.name }}
    //- object fallback
    div(v-else).row.full-width.bg-blue
      small.text-white {{ item.object }}
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
