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
      small.text-grey-8.q-mr-xs {{ node.countViews }}
      q-icon(name="visibility" color="grey-8").q-mr-md
      small.text-grey-8.q-mr-sm {{ $date(node.createdAt, 'DD.MM.YYYY') }}
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
    //- essence
    router-link(
      :to="'/node/'+node.oid"
      ).row.full-width.justify-center.cursor-pointer.q-pa-md
      span(:style=`{fontSize: '18px'}`).text-white.text-bold.shaking.cursor-pointer {{ node.name }}
  //- footer
  .row.full-width.justify-center.items-center.content-center.q-px-sm
    div(:style=`{maxWidth: '600px'}`).row.full-width.items-center.content-center
      node-remake(:node="node")
      small.text-grey-9 {{ node.countRemakes > 100 ? '99+' : node.countRemakes }}
      .col
      q-btn(round flat color="grey-9" icon="link" @click="$router.push('/workspace/link/new')").shaking
      small.text-grey-9 {{ node.countJoints > 100 ? '99+' : node.countJoints }}
      .col
      node-share(:node="node").shaking
      .col
      small.text-grey-9 {{ node.countBookmarks > 100 ? '99+' : node.countBookmarks }}
      node-bookmark(:node="node" :isActive="isActive" :isVisible="isVisible").shaking
      .col
      small.text-grey-9 {{ node.countVotes > 100 ? '99+' : node.countVotes }}
      q-btn(round flat color="purple" icon="adjust").shaking
</template>

<script>

export default {
  name: 'nodeFeed',
  components: {
    compositionPlayer: () => import('components/composition/composition_player/index.vue'),
    nodeRemake: () => import('components/node/node_remake.vue'),
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
