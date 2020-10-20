<style lang="sass" scoped>
.feed-item
  cursor: pointer
  &:hover
    background: rgb(50,50,50)
</style>

<template lang="pug">
.row.full-width
  div(
    :style=`{
      //- background: 'rgb(35,35,35)',
      borderRadius: '10px', overflow: 'hidden'
    }`
    ).row.full-width
    //- TYPE, Reason, Subject
    div(
      :style=`{
        background: 'rgb(35,35,35)',
        marginBottom: '-10px',
        paddingBottom: '14px',
      }`
      ).row.full-width.items-center.content-center.q-pt-xs.q-px-sm
      q-btn(
        :to="'/user/'+item.subject.oid"
        flat color="white" dense no-caps
        ).q-mr-sm
        user-avatar(:url="item.subject.thumbUrl" :width="24" :height="24")
        span.text-grey-4.q-ml-sm {{ item.subject.name }}
      small.text-grey-6.q-mr-sm {{ item.type }}
      //- small.text-grey-6.q-mr-sm subject: {{ item.subject.name }}
      //- small.text-grey-6.q-mr-sm why: {{ item.matter.reason }}
      //- small.text-grey-6 to: {{ item.object.name }}
    //- OBJECT object
    div(:style=`{borderRadius: '10px',overflow: 'hidden'}`).row.full-width
      //- VIDEO
      router-link(
        v-if="['VIDEO', 'IMAGE'].includes(item.object.type)"
        :to="'/content/'+item.object.oid"
        ).row.full-width.b-40.feed-item
        img(
          draggable="false"
          :src="item.object.thumbUrl"
          :style=`{
            height: '100px', borderRadius: '10px', overflow: 'hidden'
          }`)
        .col
          .row.fit.items-center.content-center.q-pa-md
            span.text-white {{ item.object.name }}
      //- NODE
      node-feed(
        v-else-if="item.object.type === 'NODE'"
        :node="item.object" :isActive="isActive" :isVisible="isVisible"
        :marginBottom="0")
      //- WORD
      div(
        v-else-if="item.object.type === 'WORD'"
        ).row.full-width.items-center.content-center.q-pa-md
        q-icon(name="blur_on" color="white" size="30px").q-mr-sm
        span.text-bold.text-white {{ item.object.name }}
      //- JOINT
      div(
        v-else-if="item.object.type === 'JOINT'"
        ).row.full-width
        //- node-node
        div(
          v-if="item.object.leftItem.type === 'NODE' && item.object.rightItem.type === 'NODE'"
          ).row.full-width
          //- wrapper
          div(
            :style=`{borderRadius: '10px', overflow: 'hidden'}`
            ).row.full-width.b-40
            div(
              :style=`{height: '220px',}`
              ).row.full-width.q-pa-xs
              .col.full-height
                div(
                  :style=`{
                    transform: 'perspective(1000px) rotateY(10deg)',
                    borderRadius: '10px', overflow: 'hidden'}`).column.fit.b-50
                  .col.full-width
                    img(
                      :src="item.object.leftItem.items[0].thumbUrl"
                      :style=`{
                        objectFit: 'cover',
                        borderRadius: '10px', overflow: 'hidden'}`).fit
                  .row.full-width.justify-center.q-pa-sm
                    small.text-white {{ item.object.leftItem.name }}
              div(:style=`{}`).row.full-height.items-center.content-center.justify-center
                q-btn(round flat dense color="green" icon="link")
              .col.full-height
                div(
                  :style=`{
                    transform: 'perspective(1000px) rotateY(-10deg)',
                    borderRadius: '10px', overflow: 'hidden'}`).column.fit.b-50
                  .col.full-width
                    img(
                      :src="item.object.rightItem.items[0].thumbUrl"
                      :style=`{
                        objectFit: 'cover',
                        borderRadius: '10px', overflow: 'hidden'}`).fit
                  .row.full-width.justify-center.q-pa-sm
                    small.text-white {{ item.object.rightItem.name }}
            //- essence..
            div(:style=`{}`).row.full-width.justify-center.q-py-md
              span(:style=`{fontSize: '1.1rem'}`).text-white.text-bold {{ item.object.name }}
          .row.full-width.items-center.content-center.justify-between
            .row.full-height.items-center.content-center.q-pl-sm
              q-btn(
                round flat dense color="grey-8" icon="share")
              insert-emoji(color="grey-8")
            .row.full-height.items-center.content-center
              span.text-grey-6 Прямо в точку!
              q-btn(round flat color="green")
                q-icon(name="adjust" size="30px" color='green')
        //- node-sphere
        div(
          v-else-if="item.object.leftItem.type === 'NODE' && item.object.rightItem.type === 'WORD'"
          :style=`{}`
          ).row.full-width
          div(
            :style=`{borderRadius: '10px', overflow: 'hidden'}`
            ).row.full-width.q-pa-sm.b-40.q-pb-lg
            div(
              :style=`{
                transform: 'perspective(1000px) rotateY(10deg)',
                height: '200px'
                }`).col
              img(
                :src="item.object.leftItem.items[0].thumbUrl"
                :style=`{
                  objectFit: 'cover',
                  borderRadius: '10px', overflow: 'hidden'}`).fit
            div(:style=`{height: '200px',}`).row.items-center.content-center.justify-center
                  q-btn(round flat dense color="green" icon="link")
            div(
              :style=`{
                transform: 'perspective(1000px) rotateY(-10deg)',
                height: '200px'
              }`).col
              div(:style=`{borderRadius: '10px', overflow: 'hidden'}`).row.fit.items-center.content-center.justify-center.b-50
                span(:style=`{fontSize: '100px'}`).text-white {{ item.object.rightItem.name }}
          .row.full-width.items-center.content-center.justify-between
            .row.full-height.items-center.content-center.q-pl-sm
              q-btn(
                round flat dense color="grey-8" icon="share")
              insert-emoji(color="grey-8")
            .row.full-height.items-center.content-center
              span.text-grey-6 Прямо в точку!
              q-btn(round flat color="green")
                q-icon(name="adjust" size="30px" color='green')
          //- .row.full-width.q-pa-sm.b-40.br
        //- node-user
        //- node-content
        div(v-else).row.full-width
          small.text-white {{item.object}}
      //- ELSE
      div(v-else).row.full-width.bg-blue
        small.text-white {{ item.object }}
</template>

<script>
export default {
  name: 'feedItem',
  props: ['item', 'isActive', 'isVisible'],
  components: {
    insertEmoji: () => import('components/kalpa_icons/insert_emoji.vue')
  },
  data () {
    return {
    }
  }
}
</script>
