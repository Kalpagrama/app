<template lang="pug">
div(
  v-observe-visibility=`{
    throttle: 150,
    callback: visibilityCallback,
    intersection: {
      rootMargin: '-50% 0px',
    }
  }`
  :style=`{
    position: 'relative',
  }`
  ).row.full-width.items-start.content-start.q-py-sm.q-pr-sm
  //- line
  div(
    :style=`{
      position: 'absolute', zIndex: 1,
      left: '24px', top: '0px',
      width: '2px',
      height: isLast ? '50px' : '100%',
    }`
    ).row.b-50
  //- author
  .row.items-center.content-center.justify-center.q-pa-sm
    div(
      :style=`{
        position: 'relative', zIndex: 10,
        width: '34px', height: '34px',
      }`).row
      //- no author placeholder
      transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
        div(
          v-if="!showAuthor"
          @click="showAuthor = true"
          :style=`{
            position: 'absolute', zIndex: 20,
            borderRadius: '50%',
          }`
          ).row.fit.b-50
      //- author avatar
      img(
        v-if="showAuthor"
        @click="showAuthor = false"
        draggable="false"
        :src="joint.author.thumbUrl"
        :style=`{
          objectFit: 'cover',
          borderRadius: '50%',
          //- filter: showAuthor ? 'none' : 'blur(1px)',
        }`).fit
  //- body
  .col
    .row.full-width
      //- author name
      .row.full-width.q-pt-sm
        transition(enter-active-class="animated fadeIn" leave-active-class="none")
          span(
            v-if="showAuthor"
            :style=`{lineHeight: 1.2}`).text-white.text-bold {{ joint.author.name }}
        div(
          v-if="!showAuthor"
          :style=`{width: '150px', borderRadius: '8px', height: '16px',}`
          ).row.b-50
      .row.full-width.q-pb-sm
        span(v-if="joint.name.length > 0").text-white {{ joint.name }}
        span.text-white {{ $nodeItemType(joint.vertices[itemIndex]).name }}
      //- item-wrapper
      item-feed(
        :itemShortOrFull="item"
        :isActive="isVisible"
        :isVisible="isVisible"
        :showHeader="false"
        :showName="false")
</template>

<script>
export default {
  name: 'typeJoint',
  props: ['oidPinned', 'joint', 'isLast'],
  data () {
    return {
      isVisible: false,
      showAuthor: false,
    }
  },
  computed: {
    itemIndex () {
      return this.joint.items.findIndex(i => i.oid !== this.oidPinned)
    },
    item () {
      return this.joint.items[this.itemIndex]
    },
    // showAuthor () {}
  },
  methods: {
    visibilityCallback (isVisible, entry) {
      this.isVisible = isVisible
    }
  }
}
</script>
