<template lang="pug">
.row.full-width.items-start.content-start
  div(
    :style=`{
      background: 'rgb(35,35,35)',
      borderRadius: '10px', overflow: 'hidden',
    }`).row.full-width
    //- header: author, createdAt
    .row.full-width.items-center.content-center.q-pa-sm
      q-btn(
        :to="'/user/'+node.author.oid"
        flat color="white" dense no-caps
        )
        user-avatar(:url="node.author.thumbUrl" :width="24" :height="24")
        span.text-grey-4.q-ml-sm {{ node.author.name }}
      .col
      small.text-grey-8.q-mr-xs 11922
      q-icon(name="visibility" color="grey-8").q-mr-md
      .text-grey-8.q-mr-sm {{ $date(node.createdAt, 'DD.MM.YYYY') }}
    //- items wrapper
    .row.full-width
      //- SLIDER
      div(
        v-if="node.layout === 'SLIDER'"
        :style=`{
          position: 'relative',
          borderRadius: '10px', overflow: 'hidden',
        }`).row.full-width.items-start.content-start
        list-slider(:items="node.items")
          template(v-slot:item=`{item, isActive: itemActive}`)
            div(
              :style=`{
                position: 'relative',
                borderRadius: '10px', overflow: 'hidden',
              }`
              ).row.fit.b-40.shadow-5
              composition-player(
                :composition="item" :isVisible="isVisible" :isActive="isActive && itemActive"
                :options=`{height: '100%', objectFit: 'cover', loop: true}`)
              //- q-btn(
                round flat color="grey-2" icon="select_all" no-caps
                :style=`{
                  position: 'absolute', zIndex: 1000,
                  left: '4px', top: '4px',
                  background: 'rgba(0,0,0,0.25)'
                }`
                ).q-px-sm {{ contentName }}
              //- img(
                :src="item.thumbUrl"
                :style=`{
                  objectFit: 'cover',
                }`
                ).fit
              //- video(
                v-if="isActive && itemActive && item.outputType === 'VIDEO'"
                :src="item.url"
                muted autoplay playsinline loop
                :style=`{
                  position: 'absolute', zIndex: 100,
                  objectFit: 'cover',
                  borderRadius: '10px', overflow: 'hidden',
                }`
                ).fit
      //- PIP, VERTICAL
      div(
        v-if="['PIP', 'VERTICAL'].includes(node.layout)"
        :style=`{
          position: 'relative',
          borderRadius: '10px', overflow: 'hidden',
        }`
        ).row.full-width.items-start.content-start
        composition-player(
          :composition="node.items[0]" :isVisible="isVisible" :isActive="isActive"
          :options=`{height: 'auto', objectFit: 'contain'}`)
        //- img(
          :src="node.items[0].thumbUrl"
          :style=`{
            objectFit: 'contain'
          }`
          ).full-width
    //- essence
    router-link(
      :to="'/node/'+node.oid"
      ).row.full-width.justify-center.cursor-pointer.q-pa-md
      span(:style=`{fontSize: '18px'}`).text-white.text-bold.shaking.cursor-pointer {{ node.name }}
  //- footer
  .row.full-width.justify-center.items-center.content-center.q-px-sm
    div(:style=`{maxWidth: '600px'}`).row.full-width.items-center.content-center
      //- q-btn(round flat color="grey-9" icon="cached").shaking
      node-renode(:node="node")
      small.text-grey-9 12
      .col
      q-btn(round flat color="grey-9" icon="link" @click="$router.push('/workspace/link/new')").shaking
      small.text-grey-9 12
      .col
      //- q-btn(round flat color="grey-9" icon="share").shaking
      node-share(:node="node").shaking
      .col
      small.text-grey-9 12
      node-bookmark(:node="node" :isActive="isActive" :isVisible="isVisible").shaking
      //- q-btn(round flat color="grey-9" icon="bookmark_outline").shaking
      .col
      small.text-grey-9 12
      q-btn(round flat color="purple" icon="adjust").shaking
</template>

<script>

export default {
  name: 'nodeFeed',
  components: {
    compositionPlayer: () => import('components/composition/composition_player/index.vue'),
    nodeRenode: () => import('components/node/node_renode.vue'),
    nodeBookmark: () => import('components/node/node_bookmark.vue'),
    nodeShare: () => import('components/node/node_share.vue')
  },
  props: ['node', 'isActive', 'isVisible'],
  data () {
    return {
    }
  },
  computed: {
    contentName () {
      return 'Some content name'
    }
  }
}
</script>
